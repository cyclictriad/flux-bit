import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaExpand, FaStepForward, FaStepBackward } from 'react-icons/fa';
import Hls from 'hls.js';

const VideoPlayer = ({ src, title, thumbnail }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const videoRef = useRef(null);
    const progressBarRef = useRef(null);
    const hlsRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    useEffect(() => {
        if (!videoRef.current) return;

        const isHlsStream = src.endsWith('.m3u8');
        if (isHlsStream && Hls.isSupported()) {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }

            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (isPlaying) {
                    videoRef.current.play();
                }
            });

            hlsRef.current = hls;
        } else {
            videoRef.current.src = src;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [src]);

    useEffect(() => {
        if (!videoRef.current) return;
        isPlaying ? videoRef.current.play() : videoRef.current.pause();
    }, [isPlaying]);

    useEffect(() => {
        if (!videoRef.current) return;
        videoRef.current.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    const handlePlayPause = () => setIsPlaying(!isPlaying);
    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
        setDuration(videoRef.current.duration);
        setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    };
    const handleProgressBarClick = (e) => {
        if (!progressBarRef.current || !videoRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * videoRef.current.duration;
    };
    const toggleMute = () => setIsMuted(!isMuted);
    const handleFullscreen = () => {
        if (!videoRef.current) return;
        document.fullscreenElement ? document.exitFullscreen() : videoRef.current.requestFullscreen();
    };
    const skipForward = () => { if (videoRef.current) videoRef.current.currentTime += 10; };
    const skipBackward = () => { if (videoRef.current) videoRef.current.currentTime -= 10; };
    const formatTime = (time) => isNaN(time) ? '0:00' : `${Math.floor(time / 60)}:${('0' + Math.floor(time % 60)).slice(-2)}`;

    return (
        <div className="w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden shadow-lg">
            <div className="relative w-full" onMouseEnter={() => setShowControls(true)}>
                <video
                    ref={videoRef}
                    poster={thumbnail}
                    className="w-full h-auto"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    onClick={handlePlayPause}
                />
                {showControls && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300">
                        <div ref={progressBarRef} className="w-full h-1 bg-gray-500 rounded-full cursor-pointer mb-3" onClick={handleProgressBarClick}>
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <button onClick={handlePlayPause} className="text-white hover:text-blue-500"><FaPlay size={24} /></button>
                                <button onClick={skipBackward} className="text-white hover:text-blue-500"><FaStepBackward size={20} /></button>
                                <button onClick={skipForward} className="text-white hover:text-blue-500"><FaStepForward size={20} /></button>
                                <span className="text-white text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button onClick={toggleMute} className="text-white hover:text-blue-500">
                                    {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                                </button>
                                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20" />
                                <button onClick={handleFullscreen} className="text-white hover:text-blue-500"><FaExpand size={20} /></button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 bg-gray-900 text-white">
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
        </div>
    );
};

export default VideoPlayer;