import { NavLink, redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';

interface ProductCategory {
  id: number;
  title: string;
}
interface Product {
  id: number;
  title: string;
  price: number;
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

  const PromotionViewQuery = {
    queryKey: ['Promotions', admin_user.id],
    queryFn: async () => {
      const response = await customFetch.get(`/promotions/${admin_user.id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const [ promotion ] = await Promise.all([
    queryClient.ensureQueryData(PromotionViewQuery)
    ])
    console.log(`Promotions Promotions`, promotion)
    return { promotion };
  } catch (error: any) {
    console.error('Failed to load Promotions:', error);
    toast.error('Failed to load Promotions list');
    return { promotions: [] };
  }
};

const PromotionView = () => {
  const { promotion } = useLoaderData() as {
   promotion: Promotion;
  }
  console.log(promotion)

  const { id, discount_amount, products_count, product_categories, products } = promotion.data

  return (
    <div>
      <div>ID: {id}</div>
      <div>Discount amount: {discount_amount}</div>
      <div>Products count: {products_count}</div>
      <div>Product Categories: {product_categories.length !== 0 ? product_categories.map((category: ProductCategory) => {
        return (
          <div key={category.id}></div>
        )
      }) : 'Currently not applied to any categories'}</div>
      <div>Products: {products.length !== 0 ? products.map((product: Product) => {
        const { id, title, price} = product
        return (
          <div key={id}>
            <div>Product Name: {title}</div>
            <div>Price: {price}</div>
          </div>
        )
      }) : 'Currently not applied to any categories' }</div>
      <div><NavLink to={`/promotions/edit/${id}`}>Edit Promotion</NavLink></div>
    </div>
  )
}

export default PromotionView