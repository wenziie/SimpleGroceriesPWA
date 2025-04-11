import React, { useState, useEffect } from 'react';
import RecipeList from '../components/RecipeList';
import AddRecipeForm from '../components/AddRecipeForm';
// MUI Imports
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box'; // For Modal content styling
import Modal from '@mui/material/Modal'; // Modal component
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close'; // Icon for closing modal
import Snackbar from '@mui/material/Snackbar'; // For showing messages
import Alert from '@mui/material/Alert'; // For styling Snackbar messages
import AppBar from '@mui/material/AppBar'; // Import AppBar
import Toolbar from '@mui/material/Toolbar'; // Import Toolbar
import Typography from '@mui/material/Typography'; // Import Typography

// Basic style for modal content box - USE THEME VALUES
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '80%' }, // Responsive width
  maxWidth: 500,
  bgcolor: 'background.paper', // Use theme paper background
  // border: '1px solid', // Let Paper handle border/elevation
  // borderColor: 'divider',
  // boxShadow: 24, // Let Paper/theme handle
  p: { xs: 2, sm: 3, md: 4}, // Responsive padding
  borderRadius: theme => theme.shape.borderRadius, // Use theme border radius
  outline: 'none', // Remove default focus outline on modal
};

function RecipesPage({ 
  recipes, 
  addRecipe, 
  deleteRecipe, 
  addIngredientsFromRecipe,
  lastRecipeParseFailed
}) {
  // State controls modal visibility for adding recipes
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  // State for showing the parsing failure message
  const [showParseFailedMsg, setShowParseFailedMsg] = useState(false);

  // Handlers to open/close add recipe modal
  const handleOpenAddRecipe = () => setShowAddRecipe(true);
  const handleCloseAddRecipe = () => setShowAddRecipe(false);

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
      {/* Refactor Header using AppBar */}
      <AppBar 
        position="sticky" 
        color="inherit" // Use theme background, not primary/secondary color
        elevation={1} // Subtle elevation
        sx={{ 
            // Apply max-width and centering similar to the Container in Layout
            // This keeps the AppBar content aligned with the page content
             maxWidth: 'calc(600px + 3rem)', // Match container width (600px) + padding (1.5rem * 2)
             left: 'auto', // Allow margin auto to work
             right: 'auto', 
             mx: 'auto', // Center the AppBar itself
             bgcolor: 'background.paper' // Ensure paper background
           }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
           <Typography variant="h6" component="h2" sx={{ color: 'text.primary' }}>
             Recept
           </Typography>
          <IconButton onClick={handleOpenAddRecipe} title="Add Recipe" color="primary">
            <AddIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

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

      {/* Recipe List - remove onOpenVoiceModal */}
      <RecipeList 
        recipes={recipes} 
        onDeleteRecipe={deleteRecipe} 
        onAddIngredients={addIngredientsFromRecipe} 
      />

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