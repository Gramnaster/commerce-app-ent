// SearchBar Component
// Reusable search input with optional filter button and loading state
// Used across multiple pages: Products, Dashboard, Producers, Promotions, etc.

interface SearchBarProps {
  // Current search value from parent component state
  searchValue: string;
  // Function to handle search input changes
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Optional custom placeholder text (defaults to "Search by Name or Date")
  placeholder?: string;
  // Optional flag to show/hide the filter button (defaults to true)
  showFilterButton?: boolean;
  // Optional function to handle filter button click
  onFilterClick?: () => void;
  // Optional loading state to disable input during data fetch
  isLoading?: boolean;
}

const SearchBar = ({
  searchValue,
  onSearchChange,
  placeholder = "Search by Name or Date",
  showFilterButton = true,
  onFilterClick,
  isLoading = false,
}: SearchBarProps) => {
  return (
    <div className="bg-primary rounded-lg p-6 border border-primary mb-6">
      <div className="flex items-center gap-4">
        {/* Search Input with Icon */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={onSearchChange}
            disabled={isLoading}
            className="w-full bg-[white] border border-black rounded-lg p-3 pl-10 text-black placeholder-[#666666] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {/* Search Icon */}
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Loading Spinner - shows when isLoading is true */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="loading loading-spinner loading-sm text-primary"></span>
            </div>
          )}
        </div>

        {/* Filter Button - only shows if showFilterButton is true */}
        {showFilterButton && (
          <button
            onClick={onFilterClick}
            disabled={isLoading}
            className="p-3 bg-primary hover:bg-[#03529c] border border-[white] rounded-lg hover:cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
