import { useState, useEffect } from 'react'
import './App.css'
import AddItemForm from './components/AddItemForm'
import GroceryList from './components/GroceryList'
import AddRecipeForm from './components/AddRecipeForm'
import RecipeList from './components/RecipeList'
import VoiceInput from './components/VoiceInput'
import ReminderSetter from './components/ReminderSetter'

const LOCAL_STORAGE_KEY_ITEMS = 'simple-groceries-pwa.items'
const LOCAL_STORAGE_KEY_RECIPES = 'simple-groceries-pwa.recipes'

function App() {
  // State for grocery items
  const [items, setItems] = useState([])
  // State for recipes
  const [recipes, setRecipes] = useState([])

  // Load items from localStorage on initial render
  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS))
    if (storedItems) {
      setItems(storedItems)
    }
  }, []) // Empty dependency array means this runs only once on mount

  // Save items to localStorage whenever the items state changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(items))
  }, [items]) // Dependency array includes items

  // --- Effect to handle shared URL on load ---
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const sharedUrl = queryParams.get('url');
    // const sharedTitle = queryParams.get('title'); // Potential future use
    // const sharedText = queryParams.get('text'); // Potential future use

    if (sharedUrl) {
      // Attempt to add the shared recipe URL
      addRecipe(sharedUrl);

      // Clear the query parameters from the URL so it's not processed again on reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []); // Run only once on initial mount

  // Function to add a new item
  const addItem = (name) => {
    if (!name) return // Prevent adding empty items
    const newItem = {
      id: crypto.randomUUID(), // Use crypto.randomUUID for unique IDs
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

  // Load recipes from localStorage
  useEffect(() => {
    const storedRecipes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_RECIPES))
    if (storedRecipes) {
      setRecipes(storedRecipes)
    }
  }, [])

  // Save recipes to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_RECIPES, JSON.stringify(recipes))
  }, [recipes])

  // Function to add a new recipe
  const addRecipe = (url) => {
    const trimmedUrl = url.trim()
    if (!trimmedUrl) return // Prevent adding empty URLs

    // Rudimentary check for valid URL format (can be improved)
    try {
      new URL(trimmedUrl)
    } catch (_) {
      alert("Please enter a valid URL.")
      return
    }

    // Check for duplicates
    if (recipes.some(recipe => recipe.url === trimmedUrl)) {
      alert("This recipe URL is already saved.")
      return
    }

    const newRecipe = {
      id: crypto.randomUUID(),
      url: trimmedUrl,
      // We can add title/metadata later
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
      .map(name => name.trim()) // Trim whitespace from each name
      .filter(name => name !== '' && !items.some(item => item.name.toLowerCase() === name.toLowerCase())) // Filter empty and duplicates (case-insensitive)
      .map(name => ({ // Create item objects
        id: crypto.randomUUID(),
        name: name,
        completed: false
      }));

    if (newItems.length > 0) {
      setItems(prevItems => [...prevItems, ...newItems]);
    }
  };

  return (
    <>
      <h1>Simple Groceries PWA</h1>
      {/* Grocery Section */}
      <AddItemForm onAddItem={addItem} />
      {/* <VoiceInput onAddItem={addItem} /> // Temporarily comment out */}
      <GroceryList
        items={items}
        onToggleComplete={toggleComplete}
        onDeleteItem={deleteItem}
        onClearCompleted={clearCompletedItems}
      />
      <ReminderSetter />

      {/* Recipe Section */}
      <AddRecipeForm onAddRecipe={addRecipe} />
      <RecipeList
        recipes={recipes}
        onDeleteRecipe={deleteRecipe}
        onAddIngredients={addIngredientsFromRecipe}
      />

    </>
  )
}

export default App
