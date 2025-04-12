import React, { useState, useEffect, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// Remove Modal, Box, Button, Typography imports if no longer needed
// Keep Button if used elsewhere, Box might be needed for layout
// We'll keep Button and Box for now, just remove Modal and Typography specific to the old modal
import Box from '@mui/material/Box'; // Likely still used for layout
import Button from '@mui/material/Button'; // Likely still used for edit buttons if applicable, or future use
import ConfirmationModal from './ConfirmationModal'; // Import the reusable modal
// Import MUI components for list items
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper'; // To wrap the item
import { useTheme, alpha } from '@mui/material/styles'; // Import useTheme and alpha for color manipulation

// Remove the old modalStyle definition
// const modalStyle = { ... };

// Accept onEditItem prop
function GroceryItem({ item, onToggleComplete, onDeleteItem, onEditItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.name);
  const inputRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Keep state for delete modal visibility
  const theme = useTheme(); // Get theme for spacing

  // --- Edit handlers (remain the same) ---
  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Just focus, remove select
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedName = editText.trim();
    if (trimmedName) {
      onEditItem(item.id, trimmedName); // Call the edit function passed from props
    }
    // Always exit editing mode on save/blur, even if empty
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(item.name); // Reset text to original
    setIsEditing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };


  // --- Delete Confirmation Handlers (remain the same) ---
  const handleOpenDeleteConfirm = () => setShowDeleteConfirm(true);
  const handleCloseDeleteConfirm = () => setShowDeleteConfirm(false);

  const handleDeleteConfirm = () => {
    onDeleteItem(item.id); // Call original delete function
    handleCloseDeleteConfirm(); // Close modal
  };

  const handleToggleClick = () => {
    if (!isEditing) {
      onToggleComplete(item.id);
    }
  };

  const handleTextClick = () => {
    if (!item.completed) { // Only allow edit if not completed
       setIsEditing(true);
    }
  }

  return (
    <>
      {/* Wrap each item in Paper for elevation/border */}
      <Paper sx={{ mb: 1, overflow: 'hidden' /* Prevent content overflow */ }}>
        <ListItem 
          sx={{ 
            // Removed bgcolor change on edit
            // bgcolor: isEditing ? 'action.hover' : 'transparent'
            }}
        >
          {/* Checkbox - Keep enabled but don't trigger toggle when editing */}
          <ListItemIcon sx={{ minWidth: 'auto' }}>
            <Checkbox
              edge="start"
              checked={item.completed}
              onChange={handleToggleClick} 
              // disabled={isEditing} // Keep enabled visually
              tabIndex={-1}
              disableRipple
            />
          </ListItemIcon>
          
          {/* Item Name or Input Field */}
          {isEditing ? (
            <TextField
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave} // Save on blur
              onKeyDown={handleKeyDown}
              variant="standard"
              fullWidth
              // autoFocus removed because we handle focus in useEffect
              sx={{ 
                 mr: 1, 
                 // Keep default underline before focus
                 // '& .MuiInput-underline:before': { borderBottom: 'none' }, 
                 // Keep default underline on hover
                 // '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                 // Style the underline green when focused (after state)
                 '& .MuiInput-underline:after': {
                    borderBottomColor: theme.palette.success.main, // Use theme's success color
                 },
              }}
            />
          ) : (
            <ListItemText 
              primary={item.name}
              onClick={handleEdit} // Trigger edit on text click when not completed
              sx={{ 
                 textDecoration: item.completed ? 'line-through' : 'none',
                 cursor: item.completed ? 'default' : 'pointer', // Only pointer if editable
               }}
            />
          )}
          
          {/* Action Buttons - Always show, disable when editing */}
           <Box sx={{ display: 'flex', flexShrink: 0, gap: theme.spacing(1) }}>
             <IconButton 
               edge="end" 
               size="medium"
               onClick={handleEdit} 
               title="Redigera artikel"
               disabled={isEditing || item.completed} // Disable if editing OR completed
               color={item.completed ? 'disabled' : (isEditing ? 'disabled' : 'primary')}
             >
               <EditIcon fontSize="inherit" />
             </IconButton>
             <IconButton 
               edge="end" 
               size="medium"
               onClick={handleOpenDeleteConfirm} 
               title="Ta bort artikel"
               disabled={isEditing} // Disable if editing
               sx={{ color: isEditing ? alpha(theme.palette.error.main, 0.3) : theme.palette.error.main }} // Fade if disabled
             >
               <DeleteIcon fontSize="inherit" />
             </IconButton>
          </Box>
        </ListItem>
      </Paper>

      {/* Use the reusable ConfirmationModal */}
      <ConfirmationModal
        open={showDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        title="Bekräfta borttagning"
        message={`Är du säker på att du vill ta bort "${item.name}"?`}
        confirmText="Ja, ta bort"
        cancelText="Avbryt"
        confirmColor="error" // Keep the red confirm button for delete
      />
      
      {/* Remove the old Modal implementation */}
      {/* <Modal ... > ... </Modal> */}
    </>
  );
}

export default GroceryItem; 