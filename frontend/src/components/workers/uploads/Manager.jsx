import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { uploadFile } from '../../../store/features/uploadsSlice';

const UploadSequenceManager = () => {
  const uploads = useSelector(state => state.uploads.uploads);

  const dispatch = useDispatch();
  const workerRef = useRef(null);

  useEffect(() => {
    // Create the background worker
    const backgroundWorker = new Worker(new URL('../../../workers/uploads/backgroundWorker.js', import.meta.url), { type: 'module' });
    workerRef.current = backgroundWorker;

    // Handle messages from worker
    backgroundWorker.onmessage = (event) => {
      const { type, uploadId } = event.data;

      switch (type) {

        case "startUpload":

          console.log("Started uploading in worker manager..")

          // Then start the upload - this will use the Redux thunk
          dispatch(uploadFile(uploadId))
            .then(() => {
              // Notify worker when upload is complete
              backgroundWorker.postMessage({
                type: "uploadComplete",
                uploadId,
              });
            })
            .catch(error => {

              console.log("Error happened in worker manager..")

              // dispatch(uploadFailed({
              //   uploadId,
              //   error: error.message || 'Upload failed'
              // }));

            });

          break;
      }
    };

    // Initialize worker with current uploads
    backgroundWorker.postMessage({ uploads });

    return () => backgroundWorker.terminate();
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