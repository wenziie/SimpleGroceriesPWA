import React, { useState } from 'react';
import GroceryList from '../components/GroceryList';
import AddItemForm from '../components/AddItemForm';
import VoiceInput from '../components/VoiceInput';
import ReminderSetter from '../components/ReminderSetter';
// MUI Imports
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import MicIcon from '@mui/icons-material/Mic';
import NotificationsIcon from '@mui/icons-material/Notifications';

function GroceryPage({ 
  items, 
  addItem, 
  toggleComplete, 
  deleteItem, 
  clearCompletedItems, 
  clearAllItems
}) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showReminders, setShowReminders] = useState(false);

  // Handler to add item and potentially close the form/modal
  const handleAddItem = (name) => {
    addItem(name);
    // Optionally close form after adding: setShowAddItem(false);
  }

  return (
    <div>
      {/* Header Actions - Apply sticky styles */}
      <div 
        style={{
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem',
          // Sticky styles
          position: 'sticky',
          top: 0,
          zIndex: 10, // Ensure it stays on top
          paddingTop: '1rem', // Add padding for spacing
          paddingBottom: '0.5rem'
        }}
      >
        {/* Left Action */}
        <button 
          onClick={clearAllItems} 
          style={{ 
            color: 'red', 
            background: 'none', 
            border: 'none', 
            padding: 0,
            cursor: 'pointer'
          }}
        >
          Töm lista
        </button>
        
        {/* Right Actions (MUI Icons) */}
        <div>
          <IconButton 
            onClick={() => setShowAddItem(!showAddItem)} 
            title="Add Item"
            style={{ backgroundColor: '#43CB37', borderRadius: '50%', marginRight: '0.5rem' }}
          >
            <AddIcon style={{ color: 'var(--primary-button-icon-color)' }} />
          </IconButton>
          <IconButton 
            onClick={() => setShowVoiceInput(!showVoiceInput)} 
            title="Add by Voice"
            style={{ backgroundColor: '#43CB37', borderRadius: '50%', marginRight: '0.5rem' }}
          >
            <MicIcon style={{ color: 'var(--primary-button-icon-color)' }} />
          </IconButton>
          <IconButton 
            onClick={() => setShowReminders(!showReminders)} 
            title="Set Reminder"
            disabled={items.length === 0}
            style={{ color: items.length > 0 ? 'var(--primary-color)' : 'grey' }}
          >
            <NotificationsIcon />
          </IconButton>
        </div>
      </div>

      {/* Conditional Rendering of Input Components */}
      {showAddItem && <AddItemForm onAddItem={handleAddItem} />}
      {showVoiceInput && <VoiceInput onAddItem={addItem} />}
      {showReminders && <ReminderSetter />}

      {/* Grocery List */}
      <GroceryList 
        items={items} 
        onToggleComplete={toggleComplete} 
        onDeleteItem={deleteItem} 
        onClearCompleted={clearCompletedItems} // Pass down again for internal button?
        // Note: Clear completed button might be better placed ONLY in the header now
      />
    </div>
  );
}

export default GroceryPage; 