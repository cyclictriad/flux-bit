// backgroundWorker.js
// This worker coordinates sequential video processing and uploading

// Queue for pending uploads
let processingQueue = [];
let currentlyProcessing = false;

self.onmessage = (event) => {

  const { uploads } = event.data;

  if (uploads) {
    // Get all pending uploads and add to queue
    const pendingUploads = Object.keys(uploads)
      .filter(uploadId => uploads[uploadId].status === "pending" || uploads[uploadId].status === "failed")
      .map(uploadId => ({
        uploadId,
        options: uploads[uploadId].options || {} // Include options for video processing
      }));

    console.log({ pendingUploads })

    processingQueue = [...processingQueue, ...pendingUploads];

    console.log({ uploads, processingQueue })

    // If not currently processing, start processing the first item
    if (!currentlyProcessing && processingQueue.length > 0) {


      processNextItem();
    }
  }
};

// Process the next item in the queue
function processNextItem() {

  if (processingQueue.length === 0) {
    currentlyProcessing = false;

    return;
  }

  currentlyProcessing = true;

  const nextItem = processingQueue.shift();
  const { uploadId } = nextItem;

  self.postMessage({
    type: "startUpload",
    uploadId
  })

  console.log("Started uploading ..")

}