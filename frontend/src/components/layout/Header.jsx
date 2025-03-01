import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHome, FaFilm, FaSearch, FaBars, FaTimes, FaCloudUploadAlt } from 'react-icons/fa';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { darkMode } = useSelector(state => state.ui);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className={`sticky top-0 z-50 shadow-md transition-colors ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <FaFilm className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">FluxBit</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          <Link to="/" className={`flex items-center gap-2 p-2 rounded-md transition ${location.pathname === '/' ? 'text-blue-500' : darkMode ? 'text-gray-300' : 'text-gray-600'} hover:bg-gray-100 dark:hover:bg-gray-800`}>
            <FaHome /> Home
          </Link>
          <Link to="/videos" className={`flex items-center gap-2 p-2 rounded-md transition ${location.pathname === '/videos' ? 'text-blue-500' : darkMode ? 'text-gray-300' : 'text-gray-600'} hover:bg-gray-100 dark:hover:bg-gray-800`}>
            <FaFilm /> Videos
          </Link>
          <Link to="/upload" className={`flex items-center gap-2 p-2 rounded-md transition ${location.pathname === '/videos' ? 'text-blue-500' : darkMode ? 'text-gray-300' : 'text-gray-600'} hover:bg-gray-100 dark:hover:bg-gray-800`}>
            <FaCloudUploadAlt /> Upload
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex items-center relative">
          <FaSearch className="absolute left-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search videos..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 dark:text-white rounded-full focus:ring-2 focus:ring-blue-500 outline-none w-64"
          />
          <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600" onClick={handleSearch}>Search</button>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`md:hidden p-4 transition ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <nav className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600" onClick={() => setIsMenuOpen(false)}>
              <FaHome /> Home
            </Link>
            <Link to="/videos" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600" onClick={() => setIsMenuOpen(false)}>
              <FaFilm /> Videos
            </Link>
          </nav>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="flex mt-3">
            <input 
              type="text" 
              placeholder="Search videos..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="flex-grow p-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-l-md outline-none"
            />
            <button className="px-4 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
              <FaSearch size={18} />
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
