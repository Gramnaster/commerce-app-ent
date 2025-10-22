import { NavLink, redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';

interface ProductCategory {
  id: number;
  title: string;
}

interface Promotion {
  id: number;
  discount_amount: string;
  products_count: number;
  product_categories: ProductCategory[];
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  console.log(`Admins admin_user`, admin_user)
  const id = params.id;

  if (!admin_user || admin_user.admin_role !== 'management') {
    toast.warn('There must be something wrong. Please refresh the page.');
    return redirect('/');
  }

  const PromotionsQuery = {
    queryKey: ['Promotions', id],
    queryFn: async () => {
      const response = await customFetch.get('/promotions', {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const [ promotions ] = await Promise.all([
    queryClient.ensureQueryData(PromotionsQuery)
    ])
    console.log(`Promotions Promotions`, promotions)
    return { promotions };
  } catch (error: any) {
    console.error('Failed to load Promotions:', error);
    toast.error('Failed to load Promotions list');
    return { promotions: [] };
  }
};

const Promotions = () => {
  const { promotions } = useLoaderData() as {
   promotions: Promotion[];
  }

  return (
    <div>
      <NavLink to={`/promotions/create`}>Create Promotion</NavLink>
      <div>
        {promotions.data.map((promotion: any) => {
          const { id, discount_amount, products_count, product_categories } = promotion
          return (
            <div key={id} className='m-1 border-b-[1px] flex flex-col'>
              <div>Discount Amount: {discount_amount}</div>
              <div>Products Count: {products_count}</div>
              <div>Categories: {product_categories.length !== 0 ? product_categories.map((category: ProductCategory) => {
                return (
                  <div key={category.id}>
                    Category Name: {category.title}
                  </div>
                )
              }) : 'Currently not applied to any categories'}</div>
              <div><NavLink to={`/promotions/${id}`}>View Promotion details</NavLink></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Promotions