import { redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import type { Product, User } from '../Products/Products';
import type { Address } from '../Admin/AdminEdit';
import type { WareHouseOrder } from '../WarehouseOrders/WarehouseOrders';
import { BackButton } from '../../components';

export interface Item {
  id: number;
  qty: string;
  subtotal: string;
  product: Product;
  product_title: string;
  price: string;
  warehouse?: {
    id: number;
    title: string;
  };
  product_status?: string;
}

interface Order {
  id: number;
  cart_status: 'approved' | 'rejected' | 'pending';
  is_paid: boolean;
  total_cost: number;
  created_at: string;
  delivery_address: Address;
  items?: Item[]; // Keep for backward compatibility
  warehouse_orders?: WareHouseOrder[]; // New structure
}

interface ReceiptShow {
  id: number;
  transaction_type: 'purchase' | 'deposit' | 'withdraw';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  user: User;
  order: Order;
  items_count: number;
  total_quantity: string;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

  const ReceiptViewQuery = {
    queryKey: ["ReceiptViewDetails", id],
    queryFn: async () => {
      const response = await customFetch.get(`/receipts/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      console.log(`ReceiptViewQuery response.data`, response.data)
      return response.data;
    },
  };

  try {
    const ReceiptViewDetails = await queryClient.ensureQueryData(ReceiptViewQuery);
    return { ReceiptViewDetails };
  } catch (error: any) {
    console.error('Failed to load receipt:', error);
    toast.error('Failed to load receipt details');
    return redirect('/receipts');
  }
};


const ReceiptView = () => {
  const { ReceiptViewDetails } = useLoaderData() as {
    ReceiptViewDetails: ReceiptShow;
  }
  const { id, transaction_type, amount, description, user, order } = ReceiptViewDetails;

  const user_id = user?.id ?? 'N/A';
  const email = user?.email ?? 'Unknown';
  const order_id = order?.id ?? 'N/A';
  const cart_status = order?.cart_status ?? 'N/A';
  const is_paid = order?.is_paid ?? false;
  const created_at = order?.created_at ?? '';
  
  // Use warehouse_orders (new structure) or fallback to items (old structure)
  const warehouse_orders = order?.warehouse_orders ?? [];
  const legacy_items = order?.items ?? [];

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
          <BackButton text="Back to Receipts list" to="/receipts" />
        </div>

          <div className="w-[60%] bg-primary rounded-lg p-6 border border-gray-700">
            <div className=" mb-4 pb-2 border-b border-white flex items-center justify-between gap-1">
              <h2 className="text-xl font-bold text-white">
                Receipt Information
              </h2>
            </div>
            <div>
                <div className="place-items-center text-[black] w-full">
                  <div className=" px-6 py-3 rounded-2xl bg-white w-full">
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Receipt ID:
                      </label>
                      <div>
                        {id}
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Transaction Type:
                      </label>
                      {transaction_type}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Total Cost:
                      </label>
                      {amount}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Description:
                      </label>
                      {description}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        User Details:
                      </label>
                      <div>
                        <div>User ID: {user_id}</div>
                        <div>User email:{email}</div>
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Cart Info:
                      </label>
                      <div>
                        <div>User ID: {order_id}</div>
                        <div>Status: {cart_status}</div>
                        <div>Paid?: {is_paid ? 'Yes' : 'No'}</div>
                        <div>Creation date: {formatDate(created_at)}</div>
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Items ordered:
                      </label>
                      <div>
                        {/* New structure: warehouse_orders */}
                        {warehouse_orders.length > 0 ? (
                          warehouse_orders.map((order: WareHouseOrder) => {
                            const { id, qty, subtotal, inventory: { product }, company_site, product_status } = order;
                            return (
                              <div key={id} className="mb-3 pb-2 border-b border-gray-300">
                                <div>Name: {product.title}</div>
                                <div>Quantity: {qty}</div>
                                <div>Price: {product.price}</div>
                                {subtotal && <div className='underline'>Subtotal: {subtotal}</div>}
                                <div className="text-sm text-gray-600">
                                  <div>Warehouse: {company_site.title}</div>
                                  <div>Status: {product_status}</div>
                                </div>
                              </div>
                            )
                          })
                        ) : legacy_items.length > 0 ? (
                          /* Fallback to old structure if warehouse_orders not available */
                          legacy_items.map((item: Item) => {
                            const { id, qty, subtotal, product: {title, price}} = item;
                            return (
                              <div key={id}>
                                <div>Name: {title}</div>
                                <div>Quantity: {qty}</div>
                                <div>Price: {price}</div>
                                <div className='underline'>Subtotal: {subtotal}</div>
                              </div>
                            )
                          })
                        ) : (
                          <div>No items</div>
                        )}
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

export default ReceiptView