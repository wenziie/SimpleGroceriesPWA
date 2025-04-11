from http.server import BaseHTTPRequestHandler
import json
import requests
from bs4 import BeautifulSoup
import urllib.parse
import time # Import time for logging duration

class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        start_time = time.time()
        print("--- Function Start ---")
        
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body)
            url = data.get('url')
            print(f"Received URL: {url}")
        except json.JSONDecodeError:
            print("ERROR: Invalid JSON received")
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid JSON'}).encode('utf-8'))
            return

        if not url or not self.is_valid_url(url):
            print(f"ERROR: Invalid or missing URL: {url}")
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid or missing URL'}).encode('utf-8'))
            return

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        try:
            print(f"Fetching URL: {url}")
            fetch_start = time.time()
            response = requests.get(url, headers=headers, timeout=10)
            fetch_end = time.time()
            print(f"Fetched URL in {fetch_end - fetch_start:.2f} seconds. Status: {response.status_code}")
            response.raise_for_status()

            print("Parsing HTML...")
            parse_start = time.time()
            soup = BeautifulSoup(response.content, 'lxml')
            parse_end = time.time()
            print(f"Parsed HTML in {parse_end - parse_start:.2f} seconds")

            # Try fetching Open Graph title first
            og_title = soup.find('meta', property='og:title')
            title = og_title['content'] if og_title else None

            # Fallback to <title> tag
            if not title:
                title_tag = soup.find('title')
                if title_tag:
                    title = title_tag.string.strip()

            # Try fetching Open Graph image
            og_image = soup.find('meta', property='og:image')
            image_url = og_image['content'] if og_image else None
            
            # Fallback: Look for high-resolution link rel image (less common)
            if not image_url:
                link_image = soup.find('link', rel='image_src')
                if link_image:
                    image_url = link_image['href']
            
             # Make image URL absolute if it's relative
            if image_url:
                 image_url = urllib.parse.urljoin(url, image_url)
                 print(f"Found image URL: {image_url}")
            else:
                 print("No image URL found")

            # If still no title, use the original URL as fallback
            if not title:
                title = url
                print(f"No title found, using URL as title")
            else:
                 print(f"Found title: {title}")
                
            result = {'title': title, 'imageUrl': image_url}
            print(f"Sending success response: {result}")
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))

        except requests.exceptions.RequestException as e:
            print(f"ERROR fetching URL {url}: {e}")
            result = {'title': url, 'imageUrl': None}
            print(f"Sending fallback response due to fetch error: {result}")
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
        except Exception as e:
             print(f"ERROR processing URL {url}: {e}")
             print(f"Sending 500 response due to unexpected error")
             self.send_response(500)
             self.send_header('Content-type', 'application/json')
             self.end_headers()
             self.wfile.write(json.dumps({'error': 'Internal server error'}).encode('utf-8'))
             
        finally:
             end_time = time.time()
             print(f"--- Function End. Total Time: {end_time - start_time:.2f} seconds ---")
             
    def is_valid_url(self, url):
        try:
            result = urllib.parse.urlparse(url)
            return all([result.scheme, result.netloc])
        except ValueError:
            return False

# This setup allows Vercel to run the handler class. 