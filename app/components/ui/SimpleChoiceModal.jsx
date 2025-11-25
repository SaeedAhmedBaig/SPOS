import React from 'react';
import { X, Download } from 'lucide-react';

const SimpleChoiceModal = ({
  isOpen = false,
  onClose,
  title = "Choose Option",
  description = "Please select an option:",
  choices = [],
  cancelText = "Cancel",
  className = "",
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div
          className={`
            bg-white rounded-xl shadow-lg w-full max-w-md 
            border border-gray-200 transition-all 
            ${className}
          `}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-[17px] font-semibold text-gray-900">{title}</h2>

            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {description && (
              <p className="text-[14px] text-gray-600 leading-relaxed">{description}</p>
            )}

            {/* Choice Buttons */}
            <div className="space-y-2">
              {choices.map(choice => (
                <button
                  key={choice.id}
                  onClick={() => {
                    choice.onSelect?.(choice.id);
                    handleClose();
                  }}
                  disabled={choice.disabled}
                  className={`
                    w-full flex items-center justify-between p-3 
                    rounded-lg border text-sm transition-all
                    ${
                      choice.disabled
                        ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white border-gray-200 hover:bg-gray-50 text-gray-800"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {choice.icon && (
                      <div className="text-gray-600">
                        {choice.icon}
                      </div>
                    )}

                    <div className="text-left">
                      <div className="font-medium">{choice.label}</div>
                      {choice.description && (
                        <div className="text-xs text-gray-500">
                          {choice.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <Download className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>

            {/* Cancel Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleClose}
                className="
                  px-4 py-2 text-sm font-medium text-gray-700 
                  bg-white border border-gray-300 rounded-lg 
                  hover:bg-gray-50 transition
                "
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SimpleChoiceModal;
