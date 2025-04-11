import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
  // State controls modal visibility for adding recipes
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  // State for showing the parsing failure message
  const [showParseFailedMsg, setShowParseFailedMsg] = useState(false);
  // Ref for the scrollable content area
  const scrollRef = useRef(null);
  // State to track previous recipes length for scroll effect
  const [prevRecipesLength, setPrevRecipesLength] = useState(recipes.length);

  // Handlers to open/close add recipe modal
  const handleOpenAddRecipe = () => setShowAddRecipe(true);
  const handleCloseAddRecipe = () => setShowAddRecipe(false);

  // Handler for adding recipe - remove scroll logic from here
  const handleAddRecipeAndClose = async (url) => {
    await addRecipe(url); 
    handleCloseAddRecipe(); 
    // No scroll logic here anymore
  }

  // Effect to watch for parsing failure flag
  useEffect(() => {
    if (lastRecipeParseFailed) {
      setShowParseFailedMsg(true);
      // Optionally reset the flag in App.jsx if needed, but Snackbar autoclose is enough
    }
  }, [lastRecipeParseFailed, recipes]); 

  // Effect to scroll towards bottom when recipes length increases
  useLayoutEffect(() => {
    if (recipes.length > prevRecipesLength) {
      // No timeout needed now, useLayoutEffect should be sufficient
      if (scrollRef.current) {
        // Calculate scroll position to leave space below fixed AppBar
        const appBarHeight = 64; // Approximate height of the AppBar
        const padding = 8; // Add a little extra padding
        const targetScrollTop = scrollRef.current.scrollHeight - scrollRef.current.clientHeight + padding; 

        // Alternative calculation: scroll to bottom minus appbar height
        // const targetScrollTop = scrollRef.current.scrollHeight - appBarHeight - padding;

        // Ensure we don't scroll to a negative value if content is short
        const finalScrollTop = Math.max(0, targetScrollTop);

        console.log(`[RecipesPage] New recipe added. Attempting to scroll towards bottom (adjusting for AppBar). Target: ${finalScrollTop}`);
        scrollRef.current.scrollTo({ top: finalScrollTop }); // Instant scroll
      } else {
        console.warn('[RecipesPage] scrollRef.current was null or undefined when trying to scroll.');
      }
    }
    // Update previous length state *after* checking
    setPrevRecipesLength(recipes.length);
  }, [recipes.length, prevRecipesLength]); // Depend on recipes.length

  const handleCloseSnackbar = (event, reason) => {
     if (reason === 'clickaway') {
       return;
     }
     setShowParseFailedMsg(false);
  };

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
         ref={scrollRef} // Attach the ref here
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
           // Let Dialog handle width/styling based on content
           // fullWidth 
           // maxWidth="sm" 
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

      </Box> { /* Close content Box */ }
    </Box>
  );
}

export default RecipesPage; 