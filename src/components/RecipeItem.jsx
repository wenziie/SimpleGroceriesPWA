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
import { useTheme } from '@mui/material/styles'; // Import useTheme

function RecipeItem({ recipe, onRequestDeleteRecipe, onAddIngredients, onShowParsingFailure }) {
  // Add theme hook call
  const theme = useTheme(); 
  
  // Removed internal ingredientsAdded state
  // const [ingredientsAdded, setIngredientsAdded] = useState(false);
  
  // Determine if the button should be disabled based on ingredients existence
  const hasIngredients = recipe.ingredients && recipe.ingredients.length > 0;

  // Combined click handler for the cart button
  const handleCartClick = () => {
     if (!hasIngredients) {
       // If no ingredients were parsed, show the failure snackbar
       onShowParsingFailure();
     } else {
       // Otherwise, call the add ingredients handler (which shows success/warning snackbar)
       onAddIngredients(recipe.ingredients);
       // We no longer manage the checkmark state here, parent shows snackbar
     }
  };

  return (
    // Remove the ref from the Paper element
    <Paper sx={{ mb: 1.5, overflow: 'hidden', bgcolor: 'background.paper', p: 1 /* Use p:1 for 8px padding */ }}> 
      <ListItem alignItems="center" disablePadding /* Add disablePadding back */ >
        {/* Avatar for Image */}
        {recipe.imageUrl && (
          <ListItemAvatar sx={{ mr: 1 /* Keep small margin right */ }}>
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
            <Typography 
              variant="body1" 
              component="span" 
              sx={{ 
                 fontWeight: 'medium',
                 // Truncate text
                 display: 'block', // Needed for truncation
                 whiteSpace: 'nowrap',
                 overflow: 'hidden',
                 textOverflow: 'ellipsis'
               }}
             >
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
              sx={{ 
                 wordBreak: 'break-all', 
                 display: 'block', 
                 mt: 0.5,
                 // Truncate text
                 whiteSpace: 'nowrap',
                 overflow: 'hidden',
                 textOverflow: 'ellipsis'
              }}
            >
               {recipe.url}
            </Link>
          }
          sx={{ my: 0, mr: 1 /* Remove vertical margin, keep small right margin */ }}
        />
        {/* Action Buttons - Removed gap, re-added margin */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', my: 0, gap: theme.spacing(1) }}>
           <IconButton 
             // Set color conditionally based on hasIngredients
             color={hasIngredients ? "primary" : "disabled"} 
             size="medium" 
             onClick={handleCartClick}
             title={!hasIngredients ? "Ingredienser kunde inte läsas in" : "Lägg till varor"}
             // Add sx to override disabled opacity
             sx={{ 
                opacity: !hasIngredients ? 0.6 : 1 // Make disabled state less faded
             }}
           >
             <AddShoppingCartIcon fontSize="inherit"/>
           </IconButton>
          <IconButton 
            onClick={() => onRequestDeleteRecipe(recipe.id)} 
            size="medium" 
            title="Ta bort recept" 
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </ListItem>
    </Paper>
  );
}

export default RecipeItem; 