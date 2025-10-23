import { NavLink, redirect, useLoaderData } from "react-router-dom";
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

  const { id, title, product_image_url, product_category, producer, description, price, promotion_id } = ProductDetails.data

  console.log(`ProductView ProductDetails`, ProductDetails)
  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto place-items-center">
      {/* <div className="w-[70%]  grid grid-cols-[1fr_1fr] grid-rows-1 gap-0 h-full mx-auto border-[#BE493D] border-3 pt-5 pb-5 bg-[hsl(5,100%,98%)] rounded-2xl">
        <div className="flex flex-col items-center justify-center">
          <img src={ProductDetails.data.product_image_url} className="w-[250px] h-[250px]" />
        </div>
        <div className="text-white bg-[#BE493D] p-4 rounded-2xl w-[70%] place-content-between place-items-center">
          <div className="font-bold flex gap-2">Product Name: <div className="font-normal">{ProductDetails.data.title}</div></div>
          <div className="font-bold flex gap-2">Category: <div className="font-normal">{ProductDetails.data.product_category.title}</div></div>
          <div className="font-bold flex gap-2">Producer: <div className="font-normal">{ProductDetails.data.title}</div></div>
          <div className="font-bold flex gap-2">Product Description: <div className="font-normal">{ProductDetails.data.description}</div></div>
          <div className="font-bold flex gap-2">Price: <div className="font-normal">{ProductDetails.data.price}</div></div>
          <div className="font-bold flex gap-2">Promotion IDs: <div className="font-normal">{!ProductDetails.data.promotion_id ? "No active promotions": "WHAATTT"}</div></div>
          <div className="p-2 rounded-2xl "><NavLink to={`/products/edit/${ProductDetails.data.id}`}>Edit Product</NavLink></div>
        </div>
      </div> */}

          <div className="w-[60%] bg-[#BE493D] rounded-lg p-6 border border-gray-700">
            <div className=" mb-4 pb-2 border-b border-white flex items-center justify-start gap-1">
              <h2 className="text-xl font-bold text-white">
                Product Information
              </h2>
              <NavLink to={`/products/edit/${id}`} className={"text-l rounded-[3px] p-2 pt-1 pb-1 m-1 hover:bg-[hsl(5,100%,98%)] hover:text-[#BE493D]"}>Edit Product</NavLink>
            </div>
            <div>

              <div className="grid grid-cols-[1fr_1fr] grid-rows-1 gap-0">

                <div className="place-items-center place-content-center">
                  <img src={product_image_url} className="w-[250px] h-[250px]" />
                </div>

                <div className="place-items-center">
                  <div>
                    <div className="m-1">
                      <label className="block text-[#dfdfdf] text-l font-bold mb-2">
                        Product Name:
                      </label>
                      <div>
                        {title}
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-[#dfdfdf] text-l font-bold mb-2">
                        Description:
                      </label>
                      {description}
                    </div>
                    <div className="m-1">
                      <label className="block text-[#dfdfdf] text-l font-bold mb-2">
                        Price:
                      </label>
                      {price}
                    </div>
                    <div className="m-1">
                      <label className="block text-[#dfdfdf] text-l font-bold mb-2">
                        Product Category:
                      </label>
                      {product_category.title}
                    </div>
                    <div className="m-1">
                      <label className="block text-[#dfdfdf] text-l font-bold mb-2">
                        Producer:
                      </label>
                      {producer.title}
                    </div>
                    <div className="m-1">
                      <label className="block text-[#dfdfdf] text-l font-bold mb-2">
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