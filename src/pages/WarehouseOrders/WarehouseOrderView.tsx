import { NavLink, redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import type { WareHouseOrder } from './WarehouseOrders';
import { BackButton } from '../../components';

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;

  const id = params.id;

  const WarehouseOrderViewQuery = {
    queryKey: ['WarehouseOrderView', id],
    queryFn: async () => {
      const response = await customFetch.get(`/warehouse_orders/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const WarehouseOrderDetails = await queryClient.ensureQueryData(WarehouseOrderViewQuery);
    return { WarehouseOrderDetails };
  } catch (error: any) {
    console.error('Failed to load warehouse order:', error);
    toast.error('Failed to load warehouse order details');
    return redirect('/warehouse_orders');
  }
};

const WarehouseOrderView = () => {
  const { WarehouseOrderDetails } = useLoaderData() as {
    WarehouseOrderDetails: { data: WareHouseOrder };
  }
  const { id, qty, product_status, company_site: { id: company_site_id, title, site_type }, inventory: { id: inventory_id, sku, qty_in_stock, product_id }, user: { id: user_id, email}, user_cart_order_id, created_at } = WarehouseOrderDetails.data;


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
          <BackButton text="Back to Warehouse Order list" to="/warehouse_orders" />
        </div>

          <div className="w-[60%] bg-primary rounded-lg p-6 border border-gray-700">
            <div className=" mb-4 pb-2 border-b border-white flex items-center justify-between gap-1">
              <h2 className="text-xl font-bold text-white">
                Warehouse Order Information
              </h2>
              <NavLink to={`/warehouse_orders/edit/${id}`}>
                <button className="btn bg-white border-primary text-l rounded-[8px] text-primary p-2 pt-1 pb-1 m-1 hover:border-[hsl(5,100%,98%)] hover:bg-primary hover:text-white">
                  Edit Warehouse Order Info
                </button>
              </NavLink>
            </div>
            <div>
                <div className="place-items-center text-[black] w-full">
                  <div className=" px-6 py-3 rounded-2xl bg-white w-full">
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Warehouse Order ID:
                      </label>
                      <div>
                        {id}
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Quantity:
                      </label>
                      {qty}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Product Status:
                      </label>
                      {product_status}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        User Cart Order ID:
                      </label>
                      {user_cart_order_id}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Product Status:
                      </label>
                      {created_at}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Company Site details:
                      </label>
                      <div>
                        <div>Site ID: {company_site_id}</div>
                        <div>Site name: {title}</div>
                        <div>Site Type: {site_type}</div>
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Inventory details:
                      </label>
                      <div>
                        <div>Inventory ID: {inventory_id}</div>
                        <div>SKU: {sku}</div>
                        <div>Quantity in stock: {qty_in_stock}</div>
                        <div>Product ID: {product_id}</div>
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        User details:
                      </label>
                      <div>
                        <div>User ID: {user_id}</div>
                        <div>Email: {email}</div>
                      </div>
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

export default WarehouseOrderView