import { useState, useRef, useEffect } from 'react';

interface SearchableDropdownProps {
  items: Array<{ id: number; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
}

const SearchableDropdown = ({
  items,
  value,
  onChange,
  placeholder = 'Search and select...',
  name,
  required = false,
  disabled = false,
}: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected item to display
  const selectedItem = items.find((item) => item.id.toString() === value);
  const displayValue = selectedItem ? selectedItem.label : '';

  // Filter items based on search term
  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (itemId: number) => {
    onChange(itemId.toString());
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} required={required} />

      {/* Display Input */}
      <div
        onClick={handleInputClick}
        className={`w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent cursor-pointer flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span className={displayValue ? 'text-black' : 'text-gray-400'}>
          {displayValue || placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Items List */}
          <div className="overflow-y-auto max-h-64">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`px-4 py-2 cursor-pointer hover:bg-[#5290ca] hover:text-white transition-colors ${
                    item.id.toString() === value ? 'bg-[#5290ca] text-white' : 'text-black'
                  }`}
                >
                  {item.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                No items found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
