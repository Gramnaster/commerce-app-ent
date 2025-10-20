import { useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { NavLink } from 'react-router-dom';

interface ProductCategory {
  id: number;
  title: string;
  products_count: number;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

  const ProductCategoriesQuery = {
    queryKey: ['ProductCategoriesDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/product_categories`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const [ProductCategories] = await Promise.all([
      queryClient.ensureQueryData(ProductCategoriesQuery)
    ]);
    return { ProductCategories };
  } catch (error: any) {
    console.error('Failed to load Categories data:', error);
    toast.error('Failed to load Categories data');
    return { allStocks: [] };
  }
};

const Categories = () => {
  const { ProductCategories } = useLoaderData() as {
    ProductCategories: ProductCategory[]
  };

  return (
    <div>
       <NavLink to={`/categories/create`}>Create category</NavLink>
      <div className='m-1 text-red-50'> Categories </div>
      {ProductCategories.data.map((category: ProductCategory) => {
        const { id, title, products_count } = category;
        return(
          <div key={id}>
            <div>Category Name: {title}</div>
            <div>Products Count: {products_count}</div>
            <NavLink to={`/categories/${id}`}>View category details</NavLink>
          </div>
        )
      })}
    </div>
  )
}

export default Categories