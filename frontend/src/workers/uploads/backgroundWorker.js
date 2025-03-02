// backgroundWorker.js
// This worker coordinates sequential video processing and uploading

// Queue for pending uploads
let processingQueue = [];
let currentlyProcessing = false;

self.onmessage = (event) => {
  const { uploads } = event.data;
  console.log("Background worker started ", { uploads })
  if (uploads) {
    // Get all pending uploads and add to queue
    const pendingUploads = Object.keys(uploads)
      .filter(uploadId => uploads[uploadId].status === "pending")
      .map(uploadId => ({
        uploadId,
        options: uploads[uploadId].options || {} // Include options for video processing
      }));

    console.log("Background worker running", { pendingUploads })


    processingQueue = [...processingQueue, ...pendingUploads];

    console.log("Background worker running", { currentlyProcessing })

    // If not currently processing, start processing the first item
    if (!currentlyProcessing && processingQueue.length > 0) {


      processNextItem();
    }
  }
};

// Process the next item in the queue
function processNextItem() {
  console.log("BackgroundWorker running - processing next item")


  if (processingQueue.length === 0) {
    currentlyProcessing = false;
    self.postMessage({ type: "allProcessingComplete" });
    return;
  }


  currentlyProcessing = true;
  console.log({ processingQueue })

  const nextItem = processingQueue.shift();
  const { uploadId, options } = nextItem;

  console.log("BackgroundWorker running: next item -", { uploadId, options })


  // Start the video processor worker
  const videoProcessorWorker = new Worker(new URL("videoProcessor.js", import.meta.url), { type: "module" });

  console.log("BackgroundWorker running : initiated processor -", typeof videoProcessorWorker)

  // Send both uploadId and options to the video processor
  videoProcessorWorker.postMessage({
    uploadId,
    options
  });

  console.log("BackgroundWorker running : posted to processor -", typeof videoProcessorWorker)


  // Log that processing has started
  self.postMessage({
    type: "processingStarted",
    uploadId
  });


  videoProcessorWorker.onerror = (error) => {
    console.error("Video Processor Worker error:", error.message);
    self.postMessage({ type: "processingError", uploadId, error: error.message });
  };


  videoProcessorWorker.onmessage = (event) => {
    // Forward progress updates from the processor worker
    if (event.data.type === "progress") {
      self.postMessage({
        type: "processingProgress",
        uploadId,
        progress: event.data.progress
      });
    }
    // When processing is successful
    else if (event.data.type === "success") {
      self.postMessage({
        type: "startUpload",
        uploadId,
        optimizedData: event.data.optimizedData
      });

      // Terminate the worker
      videoProcessorWorker.terminate();
    }
    // If processing failed
    else if (event.data.type === "error") {
      self.postMessage({
        type: "processingError",
        uploadId,
        error: event.data.error
      });

      // Terminate the worker and move to next item
      videoProcessorWorker.terminate();
      processNextItem();
    }
  };
};

// Listen for upload completion from main thread
self.addEventListener('message', (event) => {
  if (event.data.type === "uploadComplete") {
    const { uploadId, result } = event.data;

    // Notify that this upload is fully complete
    self.postMessage({
      type: "processAndUploadComplete",
      uploadId,
      result
    });

    // Start processing the next item
    // processNextItem();
  }

  // Handle upload failures
  else if (event.data.type === "uploadFailed") {
    const { uploadId, error } = event.data;

    self.postMessage({
      type: "uploadError",
      uploadId,
      error
    });

    console.log("Error captured")

    // Move to the next item
    // processNextItem();
  }

  // Handle cancellation requests
  else if (event.data.type === "cancelProcessing") {
    const { uploadId } = event.data;

    // Remove from queue if present
    processingQueue = processingQueue.filter(item => item.uploadId !== uploadId);

    self.postMessage({
      type: "processingCancelled",
      uploadId
    });
  }
});