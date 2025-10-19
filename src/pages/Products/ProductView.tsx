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

  console.log(`ProductView ProductDetails`, ProductDetails)
  return (
    <div>
      <div>
        <div>Product Name: {ProductDetails.data.title}</div>
        <img src={ProductDetails.data.product_image_url} className="w-[100px]" />
        <div>Category: {ProductDetails.data.product_category.title}</div>
        <div>Producer: {ProductDetails.data.title}</div>
        <div>Product Description:{ProductDetails.data.description}</div>
        <div>Price: {ProductDetails.data.price}</div>
        <div>{!ProductDetails.data.promotion_id ? "No active promotions": "WHAATTT"}</div>
      </div>
      <NavLink to={`/products/edit/${ProductDetails.data.id}`}>Edit Product</NavLink>
    </div>
  )
}

export default ProductView