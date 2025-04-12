import React, { useState, useEffect, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import ConfirmationModal from './ConfirmationModal';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';

function GroceryItem({ 
  item, 
  onToggleComplete, 
  onDeleteItem, 
  isEditing,
  onEditRequest, 
  onSaveEdit, 
  onCancelEdit 
}) {
  const [editText, setEditText] = useState(item.name);
  const inputRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (!isEditing) {
      setEditText(item.name);
    }
  }, [item.name, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
       setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isEditing]); 

  const handleEdit = () => {
    if (item.completed) return;
    setEditText(item.name);
    onEditRequest(item.id);
  };

  const handleSave = () => {
    const trimmedName = editText.trim();
    if (trimmedName && trimmedName !== item.name) {
      onSaveEdit(item.id, trimmedName); 
    } else {
      onCancelEdit();
    }
  };

  const handleCancel = () => {
     onCancelEdit();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  const handleOpenDeleteConfirm = () => setShowDeleteConfirm(true);
  const handleCloseDeleteConfirm = () => setShowDeleteConfirm(false);

  const handleDeleteConfirm = () => {
    onDeleteItem(item.id); 
    handleCloseDeleteConfirm();
  };

  const handleToggleClick = () => {
    if (!isEditing) { 
      onToggleComplete(item.id);
    }
  };

  return (
    <>
      <Paper sx={{ mb: 1, overflow: 'hidden' }}>
        <ListItem>
          <ListItemIcon sx={{ minWidth: 'auto' }}>
            <Checkbox
              edge="start"
              checked={item.completed}
              onChange={handleToggleClick} 
              disabled={isEditing}
              tabIndex={-1}
              disableRipple
            />
          </ListItemIcon>
          
          <TextField
            inputRef={inputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave} 
            onKeyDown={handleKeyDown}
            variant="standard"
            fullWidth
            sx={{ 
               mr: 1, 
               cursor: !isEditing && !item.completed ? 'pointer' : 'default',
               '& .MuiInput-root': {
                 padding: 0,
                 marginTop: '3px',
                 marginBottom: '4px'
               },
               '& .MuiInput-underline:before': { 
                  borderBottom: isEditing ? undefined : 'none' 
               }, 
               '& .MuiInput-underline:hover:not(.Mui-disabled):before': { 
                  borderBottom: isEditing ? undefined : 'none'
               },
               '& .MuiInput-underline:after': {
                  borderBottomColor: isEditing ? theme.palette.primary.main : 'transparent',
               },
               '& .MuiInputBase-input': {
                  textDecoration: item.completed && !isEditing ? 'line-through' : 'none',
                  ...theme.typography.body1,
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  outline: 'none',
                  boxShadow: 'none',
               },
            }}
            InputProps={{ 
              readOnly: !isEditing,
              disableUnderline: !isEditing,
            }} 
            onClick={() => { if (!isEditing && !item.completed) handleEdit(); }}
          />
          
           <Box sx={{ display: 'flex', flexShrink: 0, gap: theme.spacing(1) }}>
             <IconButton 
               edge="end" 
               size="medium"
               onClick={handleEdit} 
               title="Redigera artikel"
               disabled={isEditing || item.completed}
               color="primary"
             >
               <EditIcon fontSize="inherit" />
             </IconButton>
             <IconButton 
               edge="end" 
               size="medium"
               onClick={handleOpenDeleteConfirm} 
               title="Ta bort artikel"
               disabled={isEditing}
               color="error"
             >
               <DeleteIcon fontSize="inherit" />
             </IconButton>
          </Box>
        </ListItem>
      </Paper>

      <ConfirmationModal
        open={showDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        title="Bekräfta borttagning"
        message={`Är du säker på att du vill ta bort "${item.name}"?`}
        confirmText="Ja, ta bort"
        cancelText="Avbryt"
        confirmColor="error"
      />
    </>
  );
}

export default GroceryItem; 