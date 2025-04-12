import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

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
          new Notification('Simple Groceries Påminnelse', {
            body: 'Dags att kolla din inköpslista!',
          });
        }, delayMs);
        let unit = 'minuter';
        let amount = delayMinutes;
        if (delayMinutes === 60) { amount = 1; unit = 'timme'; }
        if (delayMinutes === 120) { amount = 2; unit = 'timmar'; }
        setFeedback(`Påminnelse satt om ${amount} ${unit}.`);
      } else {
        console.warn('Notification permission denied.');
        setFeedback('Aviseringstillstånd nekades. Kan inte sätta påminnelse.');
      }
    });
  };

  const handleSetCustomReminder = (event) => {
    event.preventDefault();
    const targetTime = new Date(customDateTime).getTime();
    const now = Date.now();

    if (isNaN(targetTime)) {
      setFeedback('Ogiltigt datum eller tid angivet.');
      return;
    }

    if (targetTime <= now) {
      setFeedback('Den valda tiden har redan passerat.');
      return;
    }

    const delayMs = targetTime - now;

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        setTimeout(() => {
          new Notification('Simple Groceries Påminnelse', {
            body: 'Dags att kolla din inköpslista!',
          });
        }, delayMs);
        const formattedTime = new Date(customDateTime).toLocaleString('sv-SE');
        setFeedback(`Påminnelse satt till ${formattedTime}.`);
      } else {
        console.warn('Notification permission denied.');
        setFeedback('Aviseringstillstånd nekades. Kan inte sätta påminnelse.');
      }
    });
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); 
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <Box sx={{ mt: 2, pt: 2 }}>
      <Typography variant="caption" component="p" sx={{ mb: 2 }}>
        Notera: Dessa påminnelser fungerar endast när app-fliken är öppen.
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => setReminder(30)}>om 30 minuter</Button>
        <Button variant="outlined" onClick={() => setReminder(60)}>om 1 timme</Button>
        <Button variant="outlined" onClick={() => setReminder(120)}>om 2 timmar</Button>
      </Stack>
      <Box component="form" onSubmit={handleSetCustomReminder} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField 
          type="datetime-local"
          label="Specifik tid"
          id="custom-reminder-time"
          value={customDateTime}
          onChange={(e) => setCustomDateTime(e.target.value)}
          inputProps={{ min: getMinDateTime() }}
          required 
          InputLabelProps={{
            shrink: true,
          }}
          size="small"
          sx={{ flexGrow: 1 }}
        />
        <Button type="submit" variant="contained">Sätt</Button>
      </Box>
      {feedback && (
        <Alert 
          severity={feedback.includes('nekades') || feedback.includes('Ogiltigt') || feedback.includes('passerat') ? 'error' : 'success'} 
          sx={{ mt: 2 }}
        >
          {feedback}
        </Alert>
      )}
    </Box>
  );
}

export default ReminderSetter; 