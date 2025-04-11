import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography'; // For text
import Alert from '@mui/material/Alert'; // For feedback
import Stack from '@mui/material/Stack'; // For button layout

function ReminderSetter() {
  const [customDateTime, setCustomDateTime] = useState('');
  const [feedback, setFeedback] = useState('');

  // Function to handle requesting permission and setting timeout
  const setReminder = (delayMinutes) => {
    setFeedback(''); // Clear previous feedback
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        const delayMs = delayMinutes * 60 * 1000;
        setTimeout(() => {
          new Notification('Simple Groceries Reminder', {
            body: 'Time to check your grocery list!',
            // Optional: Add icon later if PWA icons are fixed
            // icon: '/icon.png' 
          });
        }, delayMs);
        setFeedback(`Reminder set for ${delayMinutes} minutes from now.`);
      } else {
        console.warn('Notification permission denied.');
        setFeedback('Notification permission was denied. Cannot set reminder.');
      }
    });
  };

  const handleSetCustomReminder = (event) => {
    event.preventDefault();
    setFeedback('');
    if (!customDateTime) {
        setFeedback('Please select a date and time.');
        return;
    }
    
    const targetTime = new Date(customDateTime).getTime();
    const now = Date.now();

    if (isNaN(targetTime)) {
        setFeedback('Invalid date/time format.');
        return;
    }

    if (targetTime <= now) {
        setFeedback('Please select a future date and time.');
        return;
    }

    const delayMs = targetTime - now;
    const delayMinutes = Math.round(delayMs / (60 * 1000));

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        setTimeout(() => {
          new Notification('Simple Groceries Reminder', {
            body: 'Time to check your grocery list!',
            // icon: '/icon.png' 
          });
        }, delayMs);
        const formattedDate = new Date(customDateTime).toLocaleString();
        setFeedback(`Reminder set for ${formattedDate}.`);
        setCustomDateTime(''); // Clear input
      } else {
        console.warn('Notification permission denied.');
        setFeedback('Notification permission was denied. Cannot set reminder.');
      }
    });

  };

  // Get current datetime in the format required by datetime-local input
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone
    now.setSeconds(0); // Ignore seconds
    now.setMilliseconds(0); // Ignore milliseconds
    return now.toISOString().slice(0, 16);
  }

  return (
    <Box sx={{ mt: 2, pt: 2 }}>
      <Typography variant="h6" component="h4" gutterBottom>
        Set Reminder (In-App)
      </Typography>
      <Typography variant="caption" component="p" sx={{ mb: 2 }}>
        Note: These reminders only work while the app tab is open.
      </Typography>
      {/* Use Stack for horizontal button layout */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => setReminder(30)}>30 mins</Button>
        <Button variant="outlined" onClick={() => setReminder(60)}>1 hour</Button>
        <Button variant="outlined" onClick={() => setReminder(120)}>2 hours</Button>
      </Stack>
      <Box component="form" onSubmit={handleSetCustomReminder} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Use TextField for datetime-local input */}
        <TextField 
          type="datetime-local"
          label="Specific time" // Use label prop
          id="custom-reminder-time"
          value={customDateTime}
          onChange={(e) => setCustomDateTime(e.target.value)}
          inputProps={{ min: getMinDateTime() }} // Pass min via inputProps
          required 
          InputLabelProps={{
            shrink: true, // Keep label shrunk
          }}
          size="small" // Make it slightly smaller
          sx={{ flexGrow: 1 }}
        />
        <Button type="submit" variant="contained">Set</Button>
      </Box>
      {/* Use Alert for feedback */}
      {feedback && (
        <Alert 
          severity={feedback.includes('denied') || feedback.includes('Invalid') || feedback.includes('past') ? 'error' : 'success'} 
          sx={{ mt: 2 }}
        >
          {feedback}
        </Alert>
      )}
    </Box>
  );
}

export default ReminderSetter; 