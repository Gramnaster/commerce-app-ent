import { Form, Link, redirect, useNavigate, type ActionFunctionArgs } from "react-router-dom";
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
  console.log(`PromotionCreate submitData`, submitData);
  
  Object.entries(data).forEach(([key, value]) => {
    submitData.append(`promotion[${key}]`, value as string);
    console.log(`submitData append ${key}:`, value);
  });


  try {
    await customFetch.post('/promotions', submitData);
    toast.success('Promotion created successfully');
    return redirect('/promotions');

  } catch (error) {
    const err = error as AxiosError<{ error: { message: string } }>;
    const errorMessage =
      err.response?.data?.error?.message || 'Double check thy credentials';
    toast.error(errorMessage);
    return null;
  }
};

const PromotionCreate = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.userState.user);

  const [formData, setFormData] = useState({
    discount_amount: ''
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
      const response = await customFetch.post('/promotions', 
        { 
          promotion: formData
        },
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`PromotionsCreate response`, response)
      toast.success('promotion created successfully');
      navigate('/promotions');
      return response.data;
    } catch (error: any) {
      console.error('Failed to create promotion:', error);
      toast.error('Failed to promotion');
      return redirect('/promotions');
    }
  };  
  return (
    <div className="min-h-screen bg-[hsl(5,100%,98%)] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-black">
          <button
            onClick={() => navigate('/promotions')}
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
            Back to Promotions List
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">Create Promotion Interface</h1>
          <p className="text-black">
            Create Promotion
          </p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-[#BE493D] rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white">
              Promotion Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Promotion Discount amount
                </label>
                <input
                  type="text"
                  name="discount_amount"
                  value={formData.discount_amount}
                  onChange={handleInputChange}
                  className="w-full bg-[hsl(5,100%,98%)] border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/promotions`)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#11bb11] hover:bg-[#248324] disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PromotionCreate