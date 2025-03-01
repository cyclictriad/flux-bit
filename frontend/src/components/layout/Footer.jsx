import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaFilm, FaEnvelope, FaGithub, FaTwitter, FaInstagram, FaHeart } from 'react-icons/fa';

const Footer = () => {
    const { darkMode } = useSelector(state => state.ui);
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'} transition-colors`}> 
            <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and Description */}
                    <div>
                        <div className="flex items-center space-x-2">
                            <FaFilm className="h-8 w-8 text-blue-500" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">FluxBit</span>
                        </div>
                        <p className="mt-4 text-sm">Your modern streaming platform for quality content. Stream anytime, anywhere.</p>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Navigation</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="hover:text-blue-500">Home</Link></li>
                            <li><Link to="/videos" className="hover:text-blue-500">Videos</Link></li>
                            <li><Link to="/upload" className="hover:text-blue-500">Upload</Link></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link to="/terms-of-service" className="hover:text-blue-500">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Socials */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Connect</h3>
                        <div className="flex space-x-4 mb-3">
                            <a href="#" className="hover:text-blue-500"><FaGithub size={20} /></a>
                            <a href="#" className="hover:text-blue-500"><FaTwitter size={20} /></a>
                            <a href="#" className="hover:text-blue-500"><FaInstagram size={20} /></a>
                        </div>
                        <a href="mailto:support@fluxbit.com" className="text-sm hover:text-blue-500 flex items-center space-x-1">
                            <FaEnvelope /> <span>support@fluxbit.com</span>
                        </a>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between text-sm">
                    <p>© {currentYear} FluxBit. All rights reserved.</p>
                    <p className="flex items-center space-x-1">
                        <span>Made with</span> <FaHeart className="text-red-500" /> <span>by FluxBit Team</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;