import React, { useEffect } from 'react';

const Drawer = ({ isOpen = false, onClose, children, position = 'right', title, size = 'md', className = '' }) => {
  useEffect(() => {
    const handleEscape = (event) => { if (event.key === 'Escape' && isOpen) onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = { left: 'left-0', right: 'right-0', top: 'top-0 w-full', bottom: 'bottom-0 w-full' };
  const sizeClasses = { sm: 'w-80', md: 'w-96', lg: 'w-120', xl: 'w-140', full: position === 'left' || position === 'right' ? 'w-full' : 'h-full' };

  const drawerClasses = `
    fixed top-0 h-full bg-white shadow-lg z-50
    ${positionClasses[position]}
    ${sizeClasses[size]}
    ${position === 'top' ? 'h-96' : ''}
    ${position === 'bottom' ? 'h-96' : ''}
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'}
    ${className}
  `;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-20 z-40 transition-opacity duration-300" onClick={onClose} />
      <div className={drawerClasses}>
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-black">{title}</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className={`h-full overflow-y-auto ${!title ? 'pt-4' : ''}`}>{children}</div>
      </div>
    </>
  );
};

export default Drawer;
