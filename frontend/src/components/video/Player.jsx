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
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaExpand, FaStepForward, FaStepBackward, FaRedo } from "react-icons/fa";
import Hls from "hls.js";

const VideoPlayer = ({ src, title, thumbnail }) => {
    const dispatch = useDispatch();
    const videoRef = useRef(null);
    const progressBarRef = useRef(null);
    const hlsRef = useRef(null);

    // Redux State (Global)
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
    
    const darkMode = useSelector((state) => state.ui.darkMode); // UI state for dark mode

    // Initialize Video Source (HLS Support)
    useEffect(() => {
        if (!videoRef.current) return;
        if (hlsRef.current) hlsRef.current.destroy(); // Cleanup previous instance

        if (src.endsWith(".m3u8") && Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(videoRef.current);
            hlsRef.current = hls;
        } else {
            videoRef.current.src = src;
        }

        // Set initial duration when metadata is loaded
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
        
        // Start seeking
        dispatch(setSeeking(true));
        
        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * videoRef.current.duration;
        
        videoRef.current.currentTime = newTime;
        dispatch(setCurrentTime(newTime));
        dispatch(setPlayed(pos * 100));
        
        // End seeking
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
        <div className={`w-full max-w-4xl mx-auto ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg overflow-hidden shadow-lg`}>
            <div className="relative w-full">
                <video
                    ref={videoRef}
                    poster={thumbnail}
                    className="w-full h-auto"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    onClick={handlePlayPause}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 opacity-0 hover:opacity-100 group-hover:opacity-100">
                    <div ref={progressBarRef} className="w-full h-2 bg-gray-600 rounded-full cursor-pointer mb-3" onClick={handleProgressBarClick}>
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${played}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <button onClick={handlePlayPause} className="text-white hover:text-blue-500 transition">
                                {playing ? <FaPause size={24} /> : <FaPlay size={24} />}
                            </button>
                            <button onClick={skipBackward} className="text-white hover:text-blue-500 transition"><FaStepBackward size={20} /></button>
                            <button onClick={skipForward} className="text-white hover:text-blue-500 transition"><FaStepForward size={20} /></button>
                            <span className="text-white text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={toggleMute} className="text-white hover:text-blue-500 transition">
                                {muted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                            </button>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={volume} 
                                onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))} 
                                className="w-20" 
                            />
                            <button onClick={toggleLoop} className={`text-white hover:text-blue-500 transition ${loop ? 'text-blue-500' : ''}`}>
                                <FaRedo size={20} />
                            </button>
                            <button onClick={handleFullscreen} className="text-white hover:text-blue-500 transition">
                                <FaExpand size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`p-4 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
                <h2 className="text-lg font-semibold">{title}</h2>
                <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm">Speed:</span>
                    <select 
                        value={playbackRate} 
                        onChange={(e) => dispatch(setPlaybackRate(parseFloat(e.target.value)))}
                        className={`text-sm p-1 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
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
    );
};

export default VideoPlayer;