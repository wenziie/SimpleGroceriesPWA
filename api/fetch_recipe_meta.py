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

# --- Log raw HTML content for debugging Coop ---
# def log_raw_html(url, content):
#     if 'coop.se' in url:
#         print(f"--- DEBUG: Raw HTML start for {url} ---", flush=True)
#         print(content[:1000]) # Print first 1000 characters
#         print("--- DEBUG: End Raw HTML start ---", flush=True)

# -----------------------------------------------

def extract_json_ld(html_content, url):
    """Extracts JSON-LD metadata, specifically looking for Recipe schema."""
    # log_raw_html(url, html_content) # Removed logging call
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

        elif 'coop.se' in hostname:
            # Coop: Uses <div class="IngredientList-content"> containing <ul class="List List--section"> with <li class="u-paddingHxsm u-textNormal u-colorBase"> items
            ingredient_content = soup.find('div', class_='IngredientList-content')
            if ingredient_content:
                # Find all relevant li elements within the content div
                items = ingredient_content.find_all('li', class_='u-paddingHxsm u-textNormal u-colorBase')
                ingredients = [clean_ingredient_text(item.get_text()) for item in items if item.get_text(strip=True)]
                print(f"Coop Scraper: Found {len(ingredients)} potential ingredients.", flush=True)
                scraped_successfully = len(ingredients) > 0
            else:
                print("Coop Scraper: Could not find 'IngredientList-content' div.", flush=True)

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
                 # Search *within* the container for ingredients, stopping at instructions
                 print("Generic Fallback: Searching within recipe card container...", flush=True)
                 ingredients_in_card = []
                 stop_collecting = False
                 instruction_keywords = re.compile(r'instruction|method|anvisning|gör så här|directions|preparation', re.IGNORECASE)
                 
                 # Iterate through relevant elements within the card IN ORDER
                 for element in recipe_card_container.find_all(['ul', 'ol', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div']):
                     if stop_collecting:
                         break
                         
                     # 1. Check if this element is an instruction heading
                     if element.name in ['h2', 'h3', 'h4', 'h5', 'h6'] and instruction_keywords.search(element.get_text()):
                         print(f"Generic Fallback: Found instruction heading '{element.get_text(strip=True)}'. Stopping ingredient collection.", flush=True)
                         stop_collecting = True
                         continue # Don't process this heading as ingredients
                         
                     # 2. Check if it's a relevant ingredient list
                     is_relevant_list = False
                     if element.name in ['ul', 'ol']:
                         if element.get('class') and any('ingredient' in c.lower() for c in element.get('class')):
                              is_relevant_list = True
                         else:
                              prev_heading = element.find_previous_sibling(['h4', 'h5', 'h6'])
                              if prev_heading and not instruction_keywords.search(prev_heading.get_text()): # Ensure it's not instruction heading
                                  is_relevant_list = True

                     if is_relevant_list:
                          print(f"Generic Fallback: Found relevant list in card: {element.get('class')}", flush=True)
                          items = element.find_all('li')
                          ingredients_in_card.extend([clean_ingredient_text(item.get_text()) for item in items if item.get_text(strip=True)])
                          continue # Processed as a list
                          
                     # 3. Check if it's a relevant ingredient div/paragraph
                     is_relevant_element = False
                     if element.name in ['div', 'p']:
                          element_class_text = " ".join(element.get('class', [])).lower()
                          # Check for ingredient class AND ensure it doesn't contain lists itself
                          if re.search(r'ingredient', element_class_text) and not element.find(['ul', 'ol']):
                               # Avoid adding the text of the main recipe card container itself if it matched
                               is_main_card_container = any(card_class in element.get('class', []) for card_class in common_card_classes if card_class in element.get('class', []))
                               if not is_main_card_container:
                                    is_relevant_element = True

                     if is_relevant_element:
                          text = clean_ingredient_text(element.get_text())
                          # Add a heuristic check: avoid overly long text which might be the whole section
                          if text and len(text) < 150: # Arbitrary limit, adjust if needed
                               print(f"Generic Fallback: Found relevant element in card: {element.get('class')} - Text: {text[:50]}...", flush=True)
                               ingredients_in_card.append(text)
                          # Keep the check for nested items if the element itself is empty
                          elif not text:
                               nested_items = element.find_all(['li', 'p'])
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

        # --- Fetch HTML Content --- #
        try:
            print(f"Fetching HTML for: {url}", flush=True)
            start_time = time.time()
            response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10) # Add User-Agent
            response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
            html_content = response.text
            fetch_duration = time.time() - start_time
            print(f"HTML fetch took {fetch_duration:.2f} seconds. Status: {response.status_code}", flush=True)

        except requests.exceptions.RequestException as e:
            print(f"Error fetching URL {url}: {e}", flush=True)
            # Return raw HTML as None and error state if fetch fails
            self._send_response(500, {"error": f"Failed to fetch URL: {e}", "title": url, "imageUrl": None, "ingredients": []})
            return
        except Exception as e: # Catch potential unexpected errors during fetch setup
            print(f"Unexpected error during fetch setup for {url}: {e}", flush=True)
            self._send_response(500, {"error": f"Unexpected error: {e}", "title": url, "imageUrl": None, "ingredients": []})
            return

        # --- Attempt Metadata Extraction --- #
        title = url # Default title
        image_url = None
        ingredients = []
        
        # 1. Try JSON-LD
        json_ld_data = extract_json_ld(html_content, url)
        if json_ld_data:
            title = json_ld_data.get('name', title)
            image_url = get_image_url(json_ld_data, url)
            ingredients = get_ingredients_from_json_ld(json_ld_data)
            
            # If JSON-LD worked, we might have found everything
            if ingredients:
                print(f"Success via JSON-LD for {url}", flush=True)
                self._send_response(200, {"title": title, "imageUrl": image_url, "ingredients": ingredients})
                return
            else:
                 print(f"JSON-LD found for {url}, but no ingredients. Proceeding to fallback scraping.", flush=True)
        else:
            print(f"No JSON-LD Recipe found for {url}, attempting fallback scraping.", flush=True)

        # 2. Fallback HTML Scraping (if JSON-LD failed or yielded no ingredients)
        # Ensure title/image from JSON-LD (if any) are kept if scraping fails later
        try:
            fallback_ingredients = scrape_ingredients_fallback(html_content, url)
            # Only overwrite ingredients if fallback scraping was successful
            if fallback_ingredients:
                ingredients = fallback_ingredients
                print(f"Success via Fallback Scraping for {url}", flush=True)
            else:
                print(f"Fallback scraping did not find ingredients for {url}", flush=True)
            
            # Try to find title/image via basic meta tags if JSON-LD didn't provide them
            if title == url or not image_url:
                 soup = BeautifulSoup(html_content, 'html.parser')
                 if title == url:
                     og_title = soup.find('meta', property='og:title')
                     if og_title and og_title.get('content'):
                         title = og_title['content']
                     else:
                         html_title = soup.find('title')
                         if html_title:
                             title = html_title.string
                 if not image_url:
                     og_image = soup.find('meta', property='og:image')
                     if og_image and og_image.get('content'):
                         image_url = urllib.parse.urljoin(url, og_image['content']) 

        except Exception as e:
            print(f"Error during fallback scraping for {url}: {e}", flush=True)
            # Don't crash, just use whatever we got before the error (or defaults)
            # Fallback scraping errors shouldn't prevent returning basic info + raw HTML

        print(f"Final result: Title='{title}', Image={'Yes' if image_url else 'No'}, Ingredients={len(ingredients)}", flush=True)
        # Always return raw_html, along with parsed results (which might be empty)
        self._send_response(200, {"title": title, "imageUrl": image_url, "ingredients": ingredients})

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