import React from 'react';
import RecipeItem from './RecipeItem';

function RecipeList({ recipes, onDeleteRecipe, onAddIngredients }) {
  return (
    <div>
      {/* Title removed as it's now in RecipesPage header */}
      {/* <h2>Recipes</h2> */}
      {recipes.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'grey', marginTop: '4rem' }}>
          No recipes saved yet. Add one using the '+' button above.
        </p>
      ) : (
        <ul>
          {recipes.map(recipe => (
            <RecipeItem
              key={recipe.id}
              recipe={recipe}
              onDeleteRecipe={onDeleteRecipe}
              onAddIngredients={onAddIngredients}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecipeList; 