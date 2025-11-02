import { redirect, useNavigate, useNavigation, type ActionFunctionArgs } from "react-router-dom";
import { customFetch } from "../../utils";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { FormInput, SubmitBtn } from "../../components";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useState } from "react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  
  // Add userDetailAttributes
  // user["key"]
  // If reach dob,
  // Add to userDetailAttributes
  // Append userDetailAttributes submitData

  // Convert to FormData to avoid preflight (same fix as login)
  const submitData = new FormData();
  console.log(`SocialProgramCreate submitData`, submitData);
  
  Object.entries(data).forEach(([key, value]) => {
    submitData.append(`promotion[${key}]`, value as string);
    console.log(`submitData append ${key}:`, value);
  });


  try {
    await customFetch.post('/social_programs', submitData);
    toast.success('Social Program created successfully');
    return redirect('/social_programs');

  } catch (error) {
    const err = error as AxiosError<{ error: { message: string } }>;
    const errorMessage =
      err.response?.data?.error?.message || 'Double check thy credentials';
    toast.error(errorMessage);
    return null;
  }
};

const SocialProgramCreate = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.userState.user);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [formData, setFormData] = useState({
      title: '',
      description: '',
      address_id: ''
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
        return {
      ...prev,
      [name]: value
      }});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await customFetch.post('/social_programs', 
        { 
          social_program: formData
        },
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`SocialProgramCreate response`, response)
      toast.success('Social Program created successfully');
      navigate('/social_programs');
      return response.data;
    } catch (error: any) {
      console.error('Failed to create social program:', error);
      toast.error('Failed creation');
      return redirect('/social_programs');
    }
  }; 

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-black">
          <button
            onClick={() => navigate('/social_programs')}
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
            Back to Social Programs List
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">Create Social Program Interface</h1>
          <p className="text-black">
            Create Social Program
          </p>
        </div>

        {/* Create Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-primary rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white">
              Social Program Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Social Program Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Address ID
                </label>
                <input
                  type="text"
                  name="address_id"
                  value={formData.address_id}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/social_programs`)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <SubmitBtn text="Submit" isSubmitting={isSubmitting} />
          </div>
        </form>
      </div>
    </div>
  )
}

export default SocialProgramCreate