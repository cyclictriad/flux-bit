import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    video: null,
    playing: false,
    muted: false,
    volume: 0.5,
    playbackRate: 1,
    played: 0, // Percentage of progress (0-100)
    seeking: false,
    loop: false,
    currentTime: 0, // Current time in seconds
    duration: 0, // Total duration in seconds
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setVideo: (state, action) => { state.video = action.payload; },
        setPlaying: (state, action) => { state.playing = action.payload; },
        setMuted: (state, action) => { state.muted = action.payload; },
        setVolume: (state, action) => { state.volume = action.payload; },
        setPlaybackRate: (state, action) => { state.playbackRate = action.payload; },
        setPlayed: (state, action) => { state.played = action.payload; },
        setSeeking: (state, action) => { state.seeking = action.payload; },
        setLoop: (state, action) => { state.loop = action.payload; },
        setCurrentTime: (state, action) => { state.currentTime = action.payload; },
        setDuration: (state, action) => { state.duration = action.payload; },
    },
});

export const {
    setVideo,
    setPlaying,
    setMuted,
    setVolume,
    setPlaybackRate,
    setPlayed,
    setSeeking,
    setLoop,
    setCurrentTime,
    setDuration
} = playerSlice.actions;

export default playerSlice.reducer;