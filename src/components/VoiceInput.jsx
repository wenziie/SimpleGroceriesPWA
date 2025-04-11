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
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null); // Ref to store the recognition instance

  useEffect(() => {
    if (SpeechRecognition) {
      setIsSupported(true);
      // Create the recognition instance but don't start it yet
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'sv-SE'; // Set language to Swedish
      recognitionRef.current.interimResults = true; // Keep interim for feedback
      // Set continuous to false - stop after pause
      recognitionRef.current.continuous = false; 

      // Event Handlers for the recognition instance
      recognitionRef.current.onresult = (event) => {
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
        // Update state with interim or final results
        // Prioritize final results if available
        setTranscript(finalTranscript || interimTranscript);
        setError(null); // Clear error on new results
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        let errorMessage = `Speech recognition error: ${event.error}`;
        // Provide more user-friendly messages for common errors
        if (event.error === 'no-speech') {
          errorMessage = 'Ingen tal upptäcktes. Försök igen.';
        } else if (event.error === 'audio-capture') {
          errorMessage = 'Kunde inte komma åt mikrofonen. Kontrollera behörigheter.';
        } else if (event.error === 'not-allowed') {
          errorMessage = 'Åtkomst till mikrofonen nekades.';
        }
        setError(errorMessage);
        setIsListening(false); // Ensure listening stops on error
      };

      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended.");
        // Recognition ended (either manually or automatically after speech)
        setIsListening(false); 
      };

    } else {
      setIsSupported(false);
      console.warn("Web Speech Recognition API is not supported by this browser.");
    }

    // Cleanup function to stop recognition if component unmounts while listening
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Empty dependency array - setup runs once

  const handleToggleListen = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      console.log("Stopping recognition manually...");
      recognitionRef.current.stop(); // Will trigger onend, setting isListening=false
      // Transcript remains until added or next listen starts
    } else {
      try {
        console.log("Starting recognition...");
        setTranscript(''); // Clear previous transcript before starting
        setError(null);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting recognition:", err);
        setError("Could not start voice recognition.");
        setIsListening(false);
      }
    }
  };

  // Rename button/handler to reflect single addition
  const handleAddItem = () => {
    const itemToAdd = transcript.trim();
    if (itemToAdd) {
      onAddItem(itemToAdd);
      setTranscript(''); // Clear transcript after adding
      
      // --- Automatically restart listening with a delay --- 
      // Check if recognition instance exists and isn't already listening
      if (recognitionRef.current && !isListening) {
          // Introduce a small delay before restarting
          setTimeout(() => {
              // Double-check state in case stop was clicked during delay
              if (recognitionRef.current && !isListening) { 
                  try {
                    console.log("Auto-restarting recognition after delay...");
                    setError(null); // Clear any previous errors
                    recognitionRef.current.start();
                    setIsListening(true);
                  } catch (err) {
                    console.error("Error auto-restarting recognition:", err);
                    setError("Could not restart voice recognition.");
                    setIsListening(false); // Ensure state is correct on error
                  }
              }
          }, 150); // Delay in milliseconds (e.g., 150ms)
      } 
      // ----------------------------------------
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
          {/* Use MUI Button and update text/handler */}
          <Button variant="contained" onClick={handleAddItem} disabled={!transcript.trim()}>
            Lägg till artikel
          </Button>
        </div>
      )}
    </div>
  );
}

export default VoiceInput; 