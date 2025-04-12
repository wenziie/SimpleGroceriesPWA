import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
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
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        mt: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2
      }}
    >
      <TextField
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Skriv artiklar, tryck retur mellan varje artikel"
        multiline 
        rows={4}
        required
        fullWidth 
        variant="outlined"
      />
      <Button 
        type="submit" 
        variant="contained" 
        fullWidth
        disabled={!inputValue.trim()}
      >
        Lägg till
      </Button>
    </Box>
  );
}

export default AddItemForm; 