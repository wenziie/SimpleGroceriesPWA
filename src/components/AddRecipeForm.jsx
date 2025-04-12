import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

function AddRecipeForm({ onAddRecipe }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return; // Prevent adding empty URLs
    onAddRecipe(url);
    setUrl('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
      <TextField
        type="url" // Use type="url" for basic validation
        label="Recept-URL" // Changed label
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Klistra in receptets URL här" // Changed placeholder
        required
        fullWidth
        variant="outlined"
        size="small" // Match other inputs potentially
        sx={{ mb: 2 }} // Add margin below text field
      />
      <Button 
         type="submit" 
         variant="contained" 
         disabled={!url.trim()} // Disable if URL is empty
         fullWidth // Make button full width
       >
         Lägg till
       </Button>
    </Box>
  );
}

export default AddRecipeForm; 