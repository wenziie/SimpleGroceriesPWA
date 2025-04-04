import React, { useState } from 'react';

// Receive onAddItem function as a prop
function AddItemForm({ onAddItem }) {
  const [inputValue, setInputValue] = useState('');
  const [isMultiLine, setIsMultiLine] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    if (isMultiLine) {
      // Split by newline, trim each line, filter out empty lines
      const lines = trimmedValue.split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');
      lines.forEach(line => onAddItem(line));
    } else {
      onAddItem(trimmedValue);
    }

    setInputValue(''); // Clear the input/textarea
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: '0.5rem' }}>
        {isMultiLine ? (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add multiple items (one per line)"
            rows={4} // Adjust initial height as needed
            required
            style={{ width: '100%', resize: 'vertical', padding: '0.5em' , fontFamily: 'inherit', fontSize: '1em'}}
          />
        ) : (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new item"
            required
            // Input style is handled by index.css
          />
        )}
        <button type="submit">Add</button>
      </form>
      <button onClick={() => setIsMultiLine(!isMultiLine)} style={{ fontSize: '0.8em', padding: '0.3em 0.6em' }}>
        {isMultiLine ? 'Switch to Single Item' : 'Add Multiple Items'}
      </button>
    </div>
  );
}

export default AddItemForm; 