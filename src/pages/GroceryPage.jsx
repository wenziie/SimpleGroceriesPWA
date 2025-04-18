import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import GroceryList from '../components/GroceryList';
import AddItemForm from '../components/AddItemForm';
import VoiceInput from '../components/VoiceInput';
import ConfirmationModal from '../components/ConfirmationModal';
// MUI Imports
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box'; // For Modal content styling
import Modal from '@mui/material/Modal'; // Modal component
import AddIcon from '@mui/icons-material/Add';
import MicIcon from '@mui/icons-material/Mic';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close'; // Icon for closing modal
import AppBar from '@mui/material/AppBar'; // Import AppBar
import Toolbar from '@mui/material/Toolbar'; // Import Toolbar
import Button from '@mui/material/Button'; // Import Button
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'; // Icon for clear
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Snackbar from '@mui/material/Snackbar'; // Import Snackbar
import Alert from '@mui/material/Alert';     // Import Alert

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
  // Use theme's shadow (elevation) - Paper component applies this
  // boxShadow: 24, // Default MUI shadow, let Paper/theme handle
  p: { xs: 2, sm: 3, md: 4}, // Responsive padding
  borderRadius: 1, // Use 8px for less roundness
  outline: 'none', // Remove default focus outline on modal
};

function GroceryPage({ 
  items, 
  addItem, 
  toggleComplete, 
  deleteItem, 
  clearAllItems, 
  editItem
}) {
  // State controls modal visibility
  const [showAddItem, setShowAddItem] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Add state to track which item ID is being edited
  const [editTargetId, setEditTargetId] = useState(null);

  const theme = useTheme(); // Get theme for spacing

  // State for scroll-to-bottom
  const [prevItemsLengthScroll, setPrevItemsLengthScroll] = useState(items.length);
  const bottomListAnchorRef = useRef(null);

  // State for item added Snackbar
  const [snackbarInfo, setSnackbarInfo] = useState({ open: false, message: '', severity: 'success' });
  const [prevItemsLengthSnackbar, setPrevItemsLengthSnackbar] = useState(items.length);

  // Handlers to open modals
  const handleOpenAddItem = () => { setEditTargetId(null); setShowAddItem(true); };
  const handleCloseAddItem = () => setShowAddItem(false);
  const handleOpenVoiceInput = () => { setEditTargetId(null); setShowVoiceInput(true); };
  const handleCloseVoiceInput = () => setShowVoiceInput(false);
  
  const handleOpenClearConfirm = () => { setEditTargetId(null); setShowClearConfirm(true); };
  const handleCloseClearConfirm = () => setShowClearConfirm(false);
  
  const handleConfirmClear = () => {
    clearAllItems(); 
    handleCloseClearConfirm();
  };

  // Update handler to close modal on add
  const handleAddItemAndClose = (name) => {
    addItem(name);
    handleCloseAddItem();
  }

  // --- Edit Handlers ---
  const handleEditRequest = (id) => {
    // Close other modals/inputs if any are open when starting edit
    setShowAddItem(false);
    setShowVoiceInput(false);
    setShowClearConfirm(false);
    // Set the ID of the item to be edited
    setEditTargetId(id);
  };

  const handleSaveEdit = (id, newName) => {
    editItem(id, newName); // Call the actual edit function from App.jsx
    setEditTargetId(null); // Exit editing mode
  };

  const handleCancelEdit = () => {
    setEditTargetId(null); // Exit editing mode without saving
  };

  // Effect for scroll-to-bottom 
  useLayoutEffect(() => {
    if (items.length > prevItemsLengthScroll) {
      if (bottomListAnchorRef.current) { 
        bottomListAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' }); 
      }
    }
    setPrevItemsLengthScroll(items.length);
  }, [items.length, prevItemsLengthScroll]); 

  // Effect for item added Snackbar
  useEffect(() => {
    // Only show snackbar if length actually increased
    if (items.length > prevItemsLengthSnackbar) {
       const addedCount = items.length - prevItemsLengthSnackbar;
       const itemText = addedCount > 1 ? 'artiklar' : 'artikel';
       const verbText = addedCount > 1 ? 'tillagda' : 'tillagd';
       setSnackbarInfo({
         open: true, 
         message: `${addedCount} ${itemText} ${verbText}`, 
         severity: 'success' 
       });
    }
    // Always update length for next comparison, even if no snackbar shown
    setPrevItemsLengthSnackbar(items.length);
  }, [items.length, prevItemsLengthSnackbar]); 

  // Handler to close snackbar
  const handleCloseSnackbar = (event, reason) => {
     if (reason === 'clickaway') {
       return;
     }
     setSnackbarInfo(prev => ({ ...prev, open: false }));
  };

  return (
    <Box> { /* Wrap page content in Box */ }
      {/* Consolidate Title and Actions into ONE AppBar with TWO Toolbars */}
      <AppBar 
        position="fixed"
        color="inherit" 
        elevation={3} 
        sx={{ bgcolor: 'background.paper', zIndex: 1100 }}
      >
        {/* Top Toolbar: Actions */}
        <Toolbar sx={{ justifyContent: 'space-between' }}>
           {/* Clear Button on Left */}
           <Button 
             onClick={handleOpenClearConfirm}
             color="error" 
             size="large"
             startIcon={<DeleteSweepIcon />} 
             disabled={items.length === 0}
             sx={{ textTransform: 'none' }}
           >
             Töm lista
           </Button> 
           {/* Action Icons on Right */}
           <Box sx={{ display: 'flex', gap: theme.spacing(1.5) }}>
             <IconButton 
               onClick={handleOpenAddItem} 
               title="Lägg till artikel"
               sx={{ 
                 bgcolor: 'primary.main', 
                 color: 'primary.contrastText', 
                 '&:hover': { bgcolor: 'primary.dark' }
               }}
             >
               <AddIcon /> 
             </IconButton>
             <IconButton 
               onClick={handleOpenVoiceInput} 
               title="Lägg till med röst"
               sx={{ 
                 bgcolor: 'primary.main', 
                 color: 'primary.contrastText', 
                 '&:hover': { bgcolor: 'primary.dark' }
               }}
             >
               <MicIcon /> 
             </IconButton>
           </Box>
        </Toolbar>
        {/* Bottom Toolbar: Title */}
        <Toolbar variant="dense" sx={{ justifyContent: 'flex-start' /* Align title left */ }}>
           <Typography variant="h6" component="h1" sx={{ color: 'text.primary' }}>
             Inköpslista
           </Typography>
        </Toolbar>
      </AppBar>

      {/* Adjust Padding Top for the taller AppBar (two toolbars) */}
      <Box sx={{ 
         // Approx 64px + 48px = 112px. Use theme calculation if possible
         pt: '112px', // Keep top padding
         px: 2 // RE-ADD horizontal padding (theme spacing unit * 2)
        }}> 
         {/* --- Modals --- */}
         {/* Refactor Add Item Modal to Dialog */}
         <Dialog
           open={showAddItem}
           onClose={handleCloseAddItem}
           aria-labelledby="add-item-dialog-title"
           PaperProps={{
             sx: {
               mx: { xs: 2, sm: 'auto' }, 
               width: { xs: 'calc(100% - 32px)', sm: 'auto' }, 
             }
           }}
         >
           <DialogTitle id="add-item-dialog-title">
             Lägg till artiklar
             <IconButton
               aria-label="close"
               onClick={handleCloseAddItem}
               sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
             >
               <CloseIcon />
             </IconButton>
           </DialogTitle>
           <DialogContent dividers>
             <AddItemForm onAddItem={handleAddItemAndClose} /> { /* Pass the closing handler */ }
           </DialogContent>
         </Dialog>

         {/* Refactor Voice Input Modal to Dialog */}
         <Dialog
           open={showVoiceInput}
           onClose={handleCloseVoiceInput}
           aria-labelledby="voice-input-dialog-title"
           PaperProps={{ // Target the inner Paper component
             sx: {
               mx: { xs: 2, sm: 'auto' }, 
               width: { xs: 'calc(100% - 32px)', sm: 'auto' }, 
             }
           }}
         >
            <DialogTitle id="voice-input-dialog-title">
             Lägg till med röst
              <IconButton
                aria-label="close"
                onClick={handleCloseVoiceInput}
                sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
              >
               <CloseIcon />
             </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <VoiceInput onAddItem={addItem} /> 
            </DialogContent>
         </Dialog>

         {/* --- Confirmation Modals --- */}
         {/* Clear List Confirmation Modal */}
         <ConfirmationModal
           open={showClearConfirm}
           onClose={handleCloseClearConfirm}
           onConfirm={handleConfirmClear}
           title="Bekräfta tömning"
           message="Är du säker på att du vill tömma hela listan?"
           confirmText="Ja, töm listan"
           cancelText="Avbryt"
           confirmColor="error" // Use red for destructive action
         />

         {/* Grocery List - Pass down edit state and handlers */}
         <GroceryList 
           items={items} 
           onToggleComplete={toggleComplete} 
           onDeleteItem={deleteItem} 
           editTargetId={editTargetId}       // Pass down the target ID
           onEditRequest={handleEditRequest} // Pass down the request handler
           onSaveEdit={handleSaveEdit}       // Pass down the save handler
           onCancelEdit={handleCancelEdit}   // Pass down the cancel handler
           bottomListAnchorRef={bottomListAnchorRef} // Pass down the ref
         />

         {/* Snackbar for Item Added Feedback */}
         <Snackbar 
           open={snackbarInfo.open} 
           autoHideDuration={3000} 
           onClose={handleCloseSnackbar}
           anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} 
           sx={{ 
             mb: 'calc(56px + 8px + env(safe-area-inset-bottom, 0px))'
           }}
         >
           <Alert onClose={handleCloseSnackbar} severity={snackbarInfo.severity} sx={{ width: '100%' }}>
              {snackbarInfo.message}
           </Alert>
         </Snackbar>
      </Box> { /* Close content Box */ }
    </Box>
  );
}

export default GroceryPage; 