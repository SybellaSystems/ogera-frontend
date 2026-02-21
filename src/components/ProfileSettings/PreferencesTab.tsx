import React from "react";
import {
  AdjustmentsHorizontalIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../context/ThemeContext";
import type { ThemeMode } from "../../context/ThemeContext";

const THEME_OPTIONS: { value: ThemeMode; label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "System", Icon: ComputerDesktopIcon },
];

const PreferencesTab: React.FC = () => {
  const { theme: currentTheme, setTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-[#1a1528] rounded-xl shadow-lg border border-gray-200 dark:border-[#2d1b69]/50 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-[#2d1b69] px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-6 h-6" />
          Preferences
        </h2>
      </div>

      <div className="p-6 space-y-8">
        {/* Theme */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Theme</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Choose the appearance for your interface</p>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(({ value, label, Icon }) => {
              const isSelected = currentTheme === value;
              return (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#2d1b69] dark:border-[#9F7AEA] bg-[#f4f0fa] dark:bg-[#2d1b69]/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? "text-[#2d1b69] dark:text-[#9F7AEA]" : "text-gray-500 dark:text-gray-400"}`} />
                  <span className={`text-sm font-medium ${isSelected ? "text-[#2d1b69] dark:text-[#9F7AEA]" : "text-gray-700 dark:text-gray-300"}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesTab;
