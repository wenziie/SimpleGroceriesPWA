import React, { useState } from 'react';

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
    <div style={{ marginTop: '1.5rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
      <h4>Set Reminder (In-App)</h4>
      <p style={{ fontSize: '0.8em', fontStyle: 'italic' }}>Note: These reminders only work while the app tab is open.</p>
      <div>
        <button onClick={() => setReminder(30)} style={{ marginRight: '0.5rem' }}>Remind in 30 mins</button>
        <button onClick={() => setReminder(60)} style={{ marginRight: '0.5rem' }}>Remind in 1 hour</button>
        <button onClick={() => setReminder(120)}>Remind in 2 hours</button>
      </div>
      <form onSubmit={handleSetCustomReminder} style={{ marginTop: '1rem' }}>
        <label htmlFor="custom-reminder-time" style={{ marginRight: '0.5rem'}}>Specific time:</label>
        <input 
          type="datetime-local"
          id="custom-reminder-time"
          value={customDateTime}
          onChange={(e) => setCustomDateTime(e.target.value)}
          min={getMinDateTime()} // Prevent selecting past dates
          required 
        />
        <button type="submit" style={{ marginLeft: '0.5rem' }}>Set Custom Reminder</button>
      </form>
      {feedback && <p style={{ marginTop: '0.5rem', color: feedback.includes('denied') || feedback.includes('Invalid') || feedback.includes('past') ? 'red' : 'green' }}>{feedback}</p>}
    </div>
  );
}

export default ReminderSetter; 