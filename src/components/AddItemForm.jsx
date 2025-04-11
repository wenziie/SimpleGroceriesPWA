import React, { useState } from 'react';

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
    <form onSubmit={handleSubmit} style={{ marginBottom: '0.5rem' }}>
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Lägg till artiklar (en per rad)"
        rows={5}
        required
        style={{ width: '100%', resize: 'vertical', padding: '0.5em' , fontFamily: 'inherit', fontSize: '1em'}}
      />
      <button type="submit" style={{ marginTop: '0.5rem', width: '100%' }}>Lägg till</button>
    </form>
  );
}

export default AddItemForm; 