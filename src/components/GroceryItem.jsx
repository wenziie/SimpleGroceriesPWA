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

  // REMOVED useEffect for focus
  // useEffect(() => { ... }, [isEditing]);

  // Updated handleEdit to focus directly after state update
  const handleEdit = () => {
    setIsEditing(true);
    // Use rAF to wait for next frame after state update/re-render
    requestAnimationFrame(() => {
       if (inputRef.current) {
          inputRef.current.focus();
       }
    });
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
              onBlur={handleSave} 
              onKeyDown={handleKeyDown}
              variant="standard"
              fullWidth
              sx={{ 
                 mr: 1, 
                 // Hide the default underline always
                 '& .MuiInput-underline:before': { 
                    borderBottom: 'none' 
                 }, 
                 // Hide the underline on hover too
                 '& .MuiInput-underline:hover:not(.Mui-disabled):before': { 
                    borderBottom: 'none' 
                 },
                 // Style the focused underline with primary color
                 '& .MuiInput-underline:after': {
                    borderBottomColor: theme.palette.primary.main, 
                 },
              }}
            />
          ) : (
            <ListItemText 
              primary={item.name}
              // onClick={handleEdit} // REMOVED: Only pen icon should trigger edit
              sx={{ 
                 textDecoration: item.completed ? 'line-through' : 'none',
                 // cursor: item.completed ? 'default' : 'pointer', // REMOVED: No longer clickable
                 cursor: 'default' // Set cursor to default
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
               disabled={isEditing || item.completed} 
               // Keep color primary, let disabled handle pointer-events
               sx={{ 
                  color: theme.palette.primary.main,
                  // Reduce opacity slightly if disabled, but keep color
                  opacity: (isEditing || item.completed) ? 0.5 : 1 
               }}
             >
               <EditIcon fontSize="inherit" />
             </IconButton>
             <IconButton 
               edge="end" 
               size="medium"
               onClick={handleOpenDeleteConfirm} 
               title="Ta bort artikel"
               disabled={isEditing} 
               // Keep color error, let disabled handle pointer-events
               sx={{ 
                 color: theme.palette.error.main,
                 // Reduce opacity slightly if disabled, but keep color
                 opacity: isEditing ? 0.5 : 1 
                }}
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