import { redirect, useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

interface ProductCategory {
  id: number;
  title: string;
}

interface Promotion {
  id: number;
  discount_amount: string;
  products_count: number;
  product_categories: ProductCategory[];
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  console.log(`Admins admin_user`, admin_user)
  const id = params.id;

  const PromotionViewQuery = {
    queryKey: ['Promotions', id],
    queryFn: async () => {
      const response = await customFetch.get(`/promotions/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const [ promotion ] = await Promise.all([
    queryClient.ensureQueryData(PromotionViewQuery)
    ])
    console.log(`Promotions Promotions`, promotion)
    return { promotion };
  } catch (error: any) {
    console.error('Failed to load Promotions:', error);
    toast.error('Failed to load Promotions list');
    return { promotions: [] };
  }
};

const PromotionEdit = () => {
  const { promotion } = useLoaderData() as {
    promotion: Promotion;
  }
  console.log(`PromotionEdit PromotionDetails`, promotion)
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useSelector((state: RootState) => state.userState.user);

  const [formData, setFormData] = useState({
    discount_amount: promotion.data.discount_amount,
  })

  const updatePromotionMutation = useMutation({
    mutationFn: async (promotionData: any) => {
      const response = await customFetch.patch(
        `/promotions/${promotion.data.id}`,
        {
          promotion: promotionData,
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
      toast.success('Promotion updated successfully');
      queryClient.invalidateQueries({ queryKey: ['promotion', promotion.data.id] });
      navigate(`/promotions/${promotion.data.id}`);
    },
    onError: (error: any) => {
      console.error('Update failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to update promotion';
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
    
    updatePromotionMutation.mutate(payload);
  };

  const handleDelete = async (e: React.FormEvent) => {
  if (!confirm("Are you sure you want to delete this promotion?")) return;
  
    console.log(`handleSubmit formData:`, formData)
    navigate(`/promotions`)
    // Create the payload matching the API format
   try {
      const response = await customFetch.delete(`/promotions/${promotion.data.id}`,
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      redirect('/promotions');
      toast.success('Promotion deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('Failed to load promotion:', error);
      toast.error('Failed to load promotion details');
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
          <h1 className="text-3xl font-bold text-black mb-2">Edit Promotion Interface</h1>
          <p className="text-black">
            Edit Promotion value
          </p>
          <button type="button" onClick={handleDelete}>Delete Promotion?</button>
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
                  Promotion discount amount
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

export default PromotionEdit