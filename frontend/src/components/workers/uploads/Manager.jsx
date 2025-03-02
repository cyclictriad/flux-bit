import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { startProcessing, uploadFailed, uploadFile } from '../../../store/features/uploadsSlice';

const UploadSequenceManager = () => {
  const uploads = useSelector(state => state.uploads.uploads);
  const dispatch = useDispatch();
  const workerRef = useRef(null);

  useEffect(() => {
    // Create the background worker
    const worker = new Worker(new URL('../../../workers/uploads/backgroundWorker.js', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    // Handle messages from worker
    worker.onmessage = (event) => {
      const { type, uploadId, optimizedData, progress, error, result } = event.data;

      switch (type) {
        case "processingStarted":
          dispatch(startProcessing(uploadId));
          break;

        case "startUpload":

          // Then start the upload - this will use the Redux thunk
          dispatch(uploadFile(uploadId))
            .then(result => {
              // Notify worker when upload is complete
              worker.postMessage({
                type: "uploadComplete",
                uploadId,
                result: result.payload?.result
              });
            })
            .catch(error => {
              dispatch(uploadFailed(uploadId, error || new Error('Upload failed')));

            });
          break;

        case "processingError":
          dispatch(uploadFailed(uploadId, error || new Error('Processing failed')));

          break;
      }
    };

    // Initialize worker with current uploads
    worker.postMessage({ uploads });

    return () => worker.terminate();
  }, []);

  // When uploads state changes (new uploads added), send updates to worker
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ uploads });
    }
  }, [uploads]);

  return null; // This component doesn't render anything
};

export default UploadSequenceManager;