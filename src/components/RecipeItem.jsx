import React, { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete'; // For consistency
import IconButton from '@mui/material/IconButton'; // For consistency
import Button from '@mui/material/Button'; // Use MUI button
import CheckIcon from '@mui/icons-material/Check'; // Icon for success
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'; // Icon for adding
// MUI List Imports
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link'; // For clickable URL
import Paper from '@mui/material/Paper'; // To wrap item
import Box from '@mui/material/Box'; // For layout

function RecipeItem({ recipe, onDeleteRecipe, onAddIngredients }) {
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
    // Wrap in Paper for structure and elevation
    <Paper sx={{ mb: 1.5, overflow: 'hidden' }}> 
      <ListItem alignItems="flex-start" disablePadding>
        {/* Avatar for Image */}
        {recipe.imageUrl && (
          <ListItemAvatar sx={{ mr: 1 }}>
            <Avatar 
              variant="rounded" // Square corners
              src={recipe.imageUrl} 
              alt={`Thumbnail for ${recipe.title}`}
              sx={{ width: 56, height: 56 }}
              // onError prop could be added if needed
            />
          </ListItemAvatar>
        )}
        {/* Main Text Content */}
        <ListItemText
          primary={
            // Use Typography for better control
            <Typography variant="body1" component="span" sx={{ fontWeight: 'medium' }}>
              {recipe.title}
            </Typography>
          }
          secondary={
            <Link 
              href={recipe.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              variant="caption" 
              color="text.secondary"
              sx={{ wordBreak: 'break-all', display: 'block', mt: 0.5 }}
            >
               {recipe.url}
            </Link>
          }
          sx={{ my: 1, mr: 1 }} // Add vertical margin and right margin
        />
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection:'column', alignItems: 'flex-end', justifyContent: 'center', ml: 'auto', my: 1, mr: 1 }}>
          <Button 
            variant="contained" // Use contained for primary action
            color="primary"
            size="small" 
            onClick={handleAddIngredients} 
            sx={{ mb: 0.5, minWidth: '100px' }} // Add margin bottom and min width
            disabled={!hasIngredients || ingredientsAdded}
            startIcon={ingredientsAdded ? <CheckIcon fontSize="small"/> : <AddShoppingCartIcon fontSize="small"/>}
            title={!hasIngredients ? "Ingredients not found" : (ingredientsAdded ? "Added" : "Add items")}
          >
            {ingredientsAdded ? 'Added' : 'Add Items'}
          </Button>
          <IconButton 
            onClick={() => onDeleteRecipe(recipe.id)} 
            size="small" 
            title="Delete Recipe"
            sx={{ color: 'error.main' }} // Use theme error color
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </ListItem>
    </Paper>
  );
}

export default RecipeItem; 