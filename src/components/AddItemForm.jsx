import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// Receive onAddItem function as a prop
function AddItemForm({ onAddItem }) {
  const [itemNames, setItemNames] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const namesArray = itemNames.split('\n').map(name => name.trim()).filter(name => name !== '');
    namesArray.forEach(name => onAddItem(name));
    setItemNames(''); // Clear the textarea
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}> 
      <TextField
        label="Artiklar"
        multiline
        rows={4}
        value={itemNames}
        onChange={(e) => setItemNames(e.target.value)}
        placeholder="Skriv artiklar, tryck retur mellan varje artikel"
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <Button 
        type="submit" 
        variant="contained" 
        fullWidth 
        disabled={itemNames.trim() === ''}
        sx={{ mt: 2, mb: 2 }}
      >
        Lägg till
      </Button>
    </Box>
  );
}

export default AddItemForm; 