import { redirect, useLoaderData, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface ProductCategory {
  id: number;
  title: string;
}

interface Producer {
  id: number;
  title: string;
}

interface ProducersResponse {
  data: Producer[];
}

interface ProductCategoriesResponse {
  data: ProductCategory[];
}

export interface User {
  id: number;
  email: string;
}

export const loader =
  (queryClient: any, store: any) =>
  async ({ params }: any) => {
    const storeState = store.getState();
    const admin_user = storeState.userState?.user;

    const id = params.id;

    const ProducersQuery = {
      queryKey: ['ProducersDetails', id],
      queryFn: async () => {
        const response = await customFetch.get(`/producers`, {
          headers: {
            Authorization: admin_user.token,
          },
        });
        console.log(`ProductEdit producers`, response.data);
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
        console.log(`ProductEdit product_categories`, response.data);
        return response.data;
      },
    };
    try {
      const [ProducersDetails, ProductCategoriesDetails] = await Promise.all([
        queryClient.ensureQueryData(ProducersQuery),
        queryClient.ensureQueryData(ProductCategoriesQuery),
      ]);
      console.log(`ProductEdit ProducersDetails`, ProducersDetails);
      console.log(
        `ProductEdit ProductCategoriesDetails`,
        ProductCategoriesDetails
      );
      return { ProducersDetails, ProductCategoriesDetails };
    } catch (error: any) {
      console.error('Failed to load product:', error);
      toast.error('Failed to load product details');
      return redirect('/products');
    }
  };

const ProductCreate = () => {
  const { ProducersDetails, ProductCategoriesDetails } = useLoaderData() as {
    ProducersDetails: ProducersResponse;
    ProductCategoriesDetails: ProductCategoriesResponse;
    userDetails: User;
  };
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.userState.user);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    final_price: '',
    discount_percentage: '',
    discount_amount_dollars: '',
    product_image_url: '',
    product_category_id: '',
    producer_id: '',
    promotion: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes('_id') ||
        name === 'price' ||
        name === 'discount_percentage'
          ? Number(value)
          : value,
    }));
  };

    // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log(`handleSubmit formData:`, formData);

    try {
      // Create FormData object for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('product[title]', formData.title);
      formDataToSend.append('product[description]', formData.description);
      formDataToSend.append('product[price]', formData.price.toString());
      formDataToSend.append('product[product_category_id]', formData.product_category_id.toString());
      formDataToSend.append('product[producer_id]', formData.producer_id.toString());
      
      // Add image file if selected (takes priority over URL)
      if (imageFile) {
        formDataToSend.append('product[product_image]', imageFile);
      } else if (formData.product_image_url) {
        // Fallback to URL if no file is uploaded
        formDataToSend.append('product[product_image_url]', formData.product_image_url);
      }

      const response = await customFetch.post('/products', formDataToSend, {
        headers: {
          Authorization: user?.token,
          // NOTE: Do NOT set 'Content-Type' - browser sets it automatically with boundary
        },
      });

      if (response.status) {
        console.log('Product created:', response.data);
        console.log(
          'Image URL from Cloudinary:',
          response.data.data.product_image_url
        );
      }
      toast.success('Product created successfully');
      navigate('/products');
      return response.data;
    } catch (error: any) {
      console.error('Failed to create product:', error);
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(5,100%,98%)] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-black">
          <button
            onClick={() => navigate('/products')}
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
            Back to Product List
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">
            Create Product Interface
          </h1>
          <p className="text-black">Create a Product</p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-[#BE493D] rounded-lg p-6">
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
                  className="w-full bg-[hsl(5,100%,98%)] border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                  className="w-full bg-[hsl(5,100%,98%)] border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-[hsl(5,100%,98%)] border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              {/* File input for image */}
              <div>
                <label>Product Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '200px' }}
                  />
                )}
              </div>
              {/* <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Product image URL
                </label>
                <input
                  type="text"
                  name="product_image_url"
                  value={formData.product_image_url}
                  onChange={handleInputChange}
                  className="w-full bg-[hsl(5,100%,98%)] border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div> */}
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
                  {ProducersDetails.data?.map((producer: Producer) => (
                    <option
                      key={producer.id}
                      value={producer.id}
                      className="text-black"
                    >
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
                  onChange={handleInputChange}
                >
                  <option value="">Select a category</option>
                  {ProductCategoriesDetails.data?.map(
                    (product_category: ProductCategory) => (
                      <option
                        key={product_category.id}
                        value={product_category.id}
                        className="text-black"
                      >
                        {product_category.title}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/products`)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#11bb11] hover:bg-[#248324] disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Creating Product...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreate;
