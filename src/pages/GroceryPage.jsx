import React, { useState } from 'react';
import GroceryList from '../components/GroceryList';
import AddItemForm from '../components/AddItemForm';
import VoiceInput from '../components/VoiceInput';
import ReminderSetter from '../components/ReminderSetter';
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
  // State remains the same - controls modal visibility
  const [showAddItem, setShowAddItem] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  // State for the new clear confirmation modal
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Handlers to open modals
  const handleOpenAddItem = () => setShowAddItem(true);
  const handleCloseAddItem = () => setShowAddItem(false);
  const handleOpenVoiceInput = () => setShowVoiceInput(true);
  const handleCloseVoiceInput = () => setShowVoiceInput(false);
  const handleOpenReminders = () => setShowReminders(true);
  const handleCloseReminders = () => setShowReminders(false);

  // Handlers for the new clear confirmation modal
  const handleOpenClearConfirm = () => setShowClearConfirm(true);
  const handleCloseClearConfirm = () => setShowClearConfirm(false);
  
  const handleConfirmClear = () => {
    clearAllItems(); // Call the original clear function
    handleCloseClearConfirm(); // Close the modal
  };

  // Update handler to close modal on add
  const handleAddItemAndClose = (name) => {
    addItem(name);
    handleCloseAddItem(); // Close modal after adding
  }

  return (
    <div>
      {/* Refactor Header Actions using AppBar */}
      <AppBar 
        position="sticky" 
        color="inherit" 
        elevation={1} 
        sx={{ 
           maxWidth: 'calc(600px + 3rem)',
           left: 'auto',
           right: 'auto',
           mx: 'auto',
           bgcolor: 'background.paper'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
           {/* Left Action - Use MUI Button */}
           <Button 
             onClick={handleOpenClearConfirm}
             color="error" // Use error color for destructive action
             size="small"
             startIcon={<DeleteSweepIcon />} // Add an icon
             disabled={items.length === 0}
           >
              Töm lista
           </Button> 
           
           {/* Right Actions Group */}
           <Box>
             <IconButton 
               onClick={handleOpenAddItem} 
               title="Add Item"
               // Use sx prop for better theme integration
               sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText', // Use contrast text color
                  mr: 1, // Add margin right using theme spacing
                  '&:hover': { // Darken on hover
                    bgcolor: 'primary.dark', 
                  }
                }}
             >
               <AddIcon /> 
             </IconButton>
             <IconButton 
               onClick={handleOpenVoiceInput} 
               title="Add by Voice"
               sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText', 
                  mr: 1, 
                  '&:hover': { 
                    bgcolor: 'primary.dark', 
                  }
               }}
             >
               <MicIcon /> 
             </IconButton>
             <IconButton 
               onClick={handleOpenReminders} 
               title="Set Reminder"
               disabled={items.length === 0} 
               color={items.length > 0 ? 'primary' : 'default'} // Use default instead of inherit
             >
               <NotificationsIcon />
             </IconButton>
           </Box>
        </Toolbar>
      </AppBar>

      {/* Sticky Title Header */}
      <AppBar 
        position="sticky"
        color="inherit"
        elevation={0} // No shadow needed, just background
        sx={{ 
          top: 64, // Adjust based on main AppBar height (default is 64px, check if different)
          zIndex: 9, // Below main AppBar
          maxWidth: 'calc(600px + 3rem)', 
          left: 'auto',
          right: 'auto',
          mx: 'auto',
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar variant="dense"> {/* Use dense for less height */}
          <Typography variant="h6" component="h2" sx={{ color: 'text.primary' }}>
            Inköpslista
          </Typography>
        </Toolbar>
      </AppBar>

      {/* --- Modals --- */}
      {/* Refactor Add Item Modal to Dialog */}
      <Dialog
        open={showAddItem}
        onClose={handleCloseAddItem}
        aria-labelledby="add-item-dialog-title"
      >
        <DialogTitle id="add-item-dialog-title">
          Lägg till artikel
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

      {/* Refactor Reminder Modal to Dialog */}
      <Dialog
        open={showReminders}
        onClose={handleCloseReminders}
        aria-labelledby="reminder-dialog-title"
      >
        <DialogTitle id="reminder-dialog-title">
          Set Reminder
          <IconButton
            aria-label="close"
            onClick={handleCloseReminders}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <ReminderSetter />
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

      {/* Grocery List */}
      <GroceryList 
        items={items} 
        onToggleComplete={toggleComplete} 
        onDeleteItem={deleteItem} 
        onEditItem={editItem}
      />
    </div>
  );
}

export default GroceryPage; 