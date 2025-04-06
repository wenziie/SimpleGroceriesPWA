import React, { useState } from 'react';
import RecipeList from '../components/RecipeList';
import AddRecipeForm from '../components/AddRecipeForm';
// MUI Imports
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box'; // For Modal content styling
import Modal from '@mui/material/Modal'; // Modal component
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close'; // Icon for closing modal

// Basic style for modal content box (can share or redefine)
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 500,
  bgcolor: 'var(--background-color, white)',
  border: '1px solid #ccc',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px'
};

function RecipesPage({ 
  recipes, 
  addRecipe, 
  deleteRecipe, 
  addIngredientsFromRecipe 
}) {
  // State controls modal visibility
  const [showAddRecipe, setShowAddRecipe] = useState(false);

  // Handlers to open/close modal
  const handleOpenAddRecipe = () => setShowAddRecipe(true);
  const handleCloseAddRecipe = () => setShowAddRecipe(false);

  // Update handler to close modal on add
  const handleAddRecipeAndClose = (url) => {
    addRecipe(url);
    handleCloseAddRecipe(); // Close modal after adding
  }

  return (
    <div>
      {/* Header Actions - Update onClick to open modal */}
      <div 
        style={{
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--background-color, white)',
          zIndex: 10,
          padding: '1rem 0 0.5rem 0'
        }}
      >
        <h2>Recept</h2>
        <IconButton onClick={handleOpenAddRecipe} title="Add Recipe">
          <AddIcon />
        </IconButton>
      </div>

      {/* Add Recipe Modal */}
       <Modal
        open={showAddRecipe}
        onClose={handleCloseAddRecipe}
        aria-labelledby="add-recipe-modal-title"
      >
        <Box sx={modalStyle}>
          <IconButton onClick={handleCloseAddRecipe} style={{ position: 'absolute', top: 8, right: 8}} title="Close">
            <CloseIcon />
          </IconButton>
          <h4 id="add-recipe-modal-title">Lägg till recept</h4>
          <AddRecipeForm onAddRecipe={handleAddRecipeAndClose} />
        </Box>
      </Modal>

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