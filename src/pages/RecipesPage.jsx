import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import RecipeList from '../components/RecipeList';
import AddRecipeForm from '../components/AddRecipeForm';
import ConfirmationModal from '../components/ConfirmationModal'; // Import confirmation modal
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
// Use Dialog components for modals
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// import DialogActions from '@mui/material/DialogActions'; // No actions needed here

// Basic style for modal content box - USE THEME VALUES
// Remove modalStyle if using Dialog components fully
// const modalStyle = { ... };

function RecipesPage({ 
  recipes, 
  addRecipe, 
  deleteRecipe, 
  addIngredientsFromRecipe,
  lastRecipeParseFailed
}) {
  // Remove scrollContainerRef usage
  // const { scrollContainerRef } = useOutletContext(); 

  // State controls modal visibility for adding recipes
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  // State for showing the parsing failure message
  const [showParseFailedMsg, setShowParseFailedMsg] = useState(false);
  // State to track previous recipes length for scroll effect
  const [prevRecipesLength, setPrevRecipesLength] = useState(recipes.length);
  // Remove lastItemRef, add bottomAnchorRef
  // const lastItemRef = useRef(null);
  const bottomAnchorRef = useRef(null);

  // Add state for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null); // Store the whole recipe object now

  // Handlers to open/close add recipe modal
  const handleOpenAddRecipe = () => setShowAddRecipe(true);
  const handleCloseAddRecipe = () => setShowAddRecipe(false);

  // Updated handler for requesting delete confirmation
  const handleRequestDelete = (recipeId) => {
    const recipe = recipes.find(r => r.id === recipeId); // Find the recipe object
    if (recipe) {
      setRecipeToDelete(recipe);
      setShowDeleteConfirm(true);
    }
  };

  const handleCloseDeleteConfirm = () => {
    setRecipeToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = () => {
    if (recipeToDelete) {
      deleteRecipe(recipeToDelete.id); // Pass the ID to the original delete function
    }
    handleCloseDeleteConfirm(); 
  };

  // Handler for adding recipe - remove scroll logic from here
  const handleAddRecipeAndClose = async (url) => {
    await addRecipe(url); 
    handleCloseAddRecipe(); 
  }

  // Effect to watch for parsing failure flag
  useEffect(() => {
    if (lastRecipeParseFailed) {
      setShowParseFailedMsg(true);
      // Optionally reset the flag in App.jsx if needed, but Snackbar autoclose is enough
    }
  }, [lastRecipeParseFailed, recipes]); 

  // Effect to scroll the bottom anchor into view
  useLayoutEffect(() => {
    if (recipes.length > prevRecipesLength) {
      if (bottomAnchorRef.current) { 
        // console.log('[RecipesPage] New recipe. Scrolling bottom anchor into view (end).'); // REMOVE LOG
        // Scroll bottom of anchor to bottom of view
        bottomAnchorRef.current.scrollIntoView({ behavior: 'auto', block: 'end' }); 
      } else {
        // console.warn('[RecipesPage] bottomAnchorRef.current was null or undefined.'); // REMOVE LOG
      }
    }
    setPrevRecipesLength(recipes.length);
  }, [recipes.length, prevRecipesLength]); 

  const handleCloseSnackbar = (event, reason) => {
     if (reason === 'clickaway') {
       return;
     }
     setShowParseFailedMsg(false);
  };

  // Generate dynamic message for confirmation modal
  const deleteMessage = recipeToDelete
    ? `Är du säker på att du vill ta bort receptet "${recipeToDelete.title}"?`
    : "Är du säker på att du vill ta bort detta recept?"; // Fallback

  return (
    <Box> { /* Wrap page content in Box */ }
      {/* Refactor Header using AppBar - POSITION FIXED */}
      <AppBar 
        position="fixed" // CHANGE to fixed
        color="inherit" // Use theme background, not primary/secondary color
        elevation={3} // INCREASE ELEVATION TO MATCH BOTTOM NAV
        sx={{ 
            bgcolor: 'background.paper', // Ensure paper background
            zIndex: 1100 // Ensure above content
           }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
           <Typography variant="h6" component="h2" sx={{ color: 'text.primary' }}>
             Recept
           </Typography>
           {/* Match style with GroceryPage Add button */}
          <IconButton 
             onClick={handleOpenAddRecipe} 
             title="Add Recipe" 
             sx={{ 
                bgcolor: 'primary.main', 
                color: 'primary.contrastText',
                '&:hover': { 
                  bgcolor: 'primary.dark', 
                }
              }}
             >
            <AddIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Add Padding Top to account for the fixed AppBar */}
      <Box 
         sx={{ 
         // Approx 64px. Use theme calculation if possible
         pt: '64px', // Keep top padding
         px: 2 // RE-ADD horizontal padding (theme spacing unit * 2)
        }}>

         {/* Add Recipe Dialog (replaces Modal) */}
         <Dialog 
           open={showAddRecipe}
           onClose={handleCloseAddRecipe}
           aria-labelledby="add-recipe-dialog-title"
           PaperProps={{ // Target the inner Paper component
             sx: {
               mx: { xs: 2, sm: 'auto' }, 
               width: { xs: 'calc(100% - 32px)', sm: 'auto' }, 
             }
           }}
         >
           <DialogTitle id="add-recipe-dialog-title">
             Lägg till recept
             {/* Optional: Add close button to title */}
             <IconButton
               aria-label="close"
               onClick={handleCloseAddRecipe}
               sx={{
                 position: 'absolute',
                 right: 8,
                 top: 8,
                 color: (theme) => theme.palette.grey[500],
               }}
             >
               <CloseIcon />
             </IconButton>
           </DialogTitle>
           <DialogContent dividers> {/* Add dividers for padding */}
             <AddRecipeForm onAddRecipe={handleAddRecipeAndClose} />
           </DialogContent>
           {/* No DialogActions needed as submit is inside the form */}
         </Dialog>

         {/* Recipe List - Pass handleRequestDelete instead of deleteRecipe */}
         <RecipeList 
           recipes={recipes} 
           onRequestDeleteRecipe={handleRequestDelete}
           onAddIngredients={addIngredientsFromRecipe} 
           bottomAnchorRef={bottomAnchorRef}
         />

         {/* Delete Confirmation Modal - Updated message */}
         <ConfirmationModal
           open={showDeleteConfirm}
           onClose={handleCloseDeleteConfirm}
           onConfirm={handleConfirmDelete}
           title="Bekräfta borttagning"
           message={deleteMessage} // Use dynamic message
           confirmText="Ja, ta bort"
           cancelText="Avbryt"
           confirmColor="error" 
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

      </Box> { /* Close content Box */ }
    </Box>
  );
}

export default RecipesPage; 