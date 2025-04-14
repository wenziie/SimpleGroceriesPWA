import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function AddRecipeForm({ onAddRecipe }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return; // Prevent adding empty URLs
    onAddRecipe(url);
    setUrl('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
      <Typography variant="caption" display="block" gutterBottom sx={{ mt: 1, color: 'text.secondary' }}>
        Instruktion:
        <ol style={{ margin: 0, paddingLeft: '1.5em' }}>
          <li>Öppna receptet du vill spara i Safari (webbläsaren).</li>
          <li>Tryck på adressfältet högst upp (där det står t.ex. google.com).</li>
          <li>Välj 'Kopiera'.</li>
          <li>Gå tillbaka hit till appen.</li>
          <li>Tryck och håll fingret i rutan ovanför, välj 'Klistra in'.</li>
        </ol>
      </Typography>
      <Button 
        type="submit" 
        variant="contained" 
        fullWidth 
        disabled={!url.trim()}
        sx={{ mt: 2, mb: 2 }}
      >
        Spara recept
      </Button>
    </Box>
  );
}

export default AddRecipeForm; 