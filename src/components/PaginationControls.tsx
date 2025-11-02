// PaginationControls Component
// Reusable pagination controls for navigating through pages
// Used across multiple pages: Products, Dashboard, Producers, Promotions, etc.

interface PaginationControlsProps {
  // Current active page number
  currentPage: number;
  // Total number of pages available
  totalPages: number;
  // Function to handle page changes (receives page number as parameter)
  onPageChange: (page: number) => void;
  // Optional: Enable smooth scroll to top when page changes (defaults to false)
  scrollToTop?: boolean;
}

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  scrollToTop = false 
}: PaginationControlsProps) => {
  // Don't render pagination if there's only one page or no pages
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    // Validate page is within bounds
    if (page < 1 || page > totalPages) return;
    
    onPageChange(page);
    
    // Optional smooth scroll to top of page
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="join mt-6 flex justify-center">
      {/* Previous Page Button */}
      <input
        className="join-item btn btn-square border-black shadow-none" 
        type="radio" 
        name="options" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="❮" 
      />
      
      {/* Page Number Buttons */}
      {[...Array(totalPages).keys()].map((_, i) => {
        const pageNum = i + 1;
        return (
          <input 
            key={i} 
            className="join-item btn btn-square border-black shadow-none" 
            type="radio" 
            name="options" 
            checked={currentPage === pageNum}
            onClick={() => handlePageChange(pageNum)}
            aria-label={`${pageNum}`} 
            readOnly
          />
        );
      })}
      
      {/* Next Page Button */}
      <input
        className="join-item btn btn-square border-black shadow-none" 
        type="radio" 
        name="options" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="❯" 
      />
    </div>
  );
};

export default PaginationControls;
