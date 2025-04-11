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
        console.log('[VoiceInput] startListening: Aborting - Not supported or already listening.');
        return; 
    }

    console.log('[VoiceInput] startListening: Creating new SpeechRecognition instance and starting...');
    console.log('[VoiceInput] startListening: Clearing transcript (before set). Current value:', transcript);
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
      console.log('[VoiceInput] onresult: Received final transcript:', finalTranscript);
      console.log('[VoiceInput] onresult: Setting transcript state.');
      setTranscript(finalTranscript || interimTranscript);
      setError(null);
    };

    recognition.onerror = (event) => {
      console.error("[VoiceInput] onerror: Speech recognition error:", event.error, event.message);
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
      console.log('[VoiceInput] onerror: Setting recognitionRef.current to null.');
      recognitionRef.current = null; 
    };

    recognition.onend = () => {
      console.log("[VoiceInput] onend: Speech recognition ended naturally or stopped.");
      // Ensure state is consistent and ref is cleared when recognition ends naturally
      if (isListening) { // Only set if we thought we were listening
         console.log("[VoiceInput] onend: Setting isListening to false.");
         setIsListening(false); 
      }
      // Check if the ref is still pointing to *this* instance before nulling
      // This check might be redundant if stopListening already nulled it, but safer
      if (recognitionRef.current === recognition) {
        console.log('[VoiceInput] onend: Setting recognitionRef.current to null.');
        recognitionRef.current = null; 
      } else {
        console.log('[VoiceInput] onend: recognitionRef.current was already null or changed.');
      }
    };

    // Store the new instance and start
    console.log('[VoiceInput] startListening: Storing new instance in ref.');
    recognitionRef.current = recognition;
    try {
        console.log('[VoiceInput] startListening: Calling recognition.start()');
        recognition.start();
        setIsListening(true);
    } catch (err) {
        console.error("[VoiceInput] startListening: Error starting recognition:", err);
        setError("Could not start voice recognition.");
        setIsListening(false);
        console.log('[VoiceInput] startListening (catch): Setting recognitionRef.current to null.');
        recognitionRef.current = null;
    }
  };

  // Function to stop the current recognition instance
  const stopListening = () => {
    if (recognitionRef.current) {
      console.log("[VoiceInput] stopListening: Found active recognition. Calling stop().");
      const currentRecognition = recognitionRef.current; // Hold reference before nulling
      console.log('[VoiceInput] stopListening: Setting recognitionRef.current to null immediately.');
      recognitionRef.current = null; // Clear the ref immediately
      try {
          currentRecognition.stop(); // onend should set isListening=false
      } catch (err) {
           console.error("[VoiceInput] stopListening: Error calling stop():", err);
           // Potentially force state update if stop failed?
           if (isListening) setIsListening(false);
      }
    } else {
      console.log("[VoiceInput] stopListening: No active recognition found in ref.");
    }
  };

  // Effect for cleanup on unmount
  useEffect(() => {
    // Return cleanup function
    return () => {
      console.log('[VoiceInput] useEffect cleanup: Component unmounting. Calling stopListening.');
      stopListening(); // Call stopListening to ensure cleanup
    };
  }, []); // Empty dependency array, run cleanup only on unmount

  const handleToggleListen = () => {
    console.log('[VoiceInput] handleToggleListen: Toggling. isListening:', isListening);
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
      onAddItem(itemToAdd);
      console.log('[VoiceInput] handleAddItem: Clearing transcript state (before set). Current value:', transcript);
      setTranscript(''); // Clear display immediately

      // Explicitly stop any lingering recognition from the previous session
      console.log('[VoiceInput] handleAddItem: Calling stopListening().');
      stopListening();

      // Start a new listening session after a delay
      console.log('[VoiceInput] handleAddItem: Setting timeout for startListening (250ms).');
      setTimeout(() => {
          // Check if still mounted / relevant before starting
          // (A more robust check might involve a ref to the component's mounted state)
          console.log("[VoiceInput] handleAddItem (setTimeout): Calling startListening...");
          startListening(); 
      }, 250); // 250ms delay - adjust if needed
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