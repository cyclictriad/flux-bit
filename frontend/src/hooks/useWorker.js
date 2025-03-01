import { useRef, useEffect, useState, useCallback } from 'react';

// Hook to use web workers
function useWorker(workerPath, options = {}) {
  const workerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize the worker
  useEffect(() => {
    // For Vite, we need to use the special ?worker syntax
    const worker = new Worker(new URL(workerPath, import.meta.url), { type: 'module' });
    
    worker.addEventListener('message', (event) => {
      if (options.onMessage) {
        options.onMessage(event.data);
      }
    });
    
    worker.addEventListener('error', (event) => {
      setError(new Error(`Worker error: ${event.message}`));
      if (options.onError) {
        options.onError(event);
      }
    });
    
    workerRef.current = worker;
    setIsReady(true);
    
    // Clean up the worker when the component unmounts
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [workerPath, options.onMessage, options.onError]);
  
  // Function to send a message to the worker
  const sendMessage = useCallback((message) => {
    if (workerRef.current) {
      workerRef.current.postMessage(message);
    } else {
      setError(new Error('Worker is not initialized'));
    }
  }, []);
  
  return {
    isReady,
    error,
    sendMessage
  };
}

export default useWorker;