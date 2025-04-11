import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// Receive onAddItem function as a prop
function AddItemForm({ onAddItem }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    const lines = trimmedValue.split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
    lines.forEach(line => onAddItem(line));
    
    setInputValue('');
  };

  return (
    // Use Box with explicit flex column layout
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        mt: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2 // Add gap between input and button (theme spacing unit * 2)
      }}
    >
      <TextField
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Lägg till artiklar (en per rad)"
        multiline 
        rows={4}
        required
        fullWidth 
        variant="outlined" 
        // Remove mb as gap is handled by the parent Box
        // sx={{ mb: 2 }} 
      />
      <Button 
        type="submit" 
        variant="contained" 
        fullWidth // Add fullWidth back for vertical layout
        disabled={!inputValue.trim()}
      >
        Lägg till
      </Button>
    </Box>
  );
}

export default AddItemForm; 