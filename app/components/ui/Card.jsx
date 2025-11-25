import React from 'react';

const Card = ({ children, className = '', padding = 'default', hoverable = false, bordered = true, shadow = 'default', ...props }) => {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    default: 'p-6',
    large: 'p-8',
  };

  const shadowClasses = {
    none: '',
    default: 'shadow-sm',
    medium: 'shadow',
    large: 'shadow-lg',
  };

  const classes = `
    bg-white rounded-xl transition-all duration-200
    ${bordered ? 'border border-gray-200' : ''}
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${hoverable ? 'hover:shadow-md hover:border-gray-300 cursor-pointer' : ''}
    ${className}
  `.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>{children}</div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-black ${className}`} {...props}>{children}</h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-gray-500 mt-1 ${className}`} {...props}>{children}</p>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>{children}</div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`} {...props}>{children}</div>
);

export default Card;
