from http.server import BaseHTTPRequestHandler
import json
import requests
import urllib.parse
import time
from bs4 import BeautifulSoup
import extruct # For extracting embedded metadata
import re # For cleaning ingredient text
import os # Import os to potentially access environment variables later if needed

# --- Helper Functions for Parsing ---

def extract_json_ld(html_content, url):
    """Extracts JSON-LD metadata, specifically looking for Recipe schema."""
    print(f"Attempting JSON-LD extraction for {url}", flush=True)
    try:
        # Use extruct to find all JSON-LD blocks
        metadata = extruct.extract(html_content, base_url=url, syntaxes=['json-ld'], uniform=True)
        
        if not metadata or 'json-ld' not in metadata or not metadata['json-ld']:
             print("No JSON-LD metadata found.", flush=True)
             return None

        # Find the first item that looks like a Recipe
        for item in metadata['json-ld']:
            if isinstance(item, dict):
                 # Check for '@type' being 'Recipe' or a list containing 'Recipe'
                 item_type = item.get('@type', '')
                 is_recipe = False
                 if isinstance(item_type, list):
                     is_recipe = 'Recipe' in item_type or 'http://schema.org/Recipe' in item_type
                 elif isinstance(item_type, str):
                     is_recipe = item_type == 'Recipe' or item_type == 'http://schema.org/Recipe'
                 
                 if is_recipe:
                    print(f"Found JSON-LD Recipe object for {url}", flush=True)
                    return item # Return the whole recipe object
        
        print(f"No JSON-LD object with @type 'Recipe' found for {url}", flush=True)
        return None
    except Exception as e:
        print(f"Error during JSON-LD extraction for {url}: {e}", flush=True)
        return None

def get_image_url(recipe_data, source_url):
    """Extracts image URL from JSON-LD data (can be complex)."""
    if not recipe_data or not isinstance(recipe_data, dict):
        return None

    image_info = recipe_data.get('image')
    
    if not image_info:
        return None

    # Handle various image structures used by schema.org
    if isinstance(image_info, str):
        return urllib.parse.urljoin(source_url, image_info) # Make relative URLs absolute
    elif isinstance(image_info, dict):
        # Common patterns: {'url': '...'}, {'@id': '...'}
        img_url = image_info.get('url') or image_info.get('@id')
        return urllib.parse.urljoin(source_url, img_url) if img_url else None
    elif isinstance(image_info, list) and image_info:
        # Take the first image if it's a list
        first_image = image_info[0]
        if isinstance(first_image, str):
             return urllib.parse.urljoin(source_url, first_image)
        elif isinstance(first_image, dict):
             img_url = first_image.get('url') or first_image.get('@id')
             return urllib.parse.urljoin(source_url, img_url) if img_url else None
            
    return None # No usable image found

def get_ingredients_from_json_ld(recipe_data):
    """Extracts ingredients from the 'recipeIngredient' field."""
    if not recipe_data or not isinstance(recipe_data, dict):
        return []
        
    ingredients = recipe_data.get('recipeIngredient', [])
    if isinstance(ingredients, list) and all(isinstance(i, str) for i in ingredients):
         print(f"Found {len(ingredients)} ingredients via JSON-LD recipeIngredient.", flush=True)
         # Basic cleaning: remove extra whitespace
         return [re.sub(r'\\s+', ' ', ing).strip() for ing in ingredients if ing.strip()]
    else:
        print(f"JSON-LD found, but 'recipeIngredient' field is missing or not a list of strings.", flush=True)
        return []

def clean_ingredient_text(text):
    """Cleans up extracted ingredient text."""
    # Remove leading/trailing whitespace, condense multiple spaces, remove potential unicode noise
    cleaned = re.sub(r'\\s+', ' ', text).strip()
    # Optional: remove common instructional prefixes if needed (e.g., "Optional:", "For the sauce:")
    # cleaned = re.sub(r'^Optional:|^For the [^:]+:', '', cleaned, flags=re.IGNORECASE).strip()
    return cleaned

def scrape_ingredients_fallback(html_content, url):
    """Fallback HTML scraping for specific sites and generic patterns."""
    print(f"Attempting fallback HTML scraping for {url}", flush=True)
    soup = BeautifulSoup(html_content, 'html.parser')
    ingredients = []
    scraped_successfully = False
    
    hostname = urllib.parse.urlparse(url).hostname

    try:
        # --- Specific Site Checks ---
        if 'ica.se' in hostname:
            # ICA: Often uses <div class=\"ingredients\"><ul><li>...</li></ul></div>
            # Or sometimes <div class=\"recipe-ingredients-list\">...</div>
            ingredient_section = soup.find('div', class_='ingredients') or soup.find('div', class_='recipe-ingredients-list')
            if ingredient_section:
                 items = ingredient_section.find_all('li')
                 if not items: # Check within divs if no LIs
                    items = ingredient_section.find_all('div', recursive=False) # Non-recursive to avoid nesting issues
                 ingredients = [clean_ingredient_text(item.get_text()) for item in items if item.get_text(strip=True)]
                 print(f"ICA Scraper: Found {len(ingredients)} potential ingredients.", flush=True)
                 scraped_successfully = len(ingredients) > 0
                 
        elif 'koket.se' in hostname:
             # Koket: Often uses <div class=\"recipe-ingredients\"> or similar classes, with spans/divs inside
             # Look for specific data attributes or structured lists
             ingredient_section = soup.find('div', attrs={'data-recipe-ingredient-list': True}) # More robust selector
             if not ingredient_section:
                ingredient_section = soup.find('ul', class_='ingredient-list') # Alternative
             if not ingredient_section: # Last resort class check
                 ingredient_section = soup.find('div', class_=lambda x: x and 'ingredient' in x.lower())

             if ingredient_section:
                # Find elements likely containing individual ingredients
                items = ingredient_section.find_all(['li', 'div', 'p'], recursive=True) # Be broad initially
                # Filter items - avoid headers, titles, etc.
                potential_ingredients = []
                for item in items:
                     text = clean_ingredient_text(item.get_text())
                     # Simple heuristic: ignore very short strings or section titles
                     if text and len(text) > 3 and not item.find(['h1', 'h2', 'h3', 'h4']):
                         potential_ingredients.append(text)
                # Simple deduplication if necessary (due to broad search)
                ingredients = list(dict.fromkeys(potential_ingredients))
                print(f"Koket Scraper: Found {len(ingredients)} potential ingredients.", flush=True)
                scraped_successfully = len(ingredients) > 0

        elif 'arla.se' in hostname:
            # Arla: Often uses <div class=\"recipe-section__ingredients\"> or similar
            ingredient_section = soup.find('div', class_=lambda x: x and 'ingredients' in x and 'recipe' in x)
            if ingredient_section:
                # Often uses <p> tags directly under the section or within a list
                items = ingredient_section.find_all(['li', 'p'])
                ingredients = [clean_ingredient_text(item.get_text()) for item in items if item.get_text(strip=True)]
                print(f"Arla Scraper: Found {len(ingredients)} potential ingredients.", flush=True)
                scraped_successfully = len(ingredients) > 0

        # --- Generic Blog Fallback (if specific checks failed) ---
        if not scraped_successfully:
            print("Specific site scraping failed or N/A, trying generic fallback...", flush=True)
            
            # Strategy 0: Find common Recipe Card Containers first
            recipe_card_container = None
            common_card_classes = ['wprm-recipe-container', 'tasty-recipe', 'tasty-recipes', 'mv-recipe-card', 'recipe-card', 'jetpack-recipe']
            for card_class in common_card_classes:
                recipe_card_container = soup.find('div', class_=card_class)
                if recipe_card_container:
                    print(f"Generic Fallback: Found potential recipe card container: div.{card_class}", flush=True)
                    break # Found a container
            
            if recipe_card_container:
                 # Search *within* the container for ingredients
                 print("Generic Fallback: Searching within recipe card container...", flush=True)
                 ingredients_in_card = [] # Accumulate ingredients found within the card
                 
                 # Look for lists first within the card (associated with subheadings or ingredient classes)
                 for list_element in recipe_card_container.find_all(['ul', 'ol']):
                     # Check if the list seems relevant (e.g., has 'ingredient' in class or follows a heading)
                     is_relevant_list = False
                     if list_element.get('class') and any('ingredient' in c.lower() for c in list_element.get('class')):
                         is_relevant_list = True
                     else:
                         # Check if preceded by a small heading (h4, h5, h6) within the card
                         prev_heading = list_element.find_previous_sibling(['h4', 'h5', 'h6'])
                         if prev_heading:
                              is_relevant_list = True # Assume list after heading is ingredients
                              
                     if is_relevant_list:
                         print(f"Generic Fallback: Found relevant list in card: {list_element.get('class')}", flush=True)
                         items = list_element.find_all('li')
                         ingredients_in_card.extend([clean_ingredient_text(item.get_text()) for item in items if item.get_text(strip=True)])
                         
                 # Also look for divs/paragraphs with 'ingredient' class name within the card
                 ingredient_elements = recipe_card_container.find_all(['div', 'p'], class_=re.compile(r'ingredient', re.IGNORECASE))
                 for elem in ingredient_elements:
                     # Avoid double-counting if it contains a list we already processed
                     if elem.find(['ul', 'ol']):
                         continue 
                     text = clean_ingredient_text(elem.get_text())
                     if text:
                          print(f"Generic Fallback: Found relevant element in card: {elem.get('class')} - Text: {text[:50]}...", flush=True)
                          ingredients_in_card.append(text)
                     else: # Check for nested items if the div itself is empty but contains ingredients
                          nested_items = elem.find_all(['li', 'p'])
                          ingredients_in_card.extend([clean_ingredient_text(item.get_text()) for item in nested_items if item.get_text(strip=True)])
                         
                 # Use the accumulated ingredients if any were found in the card
                 if ingredients_in_card:
                      # Remove duplicates while preserving order (for Python 3.7+)
                      ingredients = list(dict.fromkeys(ingredients_in_card))
                      print(f"Generic Fallback (Recipe Card Combined Strategy): Found {len(ingredients)} total ingredients.", flush=True)
                      scraped_successfully = True
                     
            # --- Strategies 1 & 2 (Heading or Div Class across whole page) ---
            # --- Only run if recipe card strategy failed                   ---
            if not scraped_successfully:
                 print("Generic Fallback (Recipe Card Strategy) failed or N/A, trying broader page search...", flush=True)
                 # Strategy 1: Find heading + next list (existing logic)
                 found_heading_list = False
                 for heading in soup.find_all(['h2', 'h3', 'h4'], string=re.compile(r'ingredient|ingredienser', re.IGNORECASE)):
                     print(f"Generic Fallback: Found potential heading: {heading.get_text(strip=True)}", flush=True)
                     next_list = heading.find_next_sibling(['ul', 'ol'])
                     if next_list:
                         print("Generic Fallback: Found list following heading.", flush=True)
                         items = next_list.find_all('li')
                         ingredients = [clean_ingredient_text(item.get_text()) for item in items if item.get_text(strip=True)]
                         if ingredients:
                             print(f"Generic Fallback (Heading Strategy): Found {len(ingredients)} potential ingredients.", flush=True)
                             scraped_successfully = True
                             found_heading_list = True
                             break # Stop searching once a list is found this way
                 
                 # Strategy 2: Find div with class name (if strategy 1 failed) (existing logic)
                 if not found_heading_list:
                      print("Generic Fallback (Heading Strategy) failed, trying div class strategy...", flush=True)
                      # Find divs with class names containing 'ingredient'
                      ingredient_divs = soup.find_all('div', class_=re.compile(r'ingredient', re.IGNORECASE))
                      if not ingredient_divs:
                          ingredient_divs = soup.find_all('div', class_=re.compile(r'tasty-recipes-ingredients|wprm-recipe-ingredients', re.IGNORECASE))
                          
                      for div in ingredient_divs:
                          items = div.find_all(['li', 'p'], recursive=False)
                          if not items:
                              items = div.find_all('li')
                          ingredients = [clean_ingredient_text(item.get_text()) for item in items if item.get_text(strip=True)]
                          if ingredients:
                              print(f"Generic Fallback (Div Class Strategy): Found {len(ingredients)} potential ingredients in div: {div.get('class')}", flush=True)
                              scraped_successfully = True
                              break

    except Exception as e:
        print(f"Error during fallback scraping for {url}: {e}", flush=True)
        # Don't crash, just return empty list if scraping fails

    return [ing for ing in ingredients if ing] # Final filter for empty strings

# --- Main Handler Class ---

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

        # Default values
        title = url
        image_url = None
        ingredients = []
        
        headers = {
             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
             'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
             'Accept-Language': 'en-US,en;q=0.5',
             'Referer': 'https://www.google.com/', # Common referer
             'DNT': '1', # Do Not Track
             'Upgrade-Insecure-Requests': '1'
        }

        try:
            # 1. Fetch HTML content
            fetch_start = time.time()
            print(f"Fetching HTML for: {url}", flush=True)
            response = requests.get(url, headers=headers, timeout=15, allow_redirects=True)
            fetch_end = time.time()
            print(f"HTML fetch took {fetch_end - fetch_start:.2f} seconds. Status: {response.status_code}", flush=True)
            response.raise_for_status() # Ensure we got a successful response

            # Check content type - only parse HTML
            content_type = response.headers.get('Content-Type', '').lower()
            if 'html' not in content_type:
                 print(f"ERROR: Content-Type is not HTML ({content_type}), skipping parsing.", flush=True)
                 # Return defaults (URL as title)
                 self.send_response(200)
                 self.send_header('Content-type', 'application/json')
                 self.end_headers()
                 self.wfile.write(json.dumps({'title': title, 'imageUrl': image_url, 'ingredients': ingredients}).encode('utf-8'))
                 return

            html_content = response.text
            
            # 2. Try JSON-LD extraction
            json_ld_data = extract_json_ld(html_content, response.url) # Use final URL after redirects

            if json_ld_data:
                title = json_ld_data.get('name', title) # Use JSON-LD name if available
                image_url = get_image_url(json_ld_data, response.url) or image_url # Use JSON-LD image if available
                ingredients = get_ingredients_from_json_ld(json_ld_data)
                
                if ingredients:
                    print(f"Successfully extracted {len(ingredients)} ingredients via JSON-LD.", flush=True)
                else:
                    print("JSON-LD found but no ingredients extracted, attempting fallback scraping.", flush=True)
                    ingredients = scrape_ingredients_fallback(html_content, response.url)

            else:
                # 3. Fallback to HTML scraping if JSON-LD fails or is missing
                print("No JSON-LD Recipe found, attempting fallback scraping.", flush=True)
                # Attempt to get title from HTML title tag as a basic fallback
                soup_for_title = BeautifulSoup(html_content, 'html.parser')
                html_title = soup_for_title.find('title')
                og_image = soup_for_title.find('meta', property='og:image')
                
                if html_title:
                    title = clean_ingredient_text(html_title.get_text()) or title # Use cleaned title or default
                
                # Fallback image scraping using og:image
                if not image_url and og_image and og_image.get('content'):
                    image_url = urllib.parse.urljoin(response.url, og_image['content'])

                ingredients = scrape_ingredients_fallback(html_content, response.url)

            # Final result structure
            result = {'title': title, 'imageUrl': image_url, 'ingredients': ingredients}
            print(f"Final result: Title='{result['title']}', Image={'Yes' if result['imageUrl'] else 'No'}, Ingredients={len(result['ingredients'])}", flush=True)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))

        except requests.exceptions.Timeout:
             print(f"ERROR: Timeout fetching URL: {url}", flush=True)
             self.send_response(408)
             self.send_header('Content-type', 'application/json')
             self.end_headers()
             self.wfile.write(json.dumps({'error': 'Timeout fetching recipe URL', 'title': url, 'imageUrl': None, 'ingredients': []}).encode('utf-8'))
        except requests.exceptions.RequestException as e:
            print(f"ERROR fetching URL {url}: {e}", flush=True)
            # Return default title, no image/ingredients, but maybe a specific error status?
            # For now, return 200 with defaults to avoid breaking frontend logic that expects title/imageUrl
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': f'Failed to fetch recipe: {e}', 'title': url, 'imageUrl': None, 'ingredients': []}).encode('utf-8'))
        except Exception as e:
            # Catch-all for unexpected errors during parsing etc.
            print(f"ERROR processing URL {url}: {e}", flush=True)
            import traceback
            traceback.print_exc() # Print full traceback to logs
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Internal server error processing recipe'}).encode('utf-8'))

        finally:
             end_time = time.time()
             print(f"--- Function End. Total Time: {end_time - start_time:.2f} seconds ---", flush=True)
             
    def is_valid_url(self, url):
        """Checks if a string is a valid HTTP/HTTPS URL."""
        try:
            result = urllib.parse.urlparse(url)
            return all([result.scheme in ['http', 'https'], result.netloc]) # Check scheme too
        except ValueError:
            return False

    def _send_response(self, status_code, body_dict):
        """Helper to send JSON responses."""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*') # Basic CORS for Vercel dev
        self.end_headers()
        self.wfile.write(json.dumps(body_dict).encode('utf-8'))

# This setup allows Vercel to run the handler class. 