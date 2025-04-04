import React, { useState } from 'react';

function AddRecipeForm({ onAddRecipe }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddRecipe(url);
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="url" // Use type="url" for basic validation
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste recipe URL here"
        required
        style={{ width: '80%' }} // Basic styling
      />
      <button type="submit">Add Recipe</button>
    </form>
  );
}

export default AddRecipeForm; 