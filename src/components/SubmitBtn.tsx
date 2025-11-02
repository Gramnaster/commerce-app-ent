import { useNavigation } from 'react-router-dom';

interface SubmitBtnType {
  text?: string;
  isSubmitting?: boolean;
  loadingText?: string;
}

const SubmitBtn = ({ text = 'Submit', isSubmitting, loadingText = 'Submitting...' }: SubmitBtnType) => {
  const navigation = useNavigation();
  const isNavigationSubmitting = navigation.state === 'submitting';
  const disabled = isSubmitting ?? isNavigationSubmitting;

  return (
    <button 
      type="submit" 
      className="px-6 py-3 bg-secondary hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors" 
      disabled={disabled}
    >
      {disabled ? loadingText : text}
    </button>
  );
};
export default SubmitBtn;
