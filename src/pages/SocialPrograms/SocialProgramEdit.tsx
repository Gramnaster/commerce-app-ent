import { redirect, useLoaderData, useNavigate, useNavigation } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { SocialProgram } from "./SocialPrograms";
import { SubmitBtn } from "../../components";

interface SocialProgramResponse {
  data: SocialProgram;
}
export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  console.log(`Admins admin_user`, admin_user)
  const id = params.id;

  const SocialProgramViewQuery = {
    queryKey: ['SocialProgram', id],
    queryFn: async () => {
      const response = await customFetch.get(`/social_programs/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const [ SocialProgram ] = await Promise.all([
    queryClient.ensureQueryData(SocialProgramViewQuery)
    ])
    console.log(`SocialProgramEdit SocialProgram`, SocialProgram)
    return { SocialProgram };
  } catch (error: any) {
    console.error('Failed to load Promotions:', error);
    toast.error('Failed to load Promotions list');
    return { promotions: [] };
  }
};


const SocialProgramEdit = () => {
  const { SocialProgram } = useLoaderData() as {
    SocialProgram: SocialProgramResponse;
  }
  console.log(`SocialProgramEdit SocialProgram`, SocialProgram)
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const user = useSelector((state: RootState) => state.userState.user);

  const [formData, setFormData] = useState({
    title: SocialProgram.data.title,
    description: SocialProgram.data.description,
  })

  const updateProgramMutation = useMutation({
    mutationFn: async (socialProgramData: any) => {
      const response = await customFetch.patch(
        `/social_programs/${SocialProgram.data.id}`,
        {
          social_program: socialProgramData,
        },
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Social Program updated successfully');
      queryClient.invalidateQueries({ queryKey: ['socialProgram', SocialProgram.data.id] });
      navigate(`/social_programs/${SocialProgram.data.id}`);
    },
    onError: (error: any) => {
      console.error('Update failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to update Social Program';
      toast.error(errorMessage);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
    return {
      ...prev,
      [name]: value,
    }
  });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create the payload matching the API format
    const payload = {
      ...formData,
    };
    
    updateProgramMutation.mutate(payload);
  };

  const handleDelete = async () => {
  if (!confirm("Are you sure you want to delete this program?")) return;
  
    console.log(`handleSubmit formData:`, formData)
    navigate(`/social_programs`)
    // Create the payload matching the API format
   try {
      const response = await customFetch.delete(`/social_programs/${SocialProgram.data.id}`,
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      redirect('/social_programs');
      toast.success('Social Program deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('Failed to load Social Program:', error);
      toast.error('Failed to load Social Program details');
      return redirect('/social_programs');
    }
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
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
          <h1 className="text-3xl font-bold text-black mb-2">Edit Social Program Interface</h1>
          <p className="text-black">
            Edit Social Program value
          </p>
          <button type="button" onClick={handleDelete}>Delete Social Program?</button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-primary rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white">
              Social Program description
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Social Program name
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
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Social Program description
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
            <SubmitBtn text="Submit" isSubmitting={isSubmitting} />
          </div>
        </form>
      </div>
    </div>
  )
}

export default SocialProgramEdit