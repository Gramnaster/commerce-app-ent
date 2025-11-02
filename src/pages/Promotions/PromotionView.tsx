import { NavLink, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { BackButton } from '../../components';

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
  created_at: string;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  console.log(`Admins admin_user`, admin_user)
  const id = params.id;

  const PromotionViewQuery = {
    queryKey: ['Promotions', id],
    queryFn: async () => {
      const response = await customFetch.get(`/promotions/${id}`, {
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
   promotion: { data: Promotion };
  }

  const { id, discount_amount, products_count, product_categories, products, created_at } = promotion.data

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto place-items-center ">
        <div className="mb-6 text-black">
          <BackButton text="Back to Promotions list" to="/promotions" />
        </div>

          <div className="w-[60%] bg-primary rounded-lg p-6 border border-gray-700">
            <div className=" mb-4 pb-2 border-b border-white flex items-center justify-between gap-1">
              <h2 className="text-xl font-bold text-white">
                Promotion Information
              </h2>
              <NavLink to={`/promotions/edit/${id}`}>
                <button className="btn bg-white border-primary text-l rounded-[8px] text-primary p-2 pt-1 pb-1 m-1 hover:border-[hsl(5,100%,98%)] hover:bg-primary hover:text-white">
                  Edit Promotion Info
                </button>
              </NavLink>
            </div>
            <div>
                <div className="place-items-center text-[black] w-full">
                  <div className=" px-6 py-3 rounded-2xl bg-white w-full">
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Promotion ID:
                      </label>
                      <div>
                        {id}
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Discount Amount:
                      </label>
                      {discount_amount}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Products Count:
                      </label>
                      {products_count}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Product Categories:
                      </label>
                      {product_categories.length !== 0 ? product_categories.map((category: ProductCategory) => {
                        const { id, title } = category
                        return (
                          <div key={id}  className='pl-2'>
                            <div><div className='font-medium'>Category Name:</div> {title}</div>
                          </div>
                        )
                      }) : 'Currently not applied to any categories'}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Products:
                      </label>
                      {products.length !== 0 ? products.map((product: Product) => {
                        const { id, title, price} = product
                        return (
                          <div key={id} className='pl-2'>
                            <div><div className='font-medium'>Product Name:</div> {title}</div>
                            <div><div className='font-medium'>Price:</div> {price}</div>
                          </div>
                        )
                      }) : 'Currently not applied to any products' }
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Creation/Addition Date:
                      </label>
                      {formatDate(created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  )
}

export default PromotionView