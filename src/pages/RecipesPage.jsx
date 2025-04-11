import React, { useState, useEffect } from 'react';
import RecipeList from '../components/RecipeList';
import AddRecipeForm from '../components/AddRecipeForm';
import VoiceInput from '../components/VoiceInput'; // Import VoiceInput
// MUI Imports
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box'; // For Modal content styling
import Modal from '@mui/material/Modal'; // Modal component
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close'; // Icon for closing modal
import Snackbar from '@mui/material/Snackbar'; // For showing messages
import Alert from '@mui/material/Alert'; // For styling Snackbar messages

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
  addIngredientsFromRecipe,
  lastRecipeParseFailed,
  addVoiceIngredientsToList // Receive the new function
}) {
  // State controls modal visibility
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  // State for showing the parsing failure message
  const [showParseFailedMsg, setShowParseFailedMsg] = useState(false);
  // State for voice input modal
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [currentRecipeForVoice, setCurrentRecipeForVoice] = useState(null); // Track which recipe

  // Handlers to open/close modal
  const handleOpenAddRecipe = () => setShowAddRecipe(true);
  const handleCloseAddRecipe = () => setShowAddRecipe(false);

  // Handlers for voice input modal
  const handleOpenVoiceModal = (recipe) => {
    setCurrentRecipeForVoice(recipe);
    setVoiceModalOpen(true);
  };
  const handleCloseVoiceModal = () => {
    setVoiceModalOpen(false);
    setCurrentRecipeForVoice(null);
  };

  // Update handler to close modal on add
  const handleAddRecipeAndClose = (url) => {
    addRecipe(url);
    handleCloseAddRecipe(); // Close modal after adding
  }

  // Effect to watch for the parsing failure flag from App.jsx
  useEffect(() => {
    if (lastRecipeParseFailed) {
      setShowParseFailedMsg(true);
      // Optionally reset the flag in App.jsx if needed, but Snackbar autoclose is enough
    }
  }, [lastRecipeParseFailed, recipes]); // Depend on flag and recipes (to trigger on add)

  const handleCloseSnackbar = (event, reason) => {
     if (reason === 'clickaway') {
       return;
     }
     setShowParseFailedMsg(false);
  };

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

      {/* Recipe List - pass handleOpenVoiceModal */}
      <RecipeList 
        recipes={recipes} 
        onDeleteRecipe={deleteRecipe} 
        onAddIngredients={addIngredientsFromRecipe} 
        onOpenVoiceModal={handleOpenVoiceModal} // Pass down the handler
      />

      {/* Voice Input Modal */}
      <Modal
        open={voiceModalOpen}
        onClose={handleCloseVoiceModal}
        aria-labelledby="voice-input-modal-title"
      >
        <Box sx={{ 
           ...modalStyle, // Keep original styles
           width: '90%',  // Make it wider
           height: '85%', // Make it taller
           display: 'flex',
           flexDirection: 'column'
         }}>
           <IconButton onClick={handleCloseVoiceModal} style={{ position: 'absolute', top: 8, right: 8}} title="Close">
            <CloseIcon />
          </IconButton>
           <h4 id="voice-input-modal-title" style={{ flexShrink: 0, marginBottom: '1rem' }}>
             Add Ingredients for "{currentRecipeForVoice?.title || 'Recipe'}"
           </h4>
           {/* Iframe to display the recipe */}
           <iframe 
              src={currentRecipeForVoice?.url || ''} 
              title={`Recipe: ${currentRecipeForVoice?.title || 'Recipe'}`}
              style={{
                width: '100%',
                height: '60%', // Adjust height as needed, maybe 50-60%
                border: '1px solid #ccc',
                flexGrow: 1 // Allow iframe to take up space
              }}
              // Optional: sandbox attribute for security, but might break functionality
              // sandbox="allow-scripts allow-same-origin"
           ></iframe>
           {/* Voice Input component below the iframe */}
           <div style={{ flexShrink: 0, marginTop: '1rem', overflowY: 'auto' }}>
              <VoiceInput onAddItem={addVoiceIngredientsToList} /> 
           </div>
        </Box>
      </Modal>

      {/* Snackbar for Parsing Failure Message */}
      <Snackbar 
        open={showParseFailedMsg} 
        autoHideDuration={6000} // Hide after 6 seconds
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Position
      >
        <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: '100%' }}>
           Ingredients could not be auto added. This can be due to the website's formatting. You can try to add the ingredients manually instead.
        </Alert>
      </Snackbar>

    </div>
  );
}

export default RecipesPage; 