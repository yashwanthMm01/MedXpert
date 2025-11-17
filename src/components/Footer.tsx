import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-2">MedXpert</h3>
            <p className="text-sm">Accelerating India's Healthcare Digitization</p>
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
            <ul className="text-sm">
              <li><a href="/" className="hover:text-blue-300">Home</a></li>
              <li><a href="/about" className="hover:text-blue-300">About Us</a></li>
              <li><a href="/contact" className="hover:text-blue-300">Contact Us</a></li>
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h4 className="text-lg font-semibold mb-2">Contact</h4>
            <p className="text-sm">Email: info@medxpert.com</p>
            <p className="text-sm">Phone: +91 123 456 7890</p>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} MedXpert. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;