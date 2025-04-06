import React, { useState } from 'react';
import RecipeList from '../components/RecipeList';
import AddRecipeForm from '../components/AddRecipeForm';
// MUI Imports
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

function RecipesPage({ 
  recipes, 
  addRecipe, 
  deleteRecipe, 
  addIngredientsFromRecipe 
}) {
  const [showAddRecipe, setShowAddRecipe] = useState(false);

  // Handler to add recipe and potentially close the form/modal
  const handleAddRecipe = (url) => {
    addRecipe(url);
    // Optionally close form after adding: setShowAddRecipe(false);
  }

  return (
    <div>
      {/* Header Actions - Apply sticky styles */}
      <div 
        style={{
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem',
          // Sticky styles
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--background-color, white)', // Use background variable, fallback white
          zIndex: 10, // Ensure it stays on top
          paddingTop: '1rem', // Add padding for spacing
          paddingBottom: '0.5rem'
        }}
      >
        <h2>Recept</h2>
        <IconButton onClick={() => setShowAddRecipe(!showAddRecipe)} title="Add Recipe">
          <AddIcon />
        </IconButton>
      </div>

      {/* Conditional Rendering of Input Component */}
      {showAddRecipe && <AddRecipeForm onAddRecipe={handleAddRecipe} />}

      {/* Recipe List */}
      <RecipeList 
        recipes={recipes} 
        onDeleteRecipe={deleteRecipe} 
        onAddIngredients={addIngredientsFromRecipe} 
      />
    </div>
  );
}

export default RecipesPage; 