import React from 'react';
import GroceryItem from './GroceryItem';

// Removed onClearCompleted prop as it's handled in the page header
function GroceryList({ items, onToggleComplete, onDeleteItem, onEditItem }) {

  // No longer need to filter into active/completed
  // const activeItems = items.filter(item => !item.completed);
  // const completedItems = items.filter(item => item.completed);

  return (
    <div>
      {/* Heading removed as it's handled in the page header */}
      {/* <h2>Inköpslista</h2> */}
      
      {/* Render message if the entire list is empty */}
      {items.length === 0 && 
        <p 
          style={{
            textAlign: 'center', 
            color: 'grey', 
            marginTop: '4rem'
          }}
        >
            Din inköpslista är tom. Tryck på '+' eller mikrofonen för att lägga till artiklar.
        </p>
      }
      
      {/* Render single list with all items */}
      {items.length > 0 && (
        <ul>
          {items.map(item => (
            <GroceryItem
              key={item.id}
              item={item}
              onToggleComplete={onToggleComplete}
              onDeleteItem={onDeleteItem}
              onEditItem={onEditItem}
            />
          ))}
        </ul>
      )}

      {/* Remove completed items section */}
      {/* {completedItems.length > 0 && ( ... )} */}
    </div>
  );
}

export default GroceryList; 