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

interface Producer {
  id: number;
  title: string;
}

interface Product {
  id: number;
  title: string;
  product_category: ProductCategory;
  producer: Producer;
  description: string;
  price: number;
  promotion_id: boolean;
  product_image_url: string;
}

export interface User {
  id: number;
  email: string;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;

  const id = params.id;

  const ProductDetailsQuery = {
    queryKey: ['ProductDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/products/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      console.log(`ProductEdit ProductDetails`, response.data)
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
      console.log(`ProductEdit producers`, response.data)
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
      console.log(`ProductEdit product_categories`, response.data)
      return response.data;
    },
  };

  try {
    const [ProductDetails, ProducersDetails, ProductCategoriesDetails] = await  Promise.all([
      queryClient.ensureQueryData(ProductDetailsQuery),
      queryClient.ensureQueryData(ProducersQuery),
      queryClient.ensureQueryData(ProductCategoriesQuery)
    ])
    console.log(`ProductEdit ProducersDetails`, ProducersDetails)
    console.log(`ProductEdit ProductCategoriesDetails`, ProductCategoriesDetails)
    return { ProductDetails, ProducersDetails, ProductCategoriesDetails };
  } catch (error: any) {
    console.error('Failed to load product:', error);
    toast.error('Failed to load product details');
    return redirect('/products');
  }
};

const ProductView = () => {
  const { ProductDetails, userDetails, ProducersDetails, ProductCategoriesDetails } = useLoaderData() as {
    ProductDetails: Product;
    ProducersDetails: Producer;
    ProductCategoriesDetails: ProductCategory;
    userDetails: User;
  }
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {id, title, description, price, product_image_url, product_category, final_price, discount_percentage, discount_amount_dollars, producer, promotion} = ProductDetails.data

  const user = useSelector((state: RootState) => state.userState.user);

  const [formData, setFormData] = useState({
    id: id,
    title: title,
    description: description,
    price: price,
    final_price: final_price,
    discount_percentage: discount_percentage,
    discount_amount_dollars: discount_amount_dollars,
    product_image_url: product_image_url,
    product_category: {
      id: product_category.id,
      title: product_category.title
    },
    producer: {
      id: producer.id,
      title: producer.title,
      address: {
        id: producer.address.id, 
        unit_no: producer.address.unit_no, 
        street_no: producer.address.street_no,
        city: producer.address.city,
        zipcode: producer.address.zipcode,
        country: producer.address.country
      }
    },
    promotion: promotion
  })

  const updateProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await customFetch.patch(
        `/products/${ProductDetails.data.id}`,
        {
          product: productData,
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
      toast.success('Product Details updated successfully');
      queryClient.invalidateQueries({ queryKey: ['products', ProductDetails.data.id] });
      navigate(`/products/${ProductDetails.data.id}`);
    },
    onError: (error: any) => {
      console.error('Update failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to update user';
      toast.error(errorMessage);
    },
  });

  console.log(`ProductView ProductDetails`, ProductDetails)
  
  const NESTED_FIELDS: Record<string, string> = {
    product_category_id: "product_category",
    producer_id: "producer",
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const parentKey = NESTED_FIELDS[name];

    setFormData((prev) => {
      if (parentKey) {
        return {
          ...prev,
          [parentKey]: {
            ...prev[parentKey],
            id: Number(value),
          },
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`handleSubmit formData:`, formData)
    // Create the payload matching the API format
    const payload = {
      ...formData,
    };
    console.log(`handleSubmit payload:`, payload)
    updateProductMutation.mutate(payload);
  };

  const handleDelete = async (e: React.FormEvent) => {
  if (!confirm("Are you sure you want to delete this product?")) return;
  
    console.log(`handleSubmit formData:`, formData)
    navigate(`/products`)
    // Create the payload matching the API format
   try {
      const response = await customFetch.delete(`/products/${ProductDetails.data.id}`,
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      redirect('/products');
      toast.success('Product deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('Failed to load product:', error);
      toast.error('Failed to load product details');
      return redirect('/products');
    }
  };

  return (
<div className="min-h-screen bg-[#161420] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
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
            Back to Traders List
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Edit Product Info</h1>
          <p className="text-gray-400">
            Editing {ProductDetails.data.title || ''}{' '}
          </p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-700">
              Product Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  description
                </label>
                <input
                  type="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Price
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Final Price
                </label>
                <input
                  type="text"
                  name="final_price"
                  value={formData.final_price}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Discount percent
                </label>
                <input
                  type="number"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Discount amount in dollars
                </label>
                <input
                  type="text"
                  name="discount_amount_dollars"
                  value={formData.discount_amount_dollars}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Product image URL
                </label>
                <input
                  type="text"
                  name="product_image_url"
                  value={formData.product_image_url}
                  onChange={handleInputChange}
                  className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Producers
                </label>
                <select
                  name="producer"
                  value={formData.producer?.id || ''}
                  onChange={handleInputChange}>
                    <option value="">Select a producer</option>
                      {ProducersDetails.data?.map((producer: any) => (
                        <option key={producer.id} value={producer.id}>
                          {producer.title}
                        </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Product Category
                </label>
                <select
                  name="product_category"
                  value={formData.product_category?.id || ''}
                  onChange={handleInputChange}>
                    <option value="">Select a category</option>
                      {ProductCategoriesDetails.data?.map((producer: any) => (
                        <option key={product_category.id} value={product_category.id}>
                          {product_category.title}
                        </option>
                    ))}
              </select>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/products/edit/${ProductDetails.data.id}`)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProductMutation.isPending}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
            </button>
            <button type="button" onClick={handleDelete}>Delete</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductView