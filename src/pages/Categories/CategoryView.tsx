import { NavLink, redirect, useLoaderData } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";

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
    return { CategoryDetails };
  } catch (error: any) {
    console.error('Failed to load category details:', error);
    toast.error('Failed to load category details');
    return redirect('/products');
  }
};

const CategoryView = () => {
  const { CategoryDetails } = useLoaderData() as {
    CategoryDetails: ProductCategory;
  }
  const { id, title, products_count } = CategoryDetails.data;

  console.log(`ProducerView ProducerDetails`, CategoryDetails.data)
  return (
    <div>
      <div>
        <div>Category Name: {title}</div>
        <div>Products Count: {products_count}</div>
      </div>
      <NavLink to={`/categories/edit/${id}`}>Edit Category name</NavLink>
    </div>
  )
}

export default CategoryView