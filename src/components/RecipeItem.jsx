import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete'; // For consistency
import IconButton from '@mui/material/IconButton'; // For consistency
import Button from '@mui/material/Button'; // Use MUI button

function RecipeItem({ recipe, onDeleteRecipe, onAddIngredients }) {

  const handleAddIngredients = async () => {
    // Placeholder - Ingredient parsing logic not implemented in this step
    console.log(`Placeholder: Add ingredients for ${recipe.title || recipe.url}`);
    alert('Ingredient parsing not implemented yet.');
    // try {
    //   const apiUrl = `/api/parse_ingredients?url=${encodeURIComponent(recipe.url)}`;
    //   const response = await fetch(apiUrl);
    //   ...
    // } catch (error) { ... }
  };

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
      <div style={{ flexShrink: 0 }}>
        {/* Use MUI Button for adding ingredients */}
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleAddIngredients} 
          style={{ marginRight: '0.5rem' }}
          disabled // Disable for now until parsing is implemented
        >
          Add Ingredients
        </Button>
        {/* Use MUI IconButton for deleting */}
        <IconButton onClick={() => onDeleteRecipe(recipe.id)} size="small" title="Delete Recipe">
          <DeleteIcon style={{ color: 'red' }} />
        </IconButton>
      </div>
    </li>
  );
}

export default RecipeItem; 