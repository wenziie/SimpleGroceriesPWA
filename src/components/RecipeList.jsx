import React from 'react';
import RecipeItem from './RecipeItem';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function RecipeList({ recipes, onDeleteRecipe, onAddIngredients, bottomAnchorRef }) {
  return (
    <Box>
      {/* Title removed as it's now in RecipesPage header */}
      {/* <h2>Recipes</h2> */}
      {recipes.length === 0 ? (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 8, mb: 4 }}
        >
          No recipes saved yet. Add one using the '+' button above.
        </Typography>
      ) : (
        <List>
          {recipes.map((recipe) => (
            <RecipeItem
              key={recipe.id}
              recipe={recipe}
              onDeleteRecipe={onDeleteRecipe}
              onAddIngredients={onAddIngredients}
            />
          ))}
        </List>
      )}
      <div ref={bottomAnchorRef} style={{ height: '1px' }} />
    </Box>
  );
}

export default RecipeList; 