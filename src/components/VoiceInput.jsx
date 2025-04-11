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
    // Only check for support, rely on calling context (setTimeout check) for isListening state
    if (!isSupported) {
      console.error("[VoiceInput] startListening: Speech Recognition not supported.");
      return; 
    }

    setTranscript(''); 
    setError(null);

    const recognition = new SpeechRecognition();
    recognition.lang = 'sv-SE';
    recognition.interimResults = true;
    recognition.continuous = false; // Stop after pause

    recognition.onresult = (event) => {
      if (recognitionRef.current !== recognition) {
        return; // Ignore results from old/stopped instances
      }

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
      setTranscript(resultToSet);
      setError(null); 
    };

    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) {
        return; // Ignore errors from old/stopped instances
      }
      console.error("[VoiceInput] onerror:", event.error, event.message); // Keep error logging
      let errorMessage = `Talfel: ${event.error}`;
       if (event.error === 'no-speech') {
        errorMessage = 'Ingen tal upptäcktes. Försök igen.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Kunde inte komma åt mikrofonen. Kontrollera behörigheter.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Åtkomst till mikrofonen nekades.';
      } else if (event.error === 'aborted') {
        errorMessage = null; // Assume deliberate stop
      } 
      if (errorMessage) setError(errorMessage);
      setIsListening(false); 
      recognitionRef.current = null; 
    };

    recognition.onend = () => {
      // This event fires when recognition stops naturally or programmatically.
      setIsListening(false); 
      if (recognitionRef.current === recognition) {
         recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    try {
        recognition.start();
        setIsListening(true);
    } catch (err) {
        console.error("[VoiceInput] startListening: Error starting recognition:", err); // Keep error logging
        setError("Could not start voice recognition.");
        setIsListening(false);
        recognitionRef.current = null;
    }
  };

  // Function to stop the current recognition instance
  const stopListening = () => {
    if (recognitionRef.current) {
      const currentRecognition = recognitionRef.current; 
      recognitionRef.current = null; 
      setIsListening(false); 
      try {
          currentRecognition.stop(); 
      } catch (err) {
           console.error("[VoiceInput] stopListening: Error calling stop():", err); // Keep error logging
      }
    } 
  };

  // Effect for cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const handleToggleListen = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleAddItem = () => {
    const activeRecognition = recognitionRef.current;
    if (activeRecognition) {
        stopListening(); // This sets isListening false and nulls the ref
    }

    const itemToAdd = transcript.trim();
    if (itemToAdd) {
      onAddItem(itemToAdd); // Call the callback to add the item
      setTranscript(''); // Clear the displayed transcript immediately

      // Restart listening after a short delay
      setTimeout(() => {
         const container = document.getElementById('voice-input-container');
         // Check mount status and if ref is null (meaning no session is active)
         if (container && document.contains(container) && !recognitionRef.current) { 
            startListening();
         } 
      }, 250); // 250ms delay, adjust if needed

    } 
  };

  if (!isSupported) {
    return <p>Voice input is not supported by your browser.</p>;
  }

  return (
    <div id="voice-input-container" style={{ marginTop: '1.5rem', paddingTop: '1rem', textAlign: 'center' }}>
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