from http.server import BaseHTTPRequestHandler
import json
import requests
import urllib.parse
import time
import os # Import os to potentially access environment variables later if needed

class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        # --- Remove deliberate error --- 
        # raise Exception("DELIBERATE TEST ERROR - Check Vercel Logs")
        # -------------------------------
        
        start_time = time.time()
        print("--- Function Start ---", flush=True)
        
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body)
            url = data.get('url')
            print(f"Received URL: {url}", flush=True)
        except json.JSONDecodeError:
            print("ERROR: Invalid JSON received", flush=True)
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid JSON'}).encode('utf-8'))
            return

        if not url or not self.is_valid_url(url):
            print(f"ERROR: Invalid or missing URL: {url}", flush=True)
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid or missing URL'}).encode('utf-8'))
            return

        # Construct Microlink API URL
        # We might need to add '&palette' or '&audio', '&video' later if needed
        microlink_api_url = f"https://api.microlink.io/?url={urllib.parse.quote(url)}"
        print(f"Calling Microlink API: {microlink_api_url}", flush=True)
        
        # Optional: Prepare headers if API key is needed later
        # headers = {
        #     'Authorization': f'Bearer {os.environ.get("MICROLINK_API_KEY")}'
        # }
        headers = {} # No headers needed for basic request for now

        try:
            # Call Microlink API
            fetch_start = time.time()
            response = requests.get(microlink_api_url, headers=headers, timeout=15) # Increased timeout slightly for external API
            fetch_end = time.time()
            print(f"Microlink API call took {fetch_end - fetch_start:.2f} seconds. Status: {response.status_code}", flush=True)
            response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)

            # Parse the JSON response from Microlink
            metadata = response.json()

            # Extract data (Microlink uses slightly different field names)
            # Check data.status == 'success'?
            if metadata.get('status') == 'success':
                api_data = metadata.get('data', {})
                title = api_data.get('title', url) # Fallback to original URL if title missing
                # Microlink often provides image URL in image.url
                image_info = api_data.get('image')
                image_url = image_info.get('url') if image_info else None
                
                print(f"Microlink success. Title: {title}, Image URL: {image_url}", flush=True)
                result = {'title': title, 'imageUrl': image_url}
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
            else:
                # Microlink reported failure
                error_message = metadata.get('message', 'Microlink failed to process URL')
                print(f"ERROR: Microlink API failed for {url}. Message: {error_message}", flush=True)
                # Return original URL as title, no image
                result = {'title': url, 'imageUrl': None}
                self.send_response(200) # Send 200 but with fallback data
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))

        except requests.exceptions.RequestException as e:
            # Error calling Microlink API itself
            print(f"ERROR calling Microlink API for {url}: {e}", flush=True)
            result = {'title': url, 'imageUrl': None}
            print(f"Sending fallback response due to Microlink API call error: {result}", flush=True)
            self.send_response(200) 
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
        except Exception as e:
             # Unexpected error during processing
             print(f"ERROR processing Microlink response for {url}: {e}", flush=True)
             print(f"Sending 500 response due to unexpected error", flush=True)
             self.send_response(500)
             self.send_header('Content-type', 'application/json')
             self.end_headers()
             self.wfile.write(json.dumps({'error': 'Internal server error'}).encode('utf-8'))
             
        finally:
             end_time = time.time()
             print(f"--- Function End. Total Time: {end_time - start_time:.2f} seconds ---", flush=True)
             
    def is_valid_url(self, url):
        try:
            result = urllib.parse.urlparse(url)
            return all([result.scheme, result.netloc])
        except ValueError:
            return False

# This setup allows Vercel to run the handler class. 