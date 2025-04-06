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

// Remove the old modalStyle definition
// const modalStyle = { ... };

// Accept onEditItem prop
function GroceryItem({ item, onToggleComplete, onDeleteItem, onEditItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.name);
  const inputRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Keep state for delete modal visibility

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

  return (
    <>
      <li style={{
        textDecoration: !isEditing && item.completed ? 'line-through' : 'none',
        opacity: !isEditing && item.completed ? 0.6 : 1,
        display: 'flex', 
        alignItems: 'center', 
        padding: '8px 0'
      }}>
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={item.completed}
          onChange={() => !isEditing && onToggleComplete(item.id)} // Disable toggle when editing
          disabled={isEditing}
          style={{ marginRight: '10px', flexShrink: 0 }}
        />
        
        {/* Item Name or Input Field */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave} // Save when input loses focus
            onKeyDown={handleKeyDown}
            style={{ flexGrow: 1, marginRight: '10px', padding: '4px' }} // Basic styling
          />
        ) : (
          <span 
            onClick={handleEdit} // Allow clicking name to edit (optional)
            style={{ flexGrow: 1, marginRight: '10px', cursor: 'pointer' }} // Add cursor pointer
          >
            {item.name}
          </span>
        )}
        
        {/* Action Buttons */}
        <div style={{ flexShrink: 0, opacity: 1 }}> {/* Ensure buttons are always visible */}
          <IconButton 
            size="small" 
            onClick={handleEdit} 
            title="Edit Item" 
            disabled={isEditing} 
            style={{ marginRight: '5px', color: 'var(--primary-color)' }} // Add back primary color
          >
            <EditIcon fontSize="small" />
          </IconButton>
          {/* Delete button still opens the confirmation */}
          <IconButton 
            size="small" 
            onClick={handleOpenDeleteConfirm} 
            title="Delete Item" 
            style={{ color: 'red' }} 
            disabled={isEditing} 
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
      </li>

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