import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'; // Import routing components
import './App.css'
import AddItemForm from './components/AddItemForm'
import GroceryList from './components/GroceryList'
import AddRecipeForm from './components/AddRecipeForm'
import RecipeList from './components/RecipeList'
import VoiceInput from './components/VoiceInput' // Re-enable import
import ReminderSetter from './components/ReminderSetter' // Re-enable import
import Layout from './components/Layout'
import GroceryPage from './pages/GroceryPage'
import RecipesPage from './pages/RecipesPage'

const LOCAL_STORAGE_KEY_ITEMS = 'simple-groceries-pwa.items'
const LOCAL_STORAGE_KEY_RECIPES = 'simple-groceries-pwa.recipes'

function App() {
  // State for grocery items
  const [items, setItems] = useState([])
  // State for recipes - include title and imageUrl
  const [recipes, setRecipes] = useState(() => {
    const storedRecipes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_RECIPES));
    // Ensure existing recipes have default null values for new fields
    return storedRecipes ? storedRecipes.map(r => ({ ...r, title: r.title || r.url, imageUrl: r.imageUrl || null })) : [];
  });

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

  // Effect to handle shared URL on load
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const sharedUrl = queryParams.get('url');
    if (sharedUrl) {
      addRecipe(sharedUrl);
      // Clear the query param from the URL after processing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // Intentionally run only once on mount, addRecipe handles duplicates
  }, []);

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

  // Function to add a new recipe - now asynchronous
  const addRecipe = async (url) => {
    const trimmedUrl = url.trim()
    if (!trimmedUrl) return
    
    try {
      new URL(trimmedUrl) // Basic validation
    } catch (_) {
      alert("Please enter a valid URL.")
      return
    }
    
    // Check for duplicates before fetching
    if (recipes.some(recipe => recipe.url === trimmedUrl)) {
      alert("This recipe URL is already saved.")
      return
    }

    // Show some loading state (optional, implement later if needed)
    console.log(`Fetching metadata for: ${trimmedUrl}`); 

    let title = trimmedUrl; // Default title is the URL
    let imageUrl = null;

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
        title = data.title || trimmedUrl; // Use fetched title or fallback to URL
        imageUrl = data.imageUrl; // Use fetched image URL (can be null)
      }
    } catch (error) {
      // Handle network errors during fetch
      console.error('Network error fetching recipe metadata:', error);
      // Keep default title/imageUrl (the URL itself)
    }

    const newRecipe = {
      id: crypto.randomUUID(),
      url: trimmedUrl,
      title: title, // Use fetched or default title
      imageUrl: imageUrl // Use fetched image URL or null
    }
    
    setRecipes(prevRecipes => [...prevRecipes, newRecipe])
  }

  // Function to delete a recipe
  const deleteRecipe = (id) => {
    setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== id))
  }

  // Function to add multiple ingredients (from recipe parsing)
  const addIngredientsFromRecipe = (ingredientNames) => {
    const newItems = ingredientNames
      .map(name => name.trim())
      .filter(name => name !== '' && !items.some(item => item.name.toLowerCase() === name.toLowerCase()))
      .map(name => ({ 
        id: crypto.randomUUID(),
        name: name,
        completed: false
      }));

    if (newItems.length > 0) {
      setItems(prevItems => [...prevItems, ...newItems]);
    }
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
