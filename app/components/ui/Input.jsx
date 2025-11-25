import React from 'react';

const Input = ({
  label,
  type = 'text',
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  containerClassName = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          type={type}
          disabled={disabled}
          className={`
            block w-full rounded-xl border border-gray-200 bg-white px-3 py-2
            text-gray-900 placeholder-gray-400 transition-all duration-200
            focus:border-gray-400 focus:ring-1 focus:ring-gray-200 focus:outline-none
            disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${className}
          `.trim()}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`text-xs ${error ? 'text-red-500' : 'text-gray-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
