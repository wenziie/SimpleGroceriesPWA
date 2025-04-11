import React, { useState, useEffect, useRef } from 'react';
// MUI Imports
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import Button from '@mui/material/Button'; // Use MUI Button

// Get the correct SpeechRecognition object based on browser vendor prefixes
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function VoiceInput({ onAddItem }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(!!SpeechRecognition); // Check support directly
  const recognitionRef = useRef(null); // Ref to store the CURRENT recognition instance

  // Function to create and start a new recognition instance
  const startListening = () => {
    if (!isSupported || isListening) {
        return; 
    }

    // Clear previous transcript/error ONLY when starting fresh
    setTranscript(''); 
    setError(null);

    const recognition = new SpeechRecognition();
    recognition.lang = 'sv-SE';
    recognition.interimResults = true;
    recognition.continuous = false; // Stop after pause

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece;
        } else {
          interimTranscript += transcriptPiece;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
      setError(null); // Clear error on successful result
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error, event.message);
      let errorMessage = `Talfel: ${event.error}`;
      if (event.error === 'no-speech') {
        errorMessage = 'Ingen tal upptäcktes. Försök igen.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Kunde inte komma åt mikrofonen. Kontrollera behörigheter.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Åtkomst till mikrofonen nekades.';
      } else if (event.error === 'aborted') {
        // Don't show error if aborted manually by user or the component
        if (recognitionRef.current) { // Check if we expected it to be running
            errorMessage = 'Lyssnandet avbröts oväntat.';
        } else {
            errorMessage = null; // Likely intentional stop
        }
      } 
      // Only set error if there's a message to display
      if (errorMessage) setError(errorMessage);
      
      setIsListening(false); 
      recognitionRef.current = null; 
    };

    recognition.onend = () => {
      // This handles natural ends (pause) or programmatic stops.
      setIsListening(false); 
      // We might not want to null the ref here if stopListening already did
      // Let stopListening manage the ref primarily.
      // If recognitionRef.current still points to this instance, maybe clear it
      // if (recognitionRef.current === recognition) {
      //   recognitionRef.current = null;
      // }
    };

    // Store the new instance and start
    recognitionRef.current = recognition;
    try {
        recognition.start();
        setIsListening(true);
    } catch (err) {
        console.error("Error starting recognition:", err);
        setError("Could not start voice recognition.");
        setIsListening(false);
        recognitionRef.current = null;
    }
  };

  // Function to stop the current recognition instance
  const stopListening = () => {
    if (recognitionRef.current) {
      const currentRecognition = recognitionRef.current; 
      recognitionRef.current = null; // Clear the ref immediately before calling stop
      try {
          currentRecognition.stop(); // Let onend handle setIsListening(false)
      } catch (err) {
           console.error("Error calling stop():", err);
           // Force state update if stop failed?
           setIsListening(false); // Force stop state
      }
    } 
  };

  // Effect for cleanup on unmount
  useEffect(() => {
    // Return cleanup function
    return () => {
      stopListening(); // Call stopListening to ensure cleanup
    };
  }, []); // Empty dependency array, run cleanup only on unmount

  const handleToggleListen = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleAddItem = () => {
    const itemToAdd = transcript.trim();
    if (itemToAdd) {
      onAddItem(itemToAdd); // Call the callback to add the item
      setTranscript(''); // Clear the displayed transcript immediately
      // Removed automatic stop/restart logic
      // User needs to tap mic again to add another item
      // stopListening(); // We might not even need to explicitly stop here
                     // because continuous=false, it should stop on pause.
                     // Also, clicking the Add button implies user is done speaking.
                     // Let's remove the explicit stop for now, but keep an eye on it.
    } 
  };

  if (!isSupported) {
    return <p>Voice input is not supported by your browser.</p>;
  }

  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', textAlign: 'center' }}>
      <h4>Lägg till med röst</h4>
      <IconButton onClick={handleToggleListen} title={isListening ? 'Sluta lyssna' : 'Börja lyssna'} size="large" style={{ color: isListening ? 'red' : 'var(--primary-color)' }}>
        {isListening ? <StopIcon /> : <MicIcon />}
      </IconButton>
      {isListening && <p style={{ fontStyle: 'italic' }}>Lyssnar...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {transcript && (
        <div style={{ margin: '1rem 0' }}>
          <p>Hörde: <strong>{transcript}</strong></p>
          <Button variant="contained" onClick={handleAddItem} disabled={!transcript.trim()}>
            Lägg till artikel
          </Button>
        </div>
      )}
    </div>
  );
}

export default VoiceInput; 