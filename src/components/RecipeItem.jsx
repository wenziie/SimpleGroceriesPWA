import React, { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete'; // For consistency
import IconButton from '@mui/material/IconButton'; // For consistency
import Button from '@mui/material/Button'; // Use MUI button
import CheckIcon from '@mui/icons-material/Check'; // Icon for success
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'; // Icon for adding
import MicIcon from '@mui/icons-material/Mic'; // Icon for voice input

function RecipeItem({ recipe, onDeleteRecipe, onAddIngredients, onOpenVoiceModal }) {
  const [ingredientsAdded, setIngredientsAdded] = useState(false);

  const handleAddIngredients = () => {
    // Use the ingredients already stored in the recipe object
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      onAddIngredients(recipe.ingredients); // Call the function passed from App.jsx
      setIngredientsAdded(true); // Set state to show confirmation
      // Optionally reset after a delay
      setTimeout(() => setIngredientsAdded(false), 3000); 
    } else {
      // Optional: Show a message if there are no ingredients to add
      // (though the button might be disabled in this case)
      console.log("No ingredients found in recipe data to add.");
    }
  };

  // Determine if the button should be disabled
  const hasIngredients = recipe.ingredients && recipe.ingredients.length > 0;

  return (
    <li style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #eee'
    }}>
      {/* Display image if available */}
      {recipe.imageUrl && (
        <img 
          src={recipe.imageUrl} 
          alt={`Thumbnail for ${recipe.title}`}
          style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '1rem', borderRadius: '4px' }}
          onError={(e) => { e.target.style.display = 'none' }} // Hide if image fails to load
        />
      )}
      {/* Info Section (Title + URL) */}
      <div style={{ flexGrow: 1, marginRight: '1rem' }}>
        <a href={recipe.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>
            {recipe.title} {/* Display Title */}
          </span>
          <span style={{ fontSize: '0.8em', color: 'grey', wordBreak: 'break-all' }}>
             {recipe.url} {/* Keep URL subtle */}
          </span>
        </a>
      </div>
      {/* Action Buttons */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {/* Add Ingredients Button (from backend parsing) */}
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleAddIngredients} 
          style={{ marginRight: '0.5rem' }}
          disabled={!hasIngredients || ingredientsAdded} // Disable if no ingredients or already added
          startIcon={ingredientsAdded ? <CheckIcon /> : <AddShoppingCartIcon />}
          title={!hasIngredients ? "Ingredients not found automatically" : (ingredientsAdded ? "Ingredients added" : "Add parsed ingredients")}
        >
          {ingredientsAdded ? 'Added!' : 'Add Items'} {/* Shorten text */}
        </Button>
        {/* Add Ingredients by Voice Button */}
        <IconButton 
          onClick={() => onOpenVoiceModal(recipe)}
          size="small"
          title="Add Ingredients by Voice"
          style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }} 
        >
           <MicIcon />
        </IconButton>
        {/* Delete Recipe Button */}
        <IconButton 
          onClick={() => onDeleteRecipe(recipe.id)} 
          size="small" 
          title="Delete Recipe"
          style={{ color: 'red' }}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </li>
  );
}

export default RecipeItem; 