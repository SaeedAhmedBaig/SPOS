// app/components/navigation/Footer.jsx

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4 sm:mb-0">
          <span>© {currentYear} POS System</span>
          <span className="hidden sm:inline">•</span>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              Support
            </a>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>System Operational</span>
          </div>
          <span className="hidden md:inline">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;