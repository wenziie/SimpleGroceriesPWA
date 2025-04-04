import React from 'react';
import RecipeItem from './RecipeItem';

function RecipeList({ recipes, onDeleteRecipe, onAddIngredients }) {
  return (
    <div>
      <h2>Recipes</h2>
      {recipes.length === 0 ? (
        <p>No recipes saved yet.</p>
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