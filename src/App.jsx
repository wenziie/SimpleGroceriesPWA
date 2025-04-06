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
  // State for recipes
  const [recipes, setRecipes] = useState([])

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

  // --- Effect to handle shared URL on load ---
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const sharedUrl = queryParams.get('url');
    if (sharedUrl) {
      addRecipe(sharedUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
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
  const clearAllItems = () => {
    // Optional: Add confirmation prompt
    if (window.confirm('Är du säker på att du vill tömma hela listan?')) {
        setItems([]); // Set items to empty array
    }
  };

  // Function to add a new recipe
  const addRecipe = (url) => {
    const trimmedUrl = url.trim()
    if (!trimmedUrl) return
    try {
      new URL(trimmedUrl)
    } catch (_) {
      alert("Please enter a valid URL.")
      return
    }
    if (recipes.some(recipe => recipe.url === trimmedUrl)) {
      alert("This recipe URL is already saved.")
      return
    }
    const newRecipe = {
      id: crypto.randomUUID(),
      url: trimmedUrl,
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
