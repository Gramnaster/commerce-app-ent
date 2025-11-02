import { useNavigate, useLocation } from "react-router-dom";

/**
 * BackButton Component
 * 
 * A reusable button that navigates back to the previous page in the browser history.
 * Uses React Router's navigate(-1) to handle back navigation properly for nested routes.
 * Falls back to a parent route if no history exists.
 * 
 * @param {string} text - Optional custom text for the button (default: "Back to Previous Page")
 * @param {string} fallbackPath - Optional fallback path if no history exists
 */

interface BackButtonProps {
  text?: string;
  fallbackPath?: string;
}

const BackButton = ({ text = "Back to Previous Page", fallbackPath }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback: navigate to parent route or provided fallback
      if (fallbackPath) {
        navigate(fallbackPath);
      } else {
        // Extract parent route from current path
        const pathParts = location.pathname.split('/').filter(Boolean);
        pathParts.pop(); // Remove last segment
        const parentPath = '/' + pathParts.join('/');
        navigate(parentPath || '/');
      }
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
