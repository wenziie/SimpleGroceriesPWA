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

// Basic style for modal content box
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%', // Adjust width as needed
  maxWidth: 500,
  bgcolor: 'var(--background-color, white)', // Use background variable
  border: '1px solid #ccc',
  boxShadow: 24, // MUI shadow intensity
  p: 4, // Padding
  borderRadius: '8px'
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
      {/* Header Actions - Update onClick to open modals */}
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
          zIndex: 10,
          padding: '1rem 0 0.5rem 0'
        }}
      >
        {/* Left Action */}
        <button 
          onClick={handleOpenClearConfirm}
          style={{ color: 'red', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          disabled={items.length === 0}
        >
          Töm lista
        </button> 
        
        {/* Right Actions (MUI Icons) - Update onClick */}
        <div>
          <IconButton 
            onClick={handleOpenAddItem} 
            title="Add Item"
            style={{ backgroundColor: '#43CB37', borderRadius: '50%', marginRight: '0.5rem' }}
          >
            <AddIcon style={{ color: 'var(--primary-button-icon-color)' }} />
          </IconButton>
          <IconButton 
            onClick={handleOpenVoiceInput} 
            title="Add by Voice"
            style={{ backgroundColor: '#43CB37', borderRadius: '50%', marginRight: '0.5rem' }}
          >
            <MicIcon style={{ color: 'var(--primary-button-icon-color)' }} />
          </IconButton>
          <IconButton 
            onClick={handleOpenReminders} 
            title="Set Reminder"
            disabled={items.length === 0} 
            style={{ color: items.length > 0 ? 'var(--primary-color)' : 'grey' }}
          >
            <NotificationsIcon />
          </IconButton>
        </div>
      </div>

      {/* --- Modals --- */}
      {/* Add Item Modal */}
      <Modal
        open={showAddItem}
        onClose={handleCloseAddItem}
        aria-labelledby="add-item-modal-title"
      >
        <Box sx={modalStyle}>
          <IconButton onClick={handleCloseAddItem} style={{ position: 'absolute', top: 8, right: 8}} title="Close">
            <CloseIcon />
          </IconButton>
          <h4 id="add-item-modal-title">Lägg till artikel</h4>
          <AddItemForm onAddItem={addItem} />
        </Box>
      </Modal>

      {/* Voice Input Modal */}
      <Modal
        open={showVoiceInput}
        onClose={handleCloseVoiceInput}
        aria-labelledby="voice-input-modal-title"
      >
        <Box sx={modalStyle}>
           <IconButton onClick={handleCloseVoiceInput} style={{ position: 'absolute', top: 8, right: 8}} title="Close">
            <CloseIcon />
          </IconButton>
           {/* Note: VoiceInput needs onAddItem prop */}
          <VoiceInput onAddItem={addItem} /> 
        </Box>
      </Modal>

      {/* Reminder Modal */}
      <Modal
        open={showReminders}
        onClose={handleCloseReminders}
        aria-labelledby="reminder-modal-title"
      >
        <Box sx={modalStyle}>
           <IconButton onClick={handleCloseReminders} style={{ position: 'absolute', top: 8, right: 8}} title="Close">
            <CloseIcon />
          </IconButton>
          <ReminderSetter />
        </Box>
      </Modal>

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