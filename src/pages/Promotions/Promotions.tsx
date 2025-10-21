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

export const loader = (queryClient: any, store: any) => async () => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  console.log(`Admins admin_user`, admin_user)

  if (!admin_user || admin_user.admin_role !== 'management') {
    toast.warn('There must be something wrong. Please refresh the page.');
    return redirect('/');
  }

  const PromotionsQuery = {
    queryKey: ['Promotions', admin_user.id],
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

const Admins = () => {
  const { promotions } = useLoaderData() as {
   promotions: Promotion[];
  }
  // const promotionsList = Object.values(promotions.data)

  return (
    <div>
      <NavLink to={`/admins/create`}>Create Admin</NavLink>
      <div>
        {promotions.data.map((promotion: any) => {
          const { id, discount_amount, products_count, product_categories } = promotion
          return (
            <div key={id} className='m-1 border-b-[1px] flex flex-col'>
              Discount Amount: {discount_amount}
              Products Count: {products_count}
              Categories: {product_categories}
              <NavLink to={`/promotions/${id}`}>View Promotion details</NavLink>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Admins