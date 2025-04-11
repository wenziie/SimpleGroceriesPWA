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
    // Use Box instead of form for layout, handle submit on button
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 /* Add margin top */ }}>
      <TextField
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Lägg till artiklar (en per rad)"
        multiline // Use multiline TextField instead of textarea
        rows={4}
        required
        fullWidth // Take full width
        variant="outlined" // Standard outlined style
        sx={{ mb: 2 /* Add margin bottom */ }}
      />
      <Button 
        type="submit" 
        variant="contained" 
        fullWidth
        disabled={!inputValue.trim()} // Disable if input is empty
      >
        Lägg till
      </Button>
    </Box>
  );
}

export default AddItemForm; 