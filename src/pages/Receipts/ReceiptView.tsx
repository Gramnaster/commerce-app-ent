import { NavLink, redirect, useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import type { Product, User } from '../Products/Products';
import type { Address } from '../Admin/AdminEdit';

export interface Item {
  id: number;
  qty: string;
  subtotal: string;
  product: Product;
}

interface Order {
  id: number;
  cart_status: 'approved' | 'rejected' | 'pending';
  is_paid: boolean;
  total_cost: number;
  created_at: string;
  delivery_address: Address;
  items: Item[];
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
      return response.data;
    },
  };

  try {
    const ReceiptViewDetails = await queryClient.ensureQueryData(ReceiptViewQuery);
    return { ReceiptViewDetails };
  } catch (error: any) {
    console.error('Failed to load producer:', error);
    toast.error('Failed to load producer details');
    return redirect('/producers');
  }
};


const ReceiptView = () => {
  const { ReceiptViewDetails } = useLoaderData() as {
    ReceiptViewDetails: ReceiptShow;
  }
  const navigate = useNavigate();
  const { id, transaction_type, amount, description, user: { id: user_id, email }, order: { id: order_id, cart_status, is_paid, created_at, items }, items_count, total_quantity } = ReceiptViewDetails;
  console.log(`ReceiptView ReceiptViewDetails`, ReceiptViewDetails)
  console.log(`ReceiptView items`, items)

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
          <button
          onClick={() => navigate(`/receipts`)}
          className="mb-4 flex items-center gap-2 hover:underline transition-colors text-black">
          <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Receipts list
        </button>
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
                        {}
                      <div>
                        {items.map((item: Item) => {
                          const { id, qty, subtotal, product: {title, price}} = item;
                          return (
                            <div key={id}>
                              <div>Name: {title}</div>
                              <div>Quantity: {qty}</div>
                              <div>Price: {price}</div>
                              <div className='underline'>Subtotal: {subtotal}</div>
                            </div>
                          )
                        })}
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