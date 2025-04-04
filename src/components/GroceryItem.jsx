import React from 'react';

// Receive item object and handler functions as props
function GroceryItem({ item, onToggleComplete, onDeleteItem }) {
  return (
    <li style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={() => onToggleComplete(item.id)} // Call toggle function with item ID
      />
      <span style={{ margin: '0 10px' }}>{item.name}</span>
      <button onClick={() => onDeleteItem(item.id)} style={{ color: 'red', marginLeft: '10px' }}>
        X
      </button>
    </li>
  );
}

export default GroceryItem; 