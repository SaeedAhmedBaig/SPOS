'use client'

import React from 'react';

const Breadcrumbs = ({ items = [], separator = 'chevron', className = '' }) => {
  if (items.length === 0) return null;

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          {index > 0 && (
            <span className="text-gray-400 flex items-center">
              {separator === 'chevron' ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <span className="mx-1">{separator}</span>
              )}
            </span>
          )}

          {item.href && index < items.length - 1 ? (
            <a
              href={item.href}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-150"
            >
              {item.icon && <span className="inline-flex w-4 h-4 mr-1">{item.icon}</span>}
              {item.label}
            </a>
          ) : (
            <span
              className={`${
                index === items.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-500'
              }`}
            >
              {item.icon && <span className="inline-flex w-4 h-4 mr-1">{item.icon}</span>}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
