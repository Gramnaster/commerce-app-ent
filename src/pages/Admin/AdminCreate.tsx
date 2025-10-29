import { Form, Link, redirect, useNavigate, useNavigation, type ActionFunctionArgs } from "react-router-dom";
import { customFetch } from "../../utils";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { FormInput, SubmitBtn } from "../../components";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

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
  console.log(`submitData`, submitData);
  
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'first_name' || key === "last_name" || key === "dob") {
      submitData.append(`admin_user[admin_detail_attributes][${key}]`, value as string);
    } else {
      submitData.append(`admin_user[${key}]`, value as string);
    }
    console.log(`submitData append ${key}:`, value);
  });


  try {
    await customFetch.post('/admin_users/signup', submitData);
    toast.success('account created successfully');
    return redirect('/login');

  } catch (error) {
    const err = error as AxiosError<{ error: { message: string } }>;
    const errorMessage =
      err.response?.data?.error?.message || 'Double check thy credentials';
    toast.error(errorMessage);
    return null;
  }
};


const AdminCreate = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.userState.user);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [formData, setFormData] = useState({
    email: '',
    admin_role: '',
    password: '',
    password_confirmation: '',
    admin_detail_attributes: {
      first_name: '',
      middle_name: '',
      last_name: '',
      dob: ''
    }
  })

  const NESTED_FIELDS: Record<string, string> = {
    first_name: 'admin_detail_attributes',
    middle_name: 'admin_detail_attributes',
    last_name: 'admin_detail_attributes',
    dob: 'admin_detail_attributes'
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
  const { name, value } = e.target;
  const parentKey = NESTED_FIELDS[name];

  setFormData((prev) => {
    if (parentKey === 'admin_detail_attributes') {
      return {
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [name]: value,
        },
      };
    }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await customFetch.post('/admin_users/signup', 
        { 
          admin_user: formData
        },
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('Admin user created successfully');
      navigate('/admins');
      return response.data;
    } catch (error: any) {
      console.error('Failed to create admin:', error);
      toast.error('Failed to admin');
      return redirect('/admins');
    }
  };
  return (
    <div data-theme="light" className="min-h-screen bg-[hsl(5,100%,98%)] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-black">
          <button
            onClick={() => navigate('/admins')}
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
            Back to Admin List
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">Create Category Interface</h1>
          <p className="text-black">
            Create Admin
          </p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-[#BE493D] rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white">
              Admin Creation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[hsl(5,100%,98%)] border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-[hsl(5,100%,98%)] border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Password Confirmation
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    className="w-full bg-[hsl(5,100%,98%)] border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Admin Role
                </label>
                <select
                  name="admin_role"
                  value={formData.admin_role || ''}
                  onChange={handleInputChange}>
                    <option value="" className="text-black">Select role here</option>
                      <option value='management' className="text-black">Management</option>
                      <option value='warehouse' className="text-black">Warehouse</option>
                </select>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.admin_detail_attributes.first_name}
                  onChange={handleInputChange}
                  className="w-full bg-[hsl(5,100%,98%)] border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.admin_detail_attributes.last_name}
                  onChange={handleInputChange}
                  className="w-full bg-[hsl(5,100%,98%)] border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.admin_detail_attributes.dob}
                  onChange={handleInputChange}
                  className="input w-full bg-[hsl(5,100%,98%)] border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/product_categories`)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#11bb11] hover:bg-[#248324] disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminCreate