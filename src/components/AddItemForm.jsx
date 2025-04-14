import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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
      sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}
    >
      <TextField
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={`T.ex.
mjölk
1 kg potatis
soja`}
        multiline 
        rows={4}
        required
        fullWidth 
        variant="outlined"
      />
      <Typography variant="caption" display="block" sx={{ color: 'text.secondary', textAlign: 'center' }}>
        Skriv en artikel per rad. Tryck på 'retur'-knappen på tangentbordet mellan varje artikel.
      </Typography>
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