import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const app = express();
const PORT = process.env.PORT || 3001; // Use port 3001 for the backend

// --- Middleware ---
// Enable CORS for all origins (for development)
// In production, you might want to restrict this to your frontend's URL
app.use(cors());
// Middleware to parse JSON bodies (though we might not need it for GET)
app.use(express.json());

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Recipe Parser Backend is running!');
});

// Placeholder for recipe parsing endpoint
app.get('/parse-recipe', async (req, res) => {
  const recipeUrl = req.query.url;

  if (!recipeUrl) {
    return res.status(400).json({ error: 'URL query parameter is required' });
  }

  console.log(`Received request to parse: ${recipeUrl}`);

  try {
    console.log("Fetching URL...");
    // Add headers to mimic a browser request, which can help avoid blocks
    const response = await fetch(recipeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for URL: ${recipeUrl}`);
    }

    const html = await response.text();
    console.log("Parsing HTML...");
    const dom = new JSDOM(html);
    const document = dom.window.document;

    let ingredients = [];

    // --- Strategy 1: Look for JSON-LD Recipe data ---
    console.log("Trying JSON-LD strategy...");
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => {
      try {
        const jsonData = JSON.parse(script.textContent);
        // Check if it's a Recipe object or an array containing a Recipe
        const recipeData = Array.isArray(jsonData) 
          ? jsonData.find(item => item['@type'] === 'Recipe') 
          : (jsonData['@type'] === 'Recipe' ? jsonData : null);
        
        if (recipeData && recipeData.recipeIngredient) {
          console.log("Found Recipe JSON-LD!");
          ingredients = recipeData.recipeIngredient.map(ing => 
             // Clean up potential HTML tags or extra whitespace
             ing.replace(/<[^>]*>/g, '').trim()
          );
        }
      } catch (e) {
        // Ignore parsing errors for non-recipe JSON-LD
        // console.warn("Error parsing JSON-LD:", e);
      }
    });

    // --- Strategy 2: Look for common ingredient list selectors (if JSON-LD failed) ---
    if (ingredients.length === 0) {
      console.log("JSON-LD failed, trying common selectors...");
      const selectors = [
        '.recipe-ingredients li', 
        '.ingredients li', 
        '.ingredient-list li', 
        '[itemprop="recipeIngredient"]', // Schema.org microdata
         // Add more selectors based on common recipe site structures
      ];

      for (const selector of selectors) {
        const listItems = document.querySelectorAll(selector);
        if (listItems.length > 0) {
          console.log(`Found ingredients using selector: ${selector}`);
          ingredients = Array.from(listItems).map(li => 
             li.textContent.replace(/\s+/g, ' ').trim() // Clean whitespace
          ).filter(text => text.length > 0); // Filter out empty lines
          break; // Stop after finding the first matching selector
        }
      }
    }

    // Filter out potential non-ingredient lines (heuristics - can be improved)
    ingredients = ingredients.filter(ing => ing.length > 2 && !ing.toLowerCase().includes('instructions') && !ing.toLowerCase().includes('directions') && !ing.toLowerCase().includes('steps'));


    if (ingredients.length > 0) {
      console.log(`Found ingredients: ${ingredients.join(' | ')}`);
      res.json({ ingredients });
    } else {
      console.log("Could not find ingredients using known strategies.");
      res.status(404).json({ error: 'Could not automatically extract ingredients from this URL.', ingredients: [] });
    }

  } catch (error) {
    console.error("Error parsing recipe:", error);
    // Send back specific error if possible, otherwise generic
    const errorMessage = error.message.includes("HTTP error") 
      ? `Failed to fetch URL (${error.message})`
      : 'Failed to parse recipe';
    res.status(500).json({ error: errorMessage, details: error.message });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 