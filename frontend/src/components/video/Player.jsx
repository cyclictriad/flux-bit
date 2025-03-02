import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setPlaying,
  setMuted,
  setVolume,
  setPlayed,
  setPlaybackRate,
  setSeeking,
  setLoop,
  setCurrentTime,
  setDuration
} from "../../store/features/playerSlice";
import { 
  FaPlay, 
  FaPause, 
  FaVolumeMute, 
  FaVolumeUp, 
  FaExpand, 
  FaStepForward, 
  FaStepBackward, 
  FaRedo 
} from "react-icons/fa";
import Hls from "hls.js";

const VideoPlayer = ({ src, title, thumbnail }) => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Redux State
  const { 
    playing, 
    played, 
    volume, 
    muted, 
    playbackRate, 
    loop,
    currentTime,
    duration 
  } = useSelector((state) => state.player);
  
  const darkMode = useSelector((state) => state.ui.darkMode);

  // Initialize Video Source (HLS Support)
  useEffect(() => {
    if (!videoRef.current) return;
    if (hlsRef.current) hlsRef.current.destroy();

    if (src.endsWith(".m3u8") && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      hlsRef.current = hls;
    } else {
      videoRef.current.src = src;
    }

    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        dispatch(setDuration(videoRef.current.duration));
      }
    };

    videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src, dispatch]);

  // Play/Pause State Management
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (playing) {
      videoRef.current.play().catch(error => {
        console.error("Playback failed:", error);
        dispatch(setPlaying(false));
      });
    } else {
      videoRef.current.pause();
    }
  }, [playing, dispatch]);

  // Volume & Mute State
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Playback Rate
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  // Loop
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.loop = loop;
  }, [loop]);

  // Handle Play/Pause
  const handlePlayPause = () => dispatch(setPlaying(!playing));

  // Handle Time Updates
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const newTime = videoRef.current.currentTime;
    const newPlayed = (newTime / videoRef.current.duration) * 100;
    
    dispatch(setCurrentTime(newTime));
    dispatch(setPlayed(newPlayed));
  };

  // Handle Progress Bar Click
  const handleProgressBarClick = (e) => {
    if (!progressBarRef.current || !videoRef.current) return;
    
    dispatch(setSeeking(true));
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * videoRef.current.duration;
    
    videoRef.current.currentTime = newTime;
    dispatch(setCurrentTime(newTime));
    dispatch(setPlayed(pos * 100));
    
    dispatch(setSeeking(false));
  };

  // Handle Mute
  const toggleMute = () => dispatch(setMuted(!muted));

  // Handle Loop
  const toggleLoop = () => dispatch(setLoop(!loop));

  // Handle Fullscreen
  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  // Skip Forward/Backward
  const skipForward = () => { 
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
      videoRef.current.currentTime = newTime;
      dispatch(setCurrentTime(newTime));
    }
  };
  
  const skipBackward = () => { 
    if (videoRef.current) {
      const newTime = Math.max(0, videoRef.current.currentTime - 10);
      videoRef.current.currentTime = newTime;
      dispatch(setCurrentTime(newTime));
    }
  };

  // Format Time Display
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle video end
  const handleEnded = () => {
    if (!loop) {
      dispatch(setPlaying(false));
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${darkMode ? "bg-gray-900" : "bg-gray-50"} rounded-xl overflow-hidden shadow-xl transition-colors duration-300`}>
      <div className="relative group w-full">
        <video
          ref={videoRef}
          poster={thumbnail}
          className="w-full h-auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onClick={handlePlayPause}
        />
        
        {/* Center play button for mobile/touch */}
        {!playing && (
          <button 
            onClick={handlePlayPause}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600/80 hover:bg-blue-700 rounded-full p-6 text-white shadow-lg transition-all duration-300 hover:scale-110"
          >
            <FaPlay size={24} />
          </button>
        )}

        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pt-16 pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Progress bar */}
          <div className="relative mb-4">
            <div 
              ref={progressBarRef} 
              className="w-full h-2 bg-gray-600/80 rounded-full cursor-pointer" 
              onClick={handleProgressBarClick}
            >
              <div className="absolute h-2 bg-blue-500 rounded-full" style={{ width: `${played}%` }}></div>
              <div className="absolute h-4 w-4 bg-blue-600 rounded-full -mt-1 shadow-md transform -translate-x-1/2" style={{ left: `${played}%` }}></div>
            </div>
          </div>
          
          {/* Controls row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-5">
              <button onClick={handlePlayPause} className="text-white hover:text-blue-400 transition">
                {playing ? <FaPause size={22} /> : <FaPlay size={22} />}
              </button>
              <button onClick={skipBackward} className="text-white hover:text-blue-400 transition">
                <FaStepBackward size={18} />
              </button>
              <button onClick={skipForward} className="text-white hover:text-blue-400 transition">
                <FaStepForward size={18} />
              </button>
              <span className="text-white text-sm font-medium">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            
            <div className="flex items-center space-x-5">
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className="text-white hover:text-blue-400 transition">
                  {muted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume} 
                  onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))} 
                  className="w-16 accent-blue-500" 
                />
              </div>
              <button 
                onClick={toggleLoop} 
                className={`text-white hover:text-blue-400 transition ${loop ? 'text-blue-500' : ''}`}
              >
                <FaRedo size={18} />
              </button>
              <button onClick={handleFullscreen} className="text-white hover:text-blue-400 transition">
                <FaExpand size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video info section */}
      <div className={`p-5 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"} transition-colors duration-300`}>
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="mt-3 flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Playback Speed:</span>
            <select 
              value={playbackRate} 
              onChange={(e) => dispatch(setPlaybackRate(parseFloat(e.target.value)))}
              className={`text-sm p-1.5 rounded-md border ${
                darkMode 
                  ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" 
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500"
              } focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;