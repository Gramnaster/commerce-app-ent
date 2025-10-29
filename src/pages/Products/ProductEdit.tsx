import { redirect, useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { ProducersResponse, ProductCategoriesResponse, ProductDetailsResponse } from "./Products";

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;

  const id = params.id;
  console.log('ProductEdit loader - params.id:', id);
  console.log('ProductEdit loader - admin_user:', admin_user);

  const ProductDetailsQuery = {
    queryKey: ['ProductDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/products/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      console.log('ProductEdit ProductDetails response.data:', response.data)
      return response.data;
    },
  };

  const ProducersQuery = {
    queryKey: ['ProducersDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/producers`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      console.log('ProductEdit producers response.data:', response.data)
      return response.data;
    },
  };

  const ProductCategoriesQuery = {
    queryKey: ['ProductCategoriesDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/product_categories`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      console.log('ProductEdit product_categories response.data:', response.data)
      return response.data;
    },
  };

  try {
    const [ProductDetails, ProducersDetails, ProductCategoriesDetails] = await  Promise.all([
      queryClient.ensureQueryData(ProductDetailsQuery),
      queryClient.ensureQueryData(ProducersQuery),
      queryClient.ensureQueryData(ProductCategoriesQuery)
    ])
    console.log('ProductEdit ProducersDetails:', ProducersDetails)
    console.log('ProductEdit ProductCategoriesDetails:', ProductCategoriesDetails)
    return { ProductDetails, ProducersDetails, ProductCategoriesDetails };
  } catch (error: any) {
    console.error('ProductEdit - Failed to load product:', error);
    toast.error('Failed to load product details');
    return redirect('/products');
  }
};

const ProductEdit = () => {
  const { ProductDetails, ProducersDetails, ProductCategoriesDetails } = useLoaderData() as {
    ProductDetails: ProductDetailsResponse;
    ProducersDetails: ProducersResponse;
    ProductCategoriesDetails: ProductCategoriesResponse;
  }
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {title, description, price, product_image_url, product_category, producer, promotion} = ProductDetails.data

  console.log('ProductEdit component - ProductDetails:', ProductDetails);
  console.log('ProductEdit component - current product_image_url:', product_image_url);

  const user = useSelector((state: RootState) => state.userState.user);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product_image_url);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: title,
    description: description,
    price: price,
    product_image_url: product_image_url || '',
    product_category_id:  product_category.id,
    producer_id: producer.id,
    promotion_id: promotion?.id || null
  })

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('ProductEdit handleFileChange - Selected file:', file.name, file.size, 'bytes');
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const updateProductMutation = useMutation({
    mutationFn: async (productData: FormData | any) => {
      console.log('ProductEdit mutation - Sending update request');
      const response = await customFetch.patch(
        `/products/${ProductDetails.data.id}`,
        productData,
        {
          headers: {
            Authorization: user?.token,
            // Content-Type will be set automatically for FormData
          },
        }
      );
      console.log('ProductEdit mutation - Response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('ProductEdit mutation - Success, updating product ID:', ProductDetails.data.id);
      toast.success('Product Details updated successfully');
      queryClient.invalidateQueries({ queryKey: ['products', ProductDetails.data.id] });
      navigate(`/products/${ProductDetails.data.id}`);
    },
    onError: (error: any) => {
      console.error('ProductEdit mutation - Update failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to update product';
      toast.error(errorMessage);
    },
  });

  console.log(`ProductView ProductDetails`, ProductDetails)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('ProductEdit handleSubmit - formData:', formData)
    console.log('ProductEdit handleSubmit - imageFile:', imageFile)
    
    try {
      // Check if there's a new image to upload
      if (imageFile) {
        console.log('ProductEdit - Using FormData for file upload');
        // Use FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('product[title]', formData.title);
        formDataToSend.append('product[description]', formData.description);
        formDataToSend.append('product[price]', formData.price.toString());
        formDataToSend.append('product[product_category_id]', formData.product_category_id.toString());
        formDataToSend.append('product[producer_id]', formData.producer_id.toString());
        
        if (formData.promotion_id) {
          formDataToSend.append('product[promotion_id]', formData.promotion_id.toString());
        }
        
        // Add image file
        formDataToSend.append('product[product_image]', imageFile);
        
        console.log('ProductEdit - Sending FormData to API');
        updateProductMutation.mutate(formDataToSend);
      } else {
        console.log('ProductEdit - Using JSON for regular update');
        // Use JSON for regular update
        const payload = {
          product: formData,
        };
        console.log('ProductEdit handleSubmit - payload:', payload)
        updateProductMutation.mutate(payload);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
  if (!confirm("Are you sure you want to delete this product?")) return;
  
    console.log('ProductEdit handleDelete - Deleting product ID:', ProductDetails.data.id)
    navigate(`/products`)
    
   try {
      console.log('ProductEdit handleDelete - Sending DELETE request');
      const response = await customFetch.delete(`/products/${ProductDetails.data.id}`,
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('ProductEdit handleDelete - Delete response:', response.data);
      redirect('/products');
      toast.success('Product deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('ProductEdit handleDelete - Failed to delete product:', error);
      toast.error('Failed to load product details');
      return redirect('/products');
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(5,100%,98%)] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-black">
          <button
            onClick={() => navigate(`/products/${ProductDetails.data.id}`)}
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
            Back to Product View
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">Edit Product Info</h1>
          <p className=" text-black">
            Editing {ProductDetails.data.title || ''}{' '}
          </p>
          <button type="button" onClick={handleDelete} className="text-primary hover:underline hover:cursor-pointer">Delete Product?</button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-primary rounded-lg p-6 border border-gray-700">

            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white">
              Product Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Product Name
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
                  description
                </label>
                <input
                  type="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Price
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Product image URL
                </label>
                <input
                  type="text"
                  name="product_image_url"
                  value={formData.product_image_url}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  placeholder="Or enter image URL"
                />
              </div>
              {/* File input for image upload */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Upload New Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 w-[200px] h-[200px] object-cover rounded"
                  />
                )}
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Producers
                </label>
                <select
                  name="producer_id"
                  value={formData.producer_id || ''}
                  onChange={handleInputChange}
                >
                <option value="">Select a producer</option>
                  {ProducersDetails.data?.map((producer: any) => (
                    <option key={producer.id} value={producer.id} className="text-black">
                      {producer.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Product Category
                </label>
                <select
                  name="product_category_id"
                  value={formData.product_category_id || ''}
                  onChange={handleInputChange}>
                    <option value="">Select a category</option>
                      {ProductCategoriesDetails.data?.map((product_category: any) => (
                        <option key={product_category.id} value={product_category.id} className="text-black">
                          {product_category.title}
                        </option>
                    ))}
              </select>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Promotion ID
                </label>
                <input
                  type="text"
                  name="promotion_id"
                  value={formData.promotion_id || ''}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>

          </div>
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/products/${ProductDetails.data.id}`)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProductMutation.isPending || loading}
              className="px-6 py-3 bg-[#11bb11] hover:bg-[#248324] disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {(updateProductMutation.isPending || loading) ? 'Updating...' : 'Update Product'}
            </button>
            <button type="button" onClick={handleDelete}>Delete</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductEdit