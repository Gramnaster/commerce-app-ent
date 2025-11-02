import { useNavigate } from "react-router-dom";

/**
 * BackButton Component
 * 
 * A reusable button that navigates back to the previous page in the browser history.
 * Uses React Router's navigate(-1) to handle back navigation properly for nested routes.
 * 
 * @param {string} text - Optional custom text for the button (default: "Back to Previous Page")
 */

interface BackButtonProps {
  text?: string;
}

const BackButton = ({ text = "Back to Previous Page" }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 text-black">
      <button
        onClick={() => navigate(-1)}
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
