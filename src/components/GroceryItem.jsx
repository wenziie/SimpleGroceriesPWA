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
import { useTheme } from '@mui/material/styles'; // Import useTheme

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
    if (isEditing) {
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
      setIsEditing(false);
    } else {
      // Optionally handle empty input case, e.g., revert or show error
      handleCancel(); // Or just cancel
    }
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
             opacity: !isEditing && item.completed ? 0.6 : 1,
             bgcolor: isEditing ? 'action.hover' : 'transparent' // Subtle bg when editing
            }}
        >
          {/* Checkbox */}
          <ListItemIcon sx={{ minWidth: 'auto' }}>
            <Checkbox
              edge="start"
              checked={item.completed}
              onChange={handleToggleClick} // Use dedicated handler
              disabled={isEditing}
              tabIndex={-1}
              disableRipple
              // Size adjusted via theme
            />
          </ListItemIcon>
          
          {/* Item Name or Input Field */}
          {isEditing ? (
            <TextField
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave} // Save when input loses focus
              onKeyDown={handleKeyDown}
              variant="standard" // Use standard variant for inline look
              fullWidth
              autoFocus
              sx={{ 
                 mr: 1,
                 // Remove underline for cleaner look
                 '& .MuiInput-underline:before': { borderBottom: 'none' },
                 '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                 '& .MuiInput-underline:after': { borderBottom: 'none' },
              }}
            />
          ) : (
            <ListItemText 
              primary={item.name}
              onClick={handleToggleClick} // CHANGE: Call toggle handler, not edit handler
              sx={{ 
                 textDecoration: item.completed ? 'line-through' : 'none',
                 cursor: 'pointer', // Always pointer for toggle
               }}
            />
          )}
          
          {/* Action Buttons - only show if not editing */}
          {!isEditing && (
             <Box sx={{ display: 'flex', flexShrink: 0, gap: theme.spacing(1) /* Approx 8px gap */ }}>
               <IconButton 
                 edge="end" 
                 size="medium" // Increased size
                 onClick={handleEdit} 
                 title="Redigera artikel" // Translated title
                 disabled={item.completed} 
                 // sx={{ mr: 0.5 }} // Removed margin, using gap on Box
               >
                 <EditIcon fontSize="inherit" color={item.completed ? 'disabled' : 'primary'} />
               </IconButton>
               <IconButton 
                 edge="end" 
                 size="medium" // Increased size
                 onClick={handleOpenDeleteConfirm} 
                 title="Ta bort artikel" // Translated title 
                 sx={{ color: 'error.main' }}
               >
                 <DeleteIcon fontSize="inherit" />
               </IconButton>
            </Box>
          )}
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