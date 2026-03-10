import React, { useState, useRef, useEffect } from "react";
import { styled } from "@mui/material/styles";

// TypeScript type for styled props
interface StyledProps {
  $isOpen?: boolean;
  $isSelected?: boolean;
}

export interface CountryCode {
  code: string; // Country code like "+1", "+91"
  name: string; // Country name like "United States", "India"
  flag: string; // Flag emoji like "🇺🇸", "🇮🇳"
}

// Common country codes list
export const COUNTRY_CODES: CountryCode[] = [
  { code: "+1", name: "United States/Canada", flag: "🇺🇸" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "+256", name: "Uganda", flag: "🇺🇬" },
  { code: "+255", name: "Tanzania", flag: "🇹🇿" },
  { code: "+250", name: "Rwanda", flag: "🇷🇼" },
  { code: "+221", name: "Senegal", flag: "🇸🇳" },
  { code: "+212", name: "Morocco", flag: "🇲🇦" },
  { code: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "+66", name: "Thailand", flag: "🇹🇭" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "+32", name: "Belgium", flag: "🇧🇪" },
  { code: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "+358", name: "Finland", flag: "🇫🇮" },
  { code: "+7", name: "Russia/Kazakhstan", flag: "🇷🇺" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "+57", name: "Colombia", flag: "🇨🇴" },
  { code: "+51", name: "Peru", flag: "🇵🇪" },
  { code: "+56", name: "Chile", flag: "🇨🇱" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "+965", name: "Kuwait", flag: "🇰🇼" },
  { code: "+973", name: "Bahrain", flag: "🇧🇭" },
  { code: "+968", name: "Oman", flag: "🇴🇲" },
  { code: "+961", name: "Lebanon", flag: "🇱🇧" },
  { code: "+962", name: "Jordan", flag: "🇯🇴" },
  { code: "+972", name: "Israel", flag: "🇮🇱" },
  { code: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "+95", name: "Myanmar", flag: "🇲🇲" },
  { code: "+977", name: "Nepal", flag: "🇳🇵" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
];

interface CountryCodeSelectorProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search
  const filteredCountries = COUNTRY_CODES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.includes(searchTerm)
  );

  // Get selected country
  const selectedCountry = COUNTRY_CODES.find((c) => c.code === value) || COUNTRY_CODES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <Container ref={dropdownRef}>
      <SelectButton
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        $isOpen={isOpen}
      >
        <span>{selectedCountry.flag}</span>
        <span>{selectedCountry.code}</span>
        <ChevronIcon $isOpen={isOpen}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 4L6 8L10 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ChevronIcon>
      </SelectButton>

      {isOpen && (
        <Dropdown>
          <SearchInput
            type="text"
            placeholder="Search country..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
          />
          <CountryList>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <CountryItem
                  key={country.code}
                  onClick={() => handleSelect(country.code)}
                  $isSelected={country.code === value}
                >
                  <span>{country.flag}</span>
                  <span>{country.code}</span>
                  <span>{country.name}</span>
                </CountryItem>
              ))
            ) : (
              <NoResults>No countries found</NoResults>
            )}
          </CountryList>
        </Dropdown>
      )}
    </Container>
  );
};

export default CountryCodeSelector;

const Container = styled("div")`
  position: relative;
  display: inline-block;
`;

const SelectButton = styled("button")<StyledProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid var(--theme-border, #ddd);
  border-radius: 8px 0 0 8px;
  background: var(--theme-input-bg, #ffffff);
  cursor: pointer;
  font-size: 14px;
  min-width: 100px;
  transition: all 0.2s;
  border-right: none;

  &:hover:not(:disabled) {
    border-color: #7f56d9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${(props: StyledProps) =>
    props.$isOpen &&
    `
    border-color: #7f56d9;
    border-bottom-color: transparent;
  `}
`;

const ChevronIcon = styled("span")<StyledProps>`
  display: flex;
  align-items: center;
  margin-left: auto;
  transition: transform 0.2s;
  transform: ${(props: StyledProps) => (props.$isOpen ? "rotate(180deg)" : "rotate(0deg)")};
`;

const Dropdown = styled("div")`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--theme-card-bg, #ffffff);
  border: 1px solid var(--theme-border, #7f56d9);
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  display: flex;
  flex-direction: column;
  margin-top: -1px;
`;

const SearchInput = styled("input")`
  padding: 10px 14px;
  border: none;
  border-bottom: 1px solid var(--theme-border, #eee);
  font-size: 14px;
  outline: none;
  background: var(--theme-input-bg, #ffffff);
  color: var(--theme-text-primary, #111827);

  &:focus {
    border-bottom-color: #7f56d9;
  }
`;

const CountryList = styled("div")`
  overflow-y: auto;
  max-height: 250px;
`;

const CountryItem = styled("div")<StyledProps>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: rgba(127, 86, 217, 0.08);
  }

  ${(props: StyledProps) =>
    props.$isSelected &&
    `
    background: rgba(127, 86, 217, 0.14);
    font-weight: 600;
    color: inherit;
  `}

  span:first-of-type {
    font-size: 18px;
  }

  span:nth-of-type(2) {
    font-weight: 500;
    min-width: 50px;
  }

  span:last-of-type {
    margin-left: auto;
    color: ${(props: StyledProps) => (props.$isSelected ? "#7f56d9" : "#666")};
  }
`;

const NoResults = styled("div")`
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
`;

