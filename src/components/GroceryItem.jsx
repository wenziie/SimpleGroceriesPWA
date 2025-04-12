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
import { useTheme } from '@mui/material/styles'; // Removed alpha

// Remove the old modalStyle definition
// const modalStyle = { ... };

// Accept onEditItem prop
function GroceryItem({ item, onToggleComplete, onDeleteItem, onEditItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.name);
  const inputRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Keep state for delete modal visibility
  const theme = useTheme(); // Get theme for spacing

  // RE-ADDED useEffect specifically for focusing when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
       // Wrap in setTimeout to ensure focus occurs after render
       setTimeout(() => inputRef.current?.focus(), 0);
    }
    // Dependency array ensures this runs only when isEditing changes
  }, [isEditing]); 

  const handleEdit = () => {
    if (isEditing || item.completed) return; 
    setIsEditing(true);
    // REMOVED focus logic from here
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
  const handleOpenDeleteConfirm = () => {
    // if (isEditing) return; // REMOVED: Allow delete even when editing
    setShowDeleteConfirm(true);
  };
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
            // Align items centrally to help with jump
            alignItems: 'center' 
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
              onBlur={handleSave} 
              onKeyDown={handleKeyDown}
              variant="standard"
              fullWidth
              sx={{ 
                 mr: 1, 
                 // Attempt to match ListItemText vertical position
                 py: '6px', // Adjust padding to match ListItemText roughly
                 mt: '-3px', // Try slight negative margin to pull up
                 mb: '-4px',
                 // Underline styles
                 '& .MuiInput-underline:before': { borderBottom: 'none' }, 
                 '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                 '& .MuiInput-underline:after': { borderBottomColor: theme.palette.primary.main },
              }}
              // Make input text look like list item text
              InputProps={{ disableUnderline: false, sx: { typography: 'body1' } }} 
            />
          ) : (
            <ListItemText 
              primary={item.name}
              onClick={handleToggleClick} // RESTORED: Click text toggles completion
              sx={{ 
                 textDecoration: item.completed ? 'line-through' : 'none',
                 cursor: 'pointer', // RESTORED: Pointer cursor for toggle
                 // Add consistent padding to match TextField attempt
                 py: '6px' 
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
               color={item.completed ? 'disabled' : 'primary'} // Color only based on completed
             >
               <EditIcon fontSize="inherit" />
             </IconButton>
             <IconButton 
               edge="end" 
               size="medium"
               onClick={handleOpenDeleteConfirm} 
               title="Ta bort artikel"
               color="error" 
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