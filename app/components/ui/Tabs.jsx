import React, { useState } from "react";

const Tabs = ({
  tabs = [],
  defaultActiveTab = 0,
  onTabChange,
  variant = "default",
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const handleTabClick = (index, tab) => {
    setActiveTab(index);
    onTabChange?.(index, tab);
  };

  //
  // Updated variants — cleaner, softer, more minimal
  //
  const variants = {
    default: "border-b border-gray-200",
    pills: "space-x-2",
    contained: "bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-sm",
  };

  //
  // Updated theme — more Notion-like
  //
  const tabVariants = {
    default: {
      active:
        "border-gray-900 text-gray-900 font-medium",
      inactive:
        "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
    },
    pills: {
      active:
        "bg-gray-900 text-white shadow-sm",
      inactive:
        "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    },
    contained: {
      active:
        "bg-white text-gray-900 shadow-sm border border-gray-200",
      inactive:
        "text-gray-600 hover:text-gray-900 hover:bg-white/60",
    },
  };

  return (
    <div className={className}>
      {/* TAB BUTTONS */}
      <div className={`flex ${variants[variant]}`}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          const styles = tabVariants[variant];

          return (
            <button
              key={tab.id || index}
              disabled={tab.disabled}
              onClick={() => handleTabClick(index, tab)}
              className={`
                px-4 py-2 text-sm rounded-lg select-none transition-all duration-200
                ${
                  variant === "default"
                    ? "border-b-2 rounded-none"
                    : "rounded-lg"
                }
                ${isActive ? styles.active : styles.inactive}
                ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <div className="flex items-center space-x-2">
                {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
                <span>{tab.label}</span>

                {tab.badge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="mt-4">{tabs[activeTab]?.content}</div>
    </div>
  );
};

export default Tabs;
