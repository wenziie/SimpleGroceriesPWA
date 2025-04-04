import React from 'react';

function RecipeItem({ recipe, onDeleteRecipe, onAddIngredients }) {

  const handleAddIngredients = async () => {
    // We'll implement the fetch call here
    console.log(`Requesting ingredients for: ${recipe.url}`);
    try {
      // Construct the backend API URL
      const apiUrl = `http://localhost:3001/parse-recipe?url=${encodeURIComponent(recipe.url)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.ingredients && data.ingredients.length > 0) {
        console.log('Ingredients received:', data.ingredients);
        // Call the handler passed from App.jsx to add these items to the grocery list
        onAddIngredients(data.ingredients);
        alert('Ingredients added to grocery list!'); // Simple confirmation
      } else {
        alert('Could not automatically find ingredients for this recipe.');
      }
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      alert(`Error fetching ingredients: ${error.message}`);
    }
  };

  return (
    <li>
      {/* Open link in a new tab */}
      <a href={recipe.url} target="_blank" rel="noopener noreferrer" style={{ flexGrow: 1, marginRight: '1rem' }}>
        {recipe.url} {/* Display URL for now, add title later */}
      </a>
      {/* Add Ingredients Button */}
      <button onClick={handleAddIngredients} style={{ marginRight: '0.5rem' }}>
        Add Ingredients
      </button>
      <button onClick={() => onDeleteRecipe(recipe.id)} style={{ color: 'red' }}>
        Delete
      </button>
    </li>
  );
}

export default RecipeItem; 