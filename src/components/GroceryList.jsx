import React from 'react';
import GroceryItem from './GroceryItem';

// Receive items array and handler functions as props
function GroceryList({ items, onToggleComplete, onDeleteItem, onClearCompleted }) {

  const activeItems = items.filter(item => !item.completed);
  const completedItems = items.filter(item => item.completed);

  return (
    <div>
      <h2>Inköpslista</h2>
      {activeItems.length === 0 && 
        <p 
          style={{
            textAlign: 'center', 
            color: 'grey', 
            marginTop: '4rem' /* Increased margin */
          }}
        >
            Din inköpslista är tom. Tryck på '+' eller mikrofonen för att lägga till artiklar.
        </p>
      }
      {activeItems.length > 0 && 
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
      }

      {completedItems.length > 0 && (
        <>
          <h2>Completed</h2>
          {/* 
          <button onClick={onClearCompleted} style={{ marginBottom: '1rem' }}>
            Clear Completed
          </button> 
          */}
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