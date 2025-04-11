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
    console.log('[VoiceInput] startListening: Called. Current transcript before clear:', transcript);
    if (!isSupported || isListening) {
      console.log('[VoiceInput] startListening: Aborting - Not supported or already listening.');
      return; 
    }

    // Clear previous transcript/error ONLY when starting fresh
    setTranscript(''); 
    setError(null);
    console.log('[VoiceInput] startListening: Transcript cleared.');

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
      const resultToSet = finalTranscript || interimTranscript;
      console.log('[VoiceInput] onresult: Received result:', resultToSet);
      setTranscript(resultToSet);
      setError(null); // Clear error on successful result
    };

    recognition.onerror = (event) => {
      console.error("[VoiceInput] onerror:", event.error, event.message);
      let errorMessage = `Talfel: ${event.error}`;
      if (event.error === 'no-speech') {
        errorMessage = 'Ingen tal upptäcktes. Försök igen.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Kunde inte komma åt mikrofonen. Kontrollera behörigheter.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Åtkomst till mikrofonen nekades.';
      } else if (event.error === 'aborted') {
        if (recognitionRef.current) { 
            errorMessage = 'Lyssnandet avbröts oväntat.';
        } else {
            errorMessage = null; // Likely intentional stop
        }
      } 
      if (errorMessage) setError(errorMessage);
      setIsListening(false); 
      recognitionRef.current = null; 
    };

    recognition.onend = () => {
      console.log('[VoiceInput] onend: Recognition ended.');
      setIsListening(false); 
    };

    // Store the new instance and start
    recognitionRef.current = recognition;
    try {
        console.log('[VoiceInput] startListening: Starting recognition instance.');
        recognition.start();
        setIsListening(true);
    } catch (err) {
        console.error("[VoiceInput] startListening: Error starting recognition:", err);
        setError("Could not start voice recognition.");
        setIsListening(false);
        recognitionRef.current = null;
    }
  };

  // Function to stop the current recognition instance
  const stopListening = () => {
    if (recognitionRef.current) {
      console.log('[VoiceInput] stopListening: Stopping recognition instance.');
      const currentRecognition = recognitionRef.current; 
      recognitionRef.current = null; // Clear the ref immediately before calling stop
      try {
          currentRecognition.stop(); // Let onend handle setIsListening(false)
      } catch (err) {
           console.error("[VoiceInput] stopListening: Error calling stop():", err);
           setIsListening(false); // Force stop state
      }
    } else {
        console.log('[VoiceInput] stopListening: No active recognition found.');
    }
  };

  // Effect for cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[VoiceInput] cleanup: Component unmounting, stopping listener.');
      stopListening();
    };
  }, []);

  const handleToggleListen = () => {
    console.log('[VoiceInput] handleToggleListen: Called. isListening:', isListening);
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleAddItem = () => {
    const itemToAdd = transcript.trim();
    console.log('[VoiceInput] handleAddItem: Called. Transcript to add:', itemToAdd);
    if (itemToAdd) {
      onAddItem(itemToAdd); // Call the callback to add the item
      console.log('[VoiceInput] handleAddItem: Clearing transcript state. Current value:', transcript);
      setTranscript(''); // Clear the displayed transcript immediately
    } else {
      console.log('[VoiceInput] handleAddItem: No transcript to add.');
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