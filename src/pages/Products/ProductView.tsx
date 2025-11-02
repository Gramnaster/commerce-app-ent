import { NavLink, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import type { ProductDetailsResponse } from "./Products";

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const user = storeState.userState?.user;
  const id = params.id;
  
  console.log('ProductView loader - params.id:', id);
  console.log('ProductView loader - user:', user);

  const ProductDetailsQuery = {
    queryKey: ['ProductDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/products/${id}`, {
        headers: {
          Authorization: user.token,
        },
      });
      console.log('ProductView response.data:', response.data);
      return response.data;
    },
  };

  try {
    const ProductDetails = await queryClient.ensureQueryData(ProductDetailsQuery);
    console.log('ProductView ProductDetails:', ProductDetails);
    return { ProductDetails };
  } catch (error: any) {
    console.error('ProductView - Failed to load product:', error);
    toast.error('Failed to load product details');
    return redirect('/products');
  }
};

const ProductView = () => {
  const { ProductDetails } = useLoaderData() as {
    ProductDetails: ProductDetailsResponse;
  }
  const navigate = useNavigate();
  const { id, title, product_image_url, product_category, producer, description, price, promotion: { id: promotion_id}  } = ProductDetails.data
  
  console.log('ProductView component - ProductDetails:', ProductDetails);
  console.log('ProductView component - product_image_url:', product_image_url);
  console.log('ProductView component - promotion_id:', promotion_id);

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto place-items-center">
      <div className="mb-6 text-black">
          <button
          onClick={() => navigate(`/products`)}
          className="mb-4 flex items-center gap-2 hover:underline transition-colors text-black">
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
          Back to Products list
        </button>
      </div>

          <div className="w-[60%] bg-primary rounded-lg p-6 border border-gray-700">
            <div className="mb-4 pb-2 border-b border-white flex items-center justify-between gap-1">
              <h2 className="text-xl font-bold text-white">
                Product Information
              </h2>
              <NavLink to={`/products/edit/${id}`}><button className="btn bg-white border-primary text-l rounded-[8px] text-primary p-2 pt-1 pb-1 m-1 hover:border-white hover:bg-primary hover:text-white">Edit Product</button></NavLink>
            </div>
            <div>

              <div className="grid grid-cols-[1fr_1fr] grid-rows-1 gap-0">

                <div className="place-items-center place-content-center">
                  {product_image_url ? (
                    <img 
                      src={product_image_url} 
                      alt={title}
                      className="w-[250px] h-[250px] object-cover rounded-lg" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="250" height="250"%3E%3Crect fill="%23ddd" width="250" height="250"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-[250px] h-[250px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                      No Image Available
                    </div>
                  )}
                </div>

                <div className="place-items-center text-[black]">
                  <div className="px-6 py-3 rounded-2xl bg-white">
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Product Name:
                      </label>
                      <div>
                        {title}
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Description:
                      </label>
                      {description}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Price:
                      </label>
                      {price}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Product Category:
                      </label>
                      {product_category.title}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Producer:
                      </label>
                      {producer.title}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Promotion IDs:
                      </label>
                      {promotion_id || "No active promotions"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default ProductView