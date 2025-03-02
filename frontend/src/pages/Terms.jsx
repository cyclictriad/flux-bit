import React from 'react';
import { useSelector } from 'react-redux';

function Terms() {
  const theme = useSelector((state) => state.ui.theme);

  const termsContent = [
    {
      title: "User Responsibilities",
      content: "Users are expected to use our services in compliance with all applicable laws and regulations..."
    },
    {
      title: "Content Ownership",
      content: "All content available on FluxBit is either owned by us or our content partners..."
    },
    {
      title: "Privacy Policy",
      content: "We value your privacy and are committed to protecting your personal information..."
    },
    {
      title: "Limitation of Liability",
      content: "To the maximum extent permitted by law, FluxBit shall not be liable for any indirect, incidental, or consequential damages..."
    },
    {
      title: "Changes to Terms",
      content: "We reserve the right to modify these terms at any time..."
    }
  ];

  return (
    <div className={`p-6 min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Terms of Use</h1>
        
        <div className={`p-6 mb-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border'}`}>
          <p className="mb-4">
            Welcome to FluxBit, your go-to platform for modern video streaming. By accessing or using our services, 
            you agree to be bound by the following terms and conditions. We encourage you to read them thoroughly 
            and contact us if you have any questions.
          </p>
        </div>
        
        {termsContent.map((section, index) => (
          <div key={index} className={`p-6 mb-6 rounded-lg shadow ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border'}`}>
            <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
            <p>{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Terms;