from http.server import BaseHTTPRequestHandler
import json
import requests
from bs4 import BeautifulSoup
import urllib.parse

class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body)
            url = data.get('url')
        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid JSON'}).encode('utf-8'))
            return

        if not url or not self.is_valid_url(url):
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid or missing URL'}).encode('utf-8'))
            return

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        try:
            response = requests.get(url, headers=headers, timeout=10) # Added timeout
            response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)

            soup = BeautifulSoup(response.content, 'lxml')

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

            # If still no title, use the original URL as fallback
            if not title:
                title = url
                
            result = {'title': title, 'imageUrl': image_url}
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))

        except requests.exceptions.RequestException as e:
            print(f"Error fetching URL {url}: {e}") # Log error server-side
            # Return URL as title on fetch error
            result = {'title': url, 'imageUrl': None}
            self.send_response(200) # Send 200 but with fallback data
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
        except Exception as e:
             print(f"Error processing URL {url}: {e}") # Log unexpected error
             # Generic error response
             self.send_response(500)
             self.send_header('Content-type', 'application/json')
             self.end_headers()
             self.wfile.write(json.dumps({'error': 'Internal server error'}).encode('utf-8'))
             
    def is_valid_url(self, url):
        try:
            result = urllib.parse.urlparse(url)
            return all([result.scheme, result.netloc])
        except ValueError:
            return False

# This setup allows Vercel to run the handler class. 