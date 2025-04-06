import { useState, useEffect } from 'react'
import './App.css'
import AddItemForm from './components/AddItemForm'
import GroceryList from './components/GroceryList'
// import AddRecipeForm from './components/AddRecipeForm' // Disabled
// import RecipeList from './components/RecipeList' // Disabled
// import VoiceInput from './components/VoiceInput' // Disabled
// import ReminderSetter from './components/ReminderSetter' // Disabled

const LOCAL_STORAGE_KEY_ITEMS = 'simple-groceries-pwa.items'
// const LOCAL_STORAGE_KEY_RECIPES = 'simple-groceries-pwa.recipes' // Disabled

function App() {
  // State for grocery items
  const [items, setItems] = useState([])
  // State for recipes - Disabled
  // const [recipes, setRecipes] = useState([]) 

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

  // --- Effect to handle shared URL on load --- Disabled
  /*
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const sharedUrl = queryParams.get('url');
    if (sharedUrl) {
      addRecipe(sharedUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []); 
  */

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

  // --- Recipe Logic --- Disabled
  /*
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
  */

  return (
    <>
      <h1>Simple Groceries PWA</h1>
      {/* Only render core grocery components */}
      <AddItemForm onAddItem={addItem} />
      {/* <VoiceInput onAddItem={addItem} /> */}
      <GroceryList
        items={items}
        onToggleComplete={toggleComplete}
        onDeleteItem={deleteItem}
        onClearCompleted={clearCompletedItems}
      />
      {/* <ReminderSetter /> */}

      {/* Recipe Section Disabled*/}
      {/*
      <AddRecipeForm onAddRecipe={addRecipe} />
      <RecipeList
        recipes={recipes}
        onDeleteRecipe={deleteRecipe}
        onAddIngredients={addIngredientsFromRecipe}
      />
      */}

    </>
  )
}

export default App
