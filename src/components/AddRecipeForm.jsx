import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IosShareIcon from '@mui/icons-material/IosShare';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Helper component for inline icon styling
const InlineIcon = ({ children }) => (
  <Box component="span" sx={{ display: 'inline-flex', verticalAlign: 'middle', mx: 0.5 }}>
    {children}
  </Box>
);

function AddRecipeForm({ onAddRecipe }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return; // Prevent adding empty URLs
    onAddRecipe(url);
    setUrl('');
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      noValidate 
      sx={{ 
        mt: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1.5
      }}
    >
      <TextField
        label="Receptets webbaddress"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="T.ex. https://www.hemsida.se/linsbiffar/"
        variant="outlined"
        fullWidth
        required
        margin="normal"
        type="url"
        InputLabelProps={{ shrink: true }}
      />
      <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
        Instruktioner:
        <ol style={{ margin: 0, paddingLeft: '1.5em' }}>
          <li>Gå in på receptets hemsida i Safari (den blå appen med kompass).</li>
          <li>Tryck på 'dela'-ikonen <InlineIcon><IosShareIcon fontSize="inherit" /></InlineIcon>.</li>
          <li>Tryck på 'Kopiera' <InlineIcon><ContentCopyIcon fontSize="inherit" /></InlineIcon>.</li>
          <li>Gå tillbaka hit till appen.</li>
          <li>Tryck och håll fingret i rutan ovanför, välj 'Klistra in'.</li>
        </ol>
      </Typography>
      <Button 
        type="submit" 
        variant="contained" 
        fullWidth 
        disabled={!url.trim()}
      >
        Spara recept
      </Button>
    </Box>
  );
}

export default AddRecipeForm; 