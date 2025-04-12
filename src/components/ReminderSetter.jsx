import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

// VAPID Public Key from environment variables (set in .env and Vercel)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  // eslint-disable-next-line
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function ReminderSetter() {
  const [customDateTime, setCustomDateTime] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsPushSupported(true);
      setPermissionStatus(Notification.permission);
      // Check if VAPID key is available
      if (!VAPID_PUBLIC_KEY) {
          console.error("VITE_VAPID_PUBLIC_KEY is not set in environment variables.");
          setFeedback("App configuration error: Missing VAPID key.");
          setIsPushSupported(false); // Treat as unsupported if key is missing
      }
    } else {
      setFeedback('Push-notiser stöds inte i denna webbläsare.');
    }
  }, []);

  // Function to schedule the reminder via backend
  const scheduleReminder = async (targetTimestamp) => {
    setFeedback(''); // Clear previous feedback
    setIsLoading(true);

    if (!isPushSupported) {
      setFeedback('Push-notiser stöds inte eller är felkonfigurerade.');
      setIsLoading(false);
      return;
    }

    let currentPermission = Notification.permission;
    if (currentPermission === 'default') {
        currentPermission = await Notification.requestPermission();
        setPermissionStatus(currentPermission);
    }

    if (currentPermission !== 'granted') {
      console.warn('Notification permission denied.');
      setFeedback('Aviseringstillstånd nekades. Kan inte sätta påminnelse.');
      setIsLoading(false);
      return;
    }

    try {
      const swRegistration = await navigator.serviceWorker.ready;
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      console.log('User is subscribed:', subscription);

      // Send subscription and timestamp to backend
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription: subscription, timestamp: targetTimestamp }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try parse error
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      // Success!
      const formattedTime = new Date(targetTimestamp).toLocaleString('sv-SE');
      setFeedback(`Påminnelse satt till ${formattedTime}. Den skickas även om appen stängs.`);
      setCustomDateTime(''); // Clear input field

    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      if (error.name === 'NotAllowedError') {
        setFeedback('Aviseringstillstånd nekades. Kan inte sätta påminnelse.');
      } else if (error.message.includes("Timestamp is in the past")) {
        setFeedback('Den valda tiden har redan passerat.');
      } else {
        setFeedback(`Kunde inte sätta påminnelse: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Button Handlers ---
  const handleSetQuickReminder = (delayMinutes) => {
    const now = Date.now();
    const targetTimestamp = now + delayMinutes * 60 * 1000;
    scheduleReminder(targetTimestamp);
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
    scheduleReminder(targetTime);
  };

  // --- Utility for DateTime Input ---
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

  // --- Render Logic ---
  const isBlocked = permissionStatus === 'denied';
  const buttonsDisabled = !isPushSupported || isBlocked || isLoading;

  return (
    <Box sx={{ mt: 2, pt: 2 }}>
       {/* Removed the old note about app needing to be open */}
       { isBlocked && (
            <Alert severity="warning" sx={{ mb: 2 }}>
                Aviseringar är blockerade för denna sida i webbläsarens inställningar.
            </Alert>
        )}
        { !isPushSupported && !feedback.includes('stöds inte') && (
             <Alert severity="error" sx={{ mb: 2 }}>
                 Ett konfigurationsfel hindrar push-notiser.
             </Alert>
        )}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => handleSetQuickReminder(30)} disabled={buttonsDisabled}>om 30 minuter</Button>
        <Button variant="outlined" onClick={() => handleSetQuickReminder(60)} disabled={buttonsDisabled}>om 1 timme</Button>
        <Button variant="outlined" onClick={() => handleSetQuickReminder(120)} disabled={buttonsDisabled}>om 2 timmar</Button>
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
          disabled={buttonsDisabled}
        />
        <Button type="submit" variant="contained" disabled={buttonsDisabled}>
            {isLoading ? 'Sätter...' : 'Sätt'}
        </Button>
      </Box>
      {feedback && (
        <Alert 
          severity={feedback.includes('nekades') || feedback.includes('Ogiltigt') || feedback.includes('passerat') || feedback.includes('Kunde inte') || feedback.includes('error') ? 'error' : 'success'} 
          sx={{ mt: 2 }}
        >
          {feedback}
        </Alert>
      )}
    </Box>
  );
}

export default ReminderSetter; 