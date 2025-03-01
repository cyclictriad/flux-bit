import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import VideoGallery from './pages/Videos';
import PlayPage from './pages/Play';
import UploadPage from './pages/Upload';
import TermsPage from './pages/Terms';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/videos" element={<VideoGallery />} />
            <Route path="/play/:id" element={<PlayPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/terms-of-service" element={<TermsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;