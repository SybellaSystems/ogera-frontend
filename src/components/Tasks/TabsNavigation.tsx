import type { FC, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabsNavigation: FC<TabsNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-6 py-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 rounded-t-lg px-4 py-3 font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.icon && <span className="text-lg">{tab.icon}</span>}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabsNavigation;
