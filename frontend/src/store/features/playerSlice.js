import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    video: null,
    playing: false,
    muted: false,
    volume: 0.5,
    playbackRate: 1,
    played: 0,
    seeking: false,
    Loop: false,
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setVideo: (state, action) => {
            state.video = action.payload;
        },
        setPlaying: (state, action) => {
            state.playing = action.payload;
        },
        setMuted: (state, action) => {
            state.muted = action.payload;
        },
        setVolume: (state, action) => {
            state.volume = action.payload;
        },
        setPlaybackRate: (state, action) => {
            state.playbackRate = action.payload;
        },
        setPlayed: (state, action) => {
            state.played = action.payload;
        },
        setSeeking: (state, action) => {
            state.seeking = action.payload;
        },
        setLoop: (state, action) => {
            state.Loop = action.payload;
        },
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
} = playerSlice.actions;

export default playerSlice.reducer;
