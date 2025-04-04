import React from 'react';
import GroceryItem from './GroceryItem';

// Receive items array and handler functions as props
function GroceryList({ items, onToggleComplete, onDeleteItem, onClearCompleted }) {

  const activeItems = items.filter(item => !item.completed);
  const completedItems = items.filter(item => item.completed);

  return (
    <div>
      <h2>Grocery List</h2>
      {activeItems.length === 0 && <p>Your list is empty.</p>}
      <ul>
        {activeItems.map(item => (
          <GroceryItem
            key={item.id}
            item={item}
            onToggleComplete={onToggleComplete}
            onDeleteItem={onDeleteItem}
          />
        ))}
      </ul>

      {completedItems.length > 0 && (
        <>
          <h2>Completed</h2>
          <button onClick={onClearCompleted} style={{ marginBottom: '1rem' }}>
            Clear Completed
          </button>
          <ul>
            {completedItems.map(item => (
              <GroceryItem
                key={item.id}
                item={item}
                onToggleComplete={onToggleComplete}
                onDeleteItem={onDeleteItem}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default GroceryList; 