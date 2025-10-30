import { redirect, useLoaderData, useNavigate, useNavigation } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

interface ProductCategory {
  id: number;
  title: string;
  products_count: number;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;

  const id = params.id;

  const CategoryViewQuery = {
    queryKey: ['CategoryDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/product_categories/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const CategoryDetails = await queryClient.ensureQueryData(CategoryViewQuery);
    console.log(`CategoryEdit CategoryDetails`, CategoryDetails)
    return { CategoryDetails };
  } catch (error: any) {
    console.error('Failed to load category details:', error);
    toast.error('Failed to load category details');
    return redirect('/products');
  }
};

const CategoryEdit = () => {
  const { CategoryDetails } = useLoaderData() as {
    CategoryDetails: ProductCategory;
  }
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const user = useSelector((state: RootState) => state.userState.user);

  const [formData, setFormData] = useState({
    title: CategoryDetails.data.title,
  })

  const updateCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      const response = await customFetch.patch(
        `/product_categories/${CategoryDetails.data.id}`,
        {
          product_category: categoryData,
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
      toast.success('Category Details updated successfully');
      queryClient.invalidateQueries({ queryKey: ['category', CategoryDetails.data.id] });
      navigate(`/categories/${CategoryDetails.data.id}`);
    },
    onError: (error: any) => {
      console.error('Update failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to update category';
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
    
    updateCategoryMutation.mutate(payload);
  };

  const handleDelete = async (e: React.FormEvent) => {
  if (!confirm("Are you sure you want to delete this category?")) return;
    navigate(`/categories`)
    // Create the payload matching the API format
   try {
      const response = await customFetch.delete(`/product_categories/${CategoryDetails.data.id}`,
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      redirect('/categories');
      toast.success('Category deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('Failed to load category:', error);
      toast.error('Failed to load category details');
      return redirect('/categories');
    }
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-black">
          <button
            onClick={() => navigate(`/categories/${CategoryDetails.data.id}`)}
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
            Back to Category View
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">Edit Category Interface</h1>
          <p className="text-black">
            Edit Category
          </p>
          <button type="button" onClick={handleDelete} className="text-primary hover:underline hover:cursor-pointer">Delete Category?</button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-primary rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white">
              Category Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Category Name
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
          </div>
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/categories/${CategoryDetails.data.id}`)}
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

export default CategoryEdit