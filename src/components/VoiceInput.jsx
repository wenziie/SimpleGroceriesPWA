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
    if (!isSupported || isListening) return; // Don't start if not supported or already listening

    console.log("Creating new SpeechRecognition instance and starting...");
    setTranscript(''); // Clear previous transcript
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
      setError(null);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      let errorMessage = `Talfel: ${event.error}`;
      if (event.error === 'no-speech') {
        errorMessage = 'Ingen tal upptäcktes. Försök igen.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Kunde inte komma åt mikrofonen. Kontrollera behörigheter.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Åtkomst till mikrofonen nekades.';
      } else if (event.error === 'aborted') {
        errorMessage = 'Lyssnandet avbröts. Försök igen.'; // Friendlier 'aborted' message
      }
      setError(errorMessage);
      setIsListening(false); 
      recognitionRef.current = null; 
    };

    recognition.onend = () => {
      console.log("Speech recognition ended.");
      // Ensure state is consistent and ref is cleared when recognition ends naturally
      if (isListening) {
         setIsListening(false); 
      }
      recognitionRef.current = null; 
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
      console.log("Stopping recognition manually...");
      recognitionRef.current.stop(); // onend should set isListening=false
      // No need to set isListening false here, let onend handle it
      recognitionRef.current = null; // Clear the ref immediately
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
      onAddItem(itemToAdd);
      // Remove the automatic restart
      // startListening(); 
      // Clear transcript manually now, as startListening isn't doing it
      setTranscript(''); 
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