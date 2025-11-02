import { useNavigate, useLocation } from "react-router-dom";

/**
 * BackButton Component
 * 
 * A reusable button that navigates back.
 * 
 * Two modes:
 * 1. useHistory=true (default): Uses navigate(-1) for browser back button behavior
 * 2. useHistory=false: Always navigates to specified route (better for "Back to List" buttons)
 * 
 * @param {string} text - Optional custom text for the button (default: "Back to Previous Page")
 * @param {string} to - Optional specific route to navigate to (overrides history behavior)
 * @param {boolean} useHistory - Whether to use browser history (default: true)
 */

interface BackButtonProps {
  text?: string;
  to?: string;
  useHistory?: boolean;
}

const BackButton = ({ text = "Back to Previous Page", to, useHistory = true }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // If specific route is provided, always use it
    if (to) {
      navigate(to);
    } else if (useHistory && window.history.length > 1) {
      // Use browser history if enabled and available
      navigate(-1);
    } else {
      // Fallback: navigate to parent route
      const pathParts = location.pathname.split('/').filter(Boolean);
      pathParts.pop(); // Remove last segment
      const parentPath = '/' + pathParts.join('/');
      navigate(parentPath || '/');
    }
  };

  return (
    <div className="mb-6 text-black">
      <button
        onClick={handleBack}
        className="mb-4 flex items-center gap-2 hover:underline transition-colors text-black"
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
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        {text}
      </button>
    </div>
  );
};

export default BackButton;
