import { useNavigation } from 'react-router-dom';

interface SubmitBtnType {
  text: string;
}

const SubmitBtn = ({ text }: SubmitBtnType) => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';


  return (
    <button type="submit" className="btn btn-secondary btn-block" disabled={isSubmitting}>
      {
        isSubmitting? <>
        <span className="loading loading-spinner"></span>
        Sending...</>:text
      }
      {/* {text} */}
    </button>
  );
};
export default SubmitBtn;
