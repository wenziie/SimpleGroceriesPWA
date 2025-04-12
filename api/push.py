import os
import json
import redis
import time
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from pywebpush import webpush, WebPushException

# --- Configuration ---
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY")
VAPID_SUBJECT = os.environ.get("VAPID_SUBJECT") # Your mailto: email
KV_URL = os.environ.get("KV_URL")

# --- Vercel KV Connection ---
try:
    if not KV_URL:
        raise ValueError("KV_URL environment variable not set.")
    kv = redis.from_url(KV_URL)
    # Test connection
    kv.ping() 
    print("Successfully connected to Vercel KV.", flush=True)
except redis.exceptions.ConnectionError as e:
    print(f"ERROR: Could not connect to Vercel KV: {e}", flush=True)
    kv = None # Set kv to None if connection fails
except ValueError as e:
    print(f"ERROR: {e}", flush=True)
    kv = None
except Exception as e: # Catch any other potential errors during connection
    print(f"ERROR: An unexpected error occurred connecting to Vercel KV: {e}", flush=True)
    kv = None

# --- KV Keys ---
SUB_KEY = "active_reminder_sub"
TS_KEY = "active_reminder_ts"


class handler(BaseHTTPRequestHandler):

    def _send_response(self, status_code, body_dict):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*') # Allow frontend
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(body_dict).encode('utf-8'))

    def _parse_body(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            return json.loads(body)
        except json.JSONDecodeError:
            return None
        except Exception as e:
            print(f"Error parsing request body: {e}", flush=True)
            return None

    # Handle CORS preflight requests
    def do_OPTIONS(self):
        self.send_response(204) # No Content
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        if path == '/api/push/subscribe':
            if not kv:
                self._send_response(500, {"error": "KV store not available"})
                return

            body = self._parse_body()
            if not body or 'subscription' not in body or 'timestamp' not in body:
                self._send_response(400, {"error": "Missing 'subscription' or 'timestamp' in request body"})
                return

            subscription_info = body['subscription']
            timestamp_ms = body['timestamp'] # Expecting timestamp in milliseconds

            # Validate timestamp
            try:
                # Convert ms to seconds for storage if preferred, or keep as ms
                timestamp_sec = int(timestamp_ms) / 1000
                if timestamp_sec <= time.time():
                     self._send_response(400, {"error": "Timestamp is in the past"})
                     return
            except (ValueError, TypeError):
                 self._send_response(400, {"error": "Invalid timestamp format"})
                 return

            print(f"Received subscription request for time: {timestamp_sec}", flush=True)

            try:
                # Store subscription and timestamp (overwrite existing)
                kv.set(SUB_KEY, json.dumps(subscription_info))
                kv.set(TS_KEY, str(timestamp_sec)) # Store as string
                print("Stored subscription and timestamp in KV.", flush=True)
                self._send_response(201, {"success": True})
            except redis.exceptions.RedisError as e:
                print(f"ERROR: Failed to save reminder to KV: {e}", flush=True)
                self._send_response(500, {"error": "Failed to save reminder"})
            except Exception as e:
                print(f"ERROR: Unexpected error saving to KV: {e}", flush=True)
                self._send_response(500, {"error": "An unexpected error occurred"})

        else:
            self._send_response(404, {"error": "Not Found"})

    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # Endpoint triggered by Vercel Cron Job
        if path == '/api/push/send_all': 
            if not kv:
                print("WARN: Cron job running but KV store not available.", flush=True)
                self._send_response(500, {"status": "KV store not available"})
                return
                
            if not VAPID_PRIVATE_KEY or not VAPID_SUBJECT:
                print("ERROR: VAPID keys not configured on server.", flush=True)
                self._send_response(500, {"status": "VAPID keys not configured"})
                return

            print("Cron job '/api/push/send_all' triggered.", flush=True)

            try:
                # Get the single active reminder timestamp and subscription
                timestamp_str = kv.get(TS_KEY)
                sub_info_str = kv.get(SUB_KEY)

                if timestamp_str and sub_info_str:
                    timestamp_sec = float(timestamp_str)
                    current_time_sec = time.time()

                    print(f"Checking reminder. Current time: {current_time_sec}, Reminder time: {timestamp_sec}", flush=True)

                    if current_time_sec >= timestamp_sec:
                        print("Reminder time reached. Preparing to send push notification.", flush=True)
                        sub_info = json.loads(sub_info_str)
                        
                        notification_payload = json.dumps({
                            "title": "Simple Groceries Påminnelse",
                            "body": "Dags att kolla din inköpslista!",
                        })

                        try:
                            webpush(
                                subscription_info=sub_info,
                                data=notification_payload,
                                vapid_private_key=VAPID_PRIVATE_KEY,
                                vapid_claims={"sub": VAPID_SUBJECT}
                            )
                            print("Push notification sent successfully.", flush=True)
                            # Remove the reminder after sending
                            kv.delete(TS_KEY, SUB_KEY)
                            print("Reminder deleted from KV.", flush=True)
                        
                        except WebPushException as e:
                            print(f"WebPushException: {e}", flush=True)
                            # Handle expired or invalid subscriptions
                            if e.response and e.response.status_code == 410: # Gone
                                print("Subscription is expired or invalid. Removing.", flush=True)
                                kv.delete(TS_KEY, SUB_KEY) 
                            else:
                                # Log other push errors but maybe don't delete immediately?
                                print(f"Failed to send push notification: {e.response.text if e.response else 'No response'}", flush=True)
                                # Optionally retry later? For now, just log.
                        except Exception as e:
                             print(f"ERROR: Unexpected error sending push: {e}", flush=True)
                        
                    else:
                         print("Reminder time not yet reached.", flush=True)
                else:
                    print("No active reminder found in KV.", flush=True)
                
                self._send_response(200, {"status": "Cron job executed"})

            except redis.exceptions.RedisError as e:
                print(f"ERROR: Failed to access KV during cron job: {e}", flush=True)
                self._send_response(500, {"status": "KV access error"})
            except Exception as e:
                 print(f"ERROR: Unexpected error during cron job: {e}", flush=True)
                 self._send_response(500, {"status": f"Unexpected error: {e}"})

        else:
            self._send_response(404, {"error": "Not Found"})

# Example for local testing (not used by Vercel)
# if __name__ == '__main__':
#     from http.server import HTTPServer
#     server = HTTPServer(('localhost', 8000), handler)
#     print('Starting server at http://localhost:8000')
#     server.serve_forever() 