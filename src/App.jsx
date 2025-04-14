import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'; // Import routing components and location hook
import './App.css'
import AddItemForm from './components/AddItemForm'
import GroceryList from './components/GroceryList'
import AddRecipeForm from './components/AddRecipeForm'
import RecipeList from './components/RecipeList'
import VoiceInput from './components/VoiceInput' // Re-enable import
// import ReminderSetter from './components/ReminderSetter' // Removed
import Layout from './components/Layout'
import GroceryPage from './pages/GroceryPage'
import RecipesPage from './pages/RecipesPage'

const LOCAL_STORAGE_KEY_ITEMS = 'simple-groceries-pwa.items'
const LOCAL_STORAGE_KEY_RECIPES = 'simple-groceries-pwa.recipes'

// Helper function to decode HTML entities
function decodeHtmlEntities(text) {
  // Use a temporary element to leverage the browser's decoding
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function App() {
  // State for grocery items
  const [items, setItems] = useState([])
  // State for recipes
  const [recipes, setRecipes] = useState(() => {
    const storedRecipes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_RECIPES));
    // Ensure existing recipes have default null/empty values for new fields
    return storedRecipes ? storedRecipes.map(r => ({ 
      ...r, 
      title: r.title || r.url, 
      imageUrl: r.imageUrl || null,
      ingredients: r.ingredients || [] // Add ingredients field
    })) : [];
  });

  const navigate = useNavigate(); // Get navigate function
  const location = useLocation(); // Get location object

  // Wrap addRecipe in useCallback
  const addRecipe = useCallback(async (url) => {
    const trimmedUrl = url.trim()
    if (!trimmedUrl) return
    
    try {
      new URL(trimmedUrl) // Basic validation
    } catch (_) {
      alert("Please enter a valid URL.")
      return
    }
    
    // Check for duplicates using the current recipes state
    // Need to access recipes via function argument or by including it in useCallback deps
    // Safest is often to use the functional update form of setRecipes if possible, 
    // but here we need to check *before* potentially setting state.
    // So, we include recipes in the dependency array.
    if (recipes.some(recipe => recipe.url === trimmedUrl)) {
      alert("This recipe URL is already saved.")
      return
    }

    console.log(`Fetching metadata for: ${trimmedUrl}`); 
    let title = trimmedUrl; 
    let imageUrl = null; 
    let ingredients = [];

    try {
      const response = await fetch('/api/fetch_recipe_meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      if (!response.ok) {
        // Handle API errors (e.g., 400, 500)
        const errorData = await response.json().catch(() => ({})); // Try to parse error, ignore if not JSON
        console.error(`API Error (${response.status}): ${errorData.error || response.statusText}`);
        // Keep default title/imageUrl (the URL itself)
      } else {
        const data = await response.json();
        // Decode the title before assigning
        title = decodeHtmlEntities(data.title || trimmedUrl);
        imageUrl = data.imageUrl; 
        ingredients = data.ingredients || []; 
      }
    } catch (error) {
      // Handle network errors during fetch
      console.error('Network error fetching recipe metadata:', error);
    }

    const newRecipe = {
      id: crypto.randomUUID(),
      url: trimmedUrl,
      // Use the decoded title
      title: title, 
      imageUrl: imageUrl,
      ingredients: ingredients
    };
    
    // Use functional update form for setRecipes
    setRecipes(prevRecipes => [...prevRecipes, newRecipe]);
  }, [recipes]);

  // Load items from localStorage on initial render
  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS))
    if (storedItems) {
      setItems(storedItems)
    }
  }, [])

  // Save items to localStorage whenever the items state changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(items))
  }, [items])

  // No need for separate recipe loading effect now, handled in useState initial value
  // useEffect(() => { ... }, [])

  // Save recipes to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_RECIPES, JSON.stringify(recipes))
  }, [recipes])

  // Function to add a new item
  const addItem = (name) => {
    if (!name) return 
    const newItem = {
      id: crypto.randomUUID(), 
      name: name,
      completed: false
    }
    setItems(prevItems => [...prevItems, newItem])
  }

  // Function to toggle the completed status of an item
  const toggleComplete = (id) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  // Function to delete an item
  const deleteItem = (id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  // Function to clear all completed items
  const clearCompletedItems = () => {
    setItems(prevItems => prevItems.filter(item => !item.completed))
  }

  // Function to edit an item's name
  const editItem = (id, newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return; // Don't allow empty names
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, name: trimmedName } : item
      )
    );
  };

  // Function to clear ALL items
  // NOTE: Removing the window.confirm here as we now have a dedicated modal in GroceryPage
  const clearAllItems = () => {
    setItems([]); // Set items to empty array
  };

  // Function to delete a recipe
  const deleteRecipe = (id) => {
    setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== id))
  }

  // Updated function to decode ingredients before adding
  const addIngredientsFromRecipe = (ingredientNames) => {
    const currentItemNamesLower = items.map(item => item.name.toLowerCase());
    
    // Decode names first
    const decodedNames = ingredientNames.map(decodeHtmlEntities);

    const newItems = decodedNames
      .map(name => name.trim()) 
      .filter(name => name !== '') 
      .filter(name => !currentItemNamesLower.includes(name.toLowerCase())) 
      .map(name => ({ 
        id: crypto.randomUUID(),
        // Use the already decoded name here
        name: name, 
        completed: false
      }));

    if (newItems.length > 0) {
      setItems(prevItems => [...prevItems, ...newItems]);
    }
    
    return { addedCount: newItems.length }; 
  };

  return (
    <Routes>
      <Route path="/" element={<Layout />}> { /* Layout wraps the pages */}
        {/* Index route defaults to GroceryPage */}
        <Route index element={
          <GroceryPage 
            items={items} 
            addItem={addItem} 
            toggleComplete={toggleComplete}
            deleteItem={deleteItem}
            clearCompletedItems={clearCompletedItems}
            clearAllItems={clearAllItems}
            editItem={editItem}
          />
        } />
        <Route path="recipes" element={
          <RecipesPage 
            recipes={recipes}
            addRecipe={addRecipe}
            deleteRecipe={deleteRecipe}
            addIngredientsFromRecipe={addIngredientsFromRecipe}
          />
        } />
      </Route>
    </Routes>
  )
}

export default App
