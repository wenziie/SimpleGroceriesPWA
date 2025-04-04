import React, { useState, useEffect, useRef } from 'react';

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
      recognitionRef.current.interimResults = true; // Get results as they come
      recognitionRef.current.continuous = true; // Keep listening until stopped

      // Event Handlers for the recognition instance
      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(prev => prev + currentTranscript); // Append results for continuous
        setError(null); // Clear previous errors on new results
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended.");
        // Only set isListening false if it wasn't manually stopped
        // For continuous=true, it might stop automatically sometimes (e.g., silence)
        // We might need logic here to restart it if needed, but let's keep it simple first
        setIsListening(false); 
        // Reset transcript after stopping? Maybe not for continuous addition.
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
  }, []); // Run only once on mount to set up

  const handleToggleListen = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      console.log("Stopping recognition manually...");
      recognitionRef.current.stop();
      setIsListening(false);
      // Don't clear transcript here, let user add it
    } else {
      try {
        console.log("Starting recognition...");
        setTranscript(''); // Clear previous transcript before starting new session
        setError(null);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        // Handle potential errors during start (e.g., already started)
        console.error("Error starting recognition:", err);
        setError("Could not start voice recognition.");
        setIsListening(false);
      }
    }
  };

  const handleAddAndNext = () => {
    const itemToAdd = transcript.trim();
    if (itemToAdd) {
      onAddItem(itemToAdd);
      setTranscript(''); // Clear transcript for the next item
      
      // If recognition stopped, restart it immediately
      if (!isListening && recognitionRef.current) {
        try {
          console.log("Restarting recognition for next item...");
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
            console.error("Error restarting recognition:", err);
            setError("Could not restart voice recognition.");
            setIsListening(false);
        }
      } else if (isListening && recognitionRef.current) {
         // If it was still listening, stopping and immediately restarting 
         // can sometimes help clear buffers or reset state reliably.
         console.log("Quick restart for next item...");
         recognitionRef.current.stop(); // onend will set isListening = false
         // A very short delay might be needed before restarting
         setTimeout(() => {
            try {
              recognitionRef.current.start();
              setIsListening(true); // Set it back immediately
            } catch (err) {
              console.error("Error restarting recognition:", err);
              setError("Could not restart voice recognition.");
              setIsListening(false);
            }
         }, 100); // 100ms delay
      }
    }
  };

  if (!isSupported) {
    return <p>Voice input is not supported by your browser.</p>;
  }

  return (
    <div style={{ marginTop: '1.5rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
      <h4>Add Item by Voice (Swedish)</h4>
      <button onClick={handleToggleListen} disabled={!isSupported}>
        {isListening ? '🛑 Stop Listening' : '🎤 Start Listening'}
      </button>
      {isListening && <p style={{ fontStyle: 'italic' }}>Listening...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {transcript && (
        <div style={{ margin: '0.5rem 0' }}>
          <p>Heard: <strong>{transcript}</strong></p>
          <button onClick={handleAddAndNext} disabled={!transcript.trim() || !isListening}>
            Lägg till & nästa ("Add & Next")
          </button>
        </div>
      )}
    </div>
  );
}

export default VoiceInput; 