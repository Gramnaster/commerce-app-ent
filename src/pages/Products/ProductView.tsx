import { NavLink, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";

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

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const user = storeState.userState?.user;
  const id = params.id;

  const ProductDetailsQuery = {
    queryKey: ['ProductDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/products/${id}`, {
        headers: {
          Authorization: user.token,
        },
      });
      return response.data;
    },
  };
  console.log(`ProductEdit userDetailsQuery`, ProductDetailsQuery)

  try {
    const ProductDetails = await queryClient.ensureQueryData(ProductDetailsQuery);
    return { ProductDetails };
  } catch (error: any) {
    console.error('Failed to load product:', error);
    toast.error('Failed to load product details');
    return redirect('/products');
  }
};

const ProductView = () => {
  const { ProductDetails } = useLoaderData() as {
    ProductDetails: Product;
  }
  const navigate = useNavigate();
  const { id, title, product_image_url, product_category, producer, description, price, promotion_id } = ProductDetails.data

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

          <div className="w-[60%] bg-[#BE493D] rounded-lg p-6 border border-gray-700">
            <div className=" mb-4 pb-2 border-b border-white flex items-center justify-between gap-1">
              <h2 className="text-xl font-bold text-white">
                Product Information
              </h2>
              <NavLink to={`/products/edit/${id}`}><button className="btn bg-[hsl(5,100%,98%)] border-[#BE493D] text-l rounded-[8px] text-[#BE493D] p-2 pt-1 pb-1 m-1 hover:border-[hsl(5,100%,98%)] hover:bg-[#BE493D] hover:text-white">Edit Product</button></NavLink>
            </div>
            <div>

              <div className="grid grid-cols-[1fr_1fr] grid-rows-1 gap-0">

                <div className="place-items-center place-content-center">
                  <img src={product_image_url} className="w-[250px] h-[250px]" />
                </div>

                <div className="place-items-center text-[black]">
                  <div className=" px-6 py-3 rounded-2xl bg-[hsl(5,100%,98%)]">
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
                      {!promotion_id ? "No active promotions": "WHAATTT"}
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