import React from 'react';
import GroceryItem from './GroceryItem';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// Removed onClearCompleted prop as it's handled in the page header
function GroceryList({ items, onToggleComplete, onDeleteItem, onEditItem }) {

  // No longer need to filter into active/completed
  // const activeItems = items.filter(item => !item.completed);
  // const completedItems = items.filter(item => item.completed);

  return (
    <Box sx={{ mt: 2 }}> {/* Add margin top */}
      {/* Render message if the entire list is empty */}
      {items.length === 0 && 
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 8, mb: 4 }} // More margin
        >
            Din inköpslista är tom. Tryck på '+' eller mikrofonen för att lägga till artiklar.
        </Typography>
      }
      
      {/* Render list using MUI List */}
      {items.length > 0 && (
        // Remove disablePadding to restore default item padding
        <List /* disablePadding */>
          {items.map(item => (
            <GroceryItem
              key={item.id}
              item={item}
              onToggleComplete={onToggleComplete}
              onDeleteItem={onDeleteItem}
              onEditItem={onEditItem}
            />
          ))}
        </List>
      )}

      {/* Remove completed items section */}
      {/* {completedItems.length > 0 && ( ... )} */}
    </Box>
  );
}

export default GroceryList; 