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
    if (!isSupported) {
      console.error("[VoiceInput] startListening: Speech Recognition not supported.");
      return; 
    }
    // Safety check: Stop any existing instance before starting a new one.
    if (recognitionRef.current) {
      console.warn("[VoiceInput] startListening: Found existing recognition instance. Stopping it first.");
      stopListening(); 
    }

    setTranscript(''); 
    setError(null);

    const recognition = new SpeechRecognition();
    recognition.lang = 'sv-SE';
    recognition.interimResults = true;
    recognition.continuous = false; // Stop after pause

    recognition.onresult = (event) => {
      // Guard: Only process if this instance is still the active one
      if (recognitionRef.current !== recognition) return;
      
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
      // Guard: Only process if this instance is still the active one
      if (recognitionRef.current !== recognition) return;

      console.error("[VoiceInput] onerror:", event.error, event.message); 
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
      // Guard: Only update state if this instance is still the one in the ref
      // (prevents old instance's onend from interfering with restarted session)
      if (recognitionRef.current === recognition) {
         setIsListening(false);
         recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition; // Store the NEW instance
    try {
        recognition.start();
        // Set state AFTER successfully starting the new instance
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
      const currentRecognition = recognitionRef.current; 
      recognitionRef.current = null; 
      setIsListening(false); // Always set state when stopping manually/cleanly
      try {
          currentRecognition.stop(); 
      } catch (err) {
           console.error("[VoiceInput] stopListening: Error calling stop():", err); 
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
    // Manual toggle uses the main stop/start functions
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleAddItem = () => {
    // Get transcript value *before* stopping
    const itemToAdd = transcript.trim();

    if (itemToAdd) {
      // Stop the current recognition instance directly
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          // Don't call setIsListening(false) here to avoid UI flicker
          // Don't null the ref here; let onend or startListening handle it
        } catch (err) {
          console.error("[VoiceInput] handleAddItem: Error stopping recognition:", err);
          // Force cleanup if stop failed?
          recognitionRef.current = null;
          setIsListening(false);
        }
      }

      // Add item and clear display
      onAddItem(itemToAdd);
      setTranscript('');

      // Restart listening after a short delay
      setTimeout(() => {
         const container = document.getElementById('voice-input-container');
         // Check mount status. Ref might be the old stopped instance or null.
         // startListening will handle creating/setting the new ref and state.
         if (container && document.contains(container)) { 
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