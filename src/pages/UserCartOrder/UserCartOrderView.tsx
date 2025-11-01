import { redirect, useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import type { Item } from "../Receipts/ReceiptView";
import type { WareHouseOrder } from "../WarehouseOrders/WarehouseOrders";

interface Address {
  unit_no: string;
  street_no: string;
  barangay: string;
  city: string;
  region: string;
  zipcode: string;
}

export interface UserAddress {
  id: number;
  address: Address;
}

interface UserCartOrder {
  id: number;
  total_cost: string;
  is_paid: boolean;
  cart_status: 'approved' | 'rejected' | 'pending';
  social_program_id: number;
  user_address: UserAddress;
  items: Item[];
  warehouse_orders: WareHouseOrder[];
  warehouse_orders_count: number;
  created_at: string;
}

interface UserCartOrderResponse {
  data: UserCartOrder
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

  const UserCartOrderViewQuery = {
    queryKey: ["UserCartOrderViewDetails", id],
    queryFn: async () => {
      const response = await customFetch.get(`/user_cart_orders/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      console.log(`UserCartOrderViewQuery response.data: `, response.data)
      return response.data;
    },
  };

  try {
    const UserCartOrderViewDetails = await queryClient.ensureQueryData(UserCartOrderViewQuery);
    return { UserCartOrderViewDetails };
  } catch (error: any) {
    console.error('Failed to load cart order info:', error);
    toast.error('Failed to load cart order info');
    return redirect('/dashboard');
  }
};

const UserCartOrderView = () => {
  const { UserCartOrderViewDetails } = useLoaderData() as {
    UserCartOrderViewDetails: UserCartOrderResponse;
  }
  const navigate = useNavigate();
  const { id, total_cost, is_paid, social_program_id, user_address, items, warehouse_orders, warehouse_orders_count, created_at } = UserCartOrderViewDetails.data;
  const { unit_no, street_no, barangay, city, region, zipcode } = user_address.address


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
          onClick={() => navigate(`/dashboard`)}
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
          Back to Dashboard
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
                        Cart Order ID:
                      </label>
                      <div>
                        {id}
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Total Cost:
                      </label>
                      {total_cost}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Paid?
                      </label>
                      {is_paid ? 'Yes' : 'No'}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        social_program_id:
                      </label>
                      {id}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Social Program ID:
                      </label>
                      {social_program_id}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Address:
                      </label>
                      <div>
                        <div>Unit #: {unit_no}</div>
                        <div>Street #: {street_no}</div>
                        <div>Brgy: {barangay}</div>
                        <div>City: {city}</div>
                        <div>Region: {region}</div>
                        <div>Zipcode: {zipcode}</div>
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Items ordered:
                      </label>
                      <div>
                        { items && items.length > 0 ? items.map((item: Item) => {
                          const { id, qty, subtotal, product: {title, price}} = item;
                          return (
                            <div key={id}>
                              <div>Name: {title}</div>
                              <div>Quantity: {qty}</div>
                              <div>Price: {price}</div>
                              <div className='underline'>Subtotal: {subtotal}</div>
                            </div>
                          )
                        }) : 'No items'}
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Warehouse orders:
                      </label>
                      <div>
                        { warehouse_orders && warehouse_orders.length > 0 ? warehouse_orders.map((order: WareHouseOrder) => {
                          const { id, qty, product_status, created_at, inventory: { id: inventory_id, sku, product_id, qty_in_stock }, company_site:  {title, site_type }} = order;
                          return (
                            <div key={id}>
                              <div>Status: {product_status}</div>
                              <div>Ordered on: {formatDate(created_at)}</div>
                              <div>Quantity: {qty}</div>
                              <div>
                                <div>Inventory info:</div>
                                <div>
                                  <div>Inventory ID: {inventory_id}</div>
                                  <div>SKU: {sku}</div>
                                  <div>Product ID: {product_id}</div>
                                  <div>Quantity in stock: {qty_in_stock}</div>
                                </div>
                              </div>
                              <div>
                                <div>Company Site:</div>
                                <div>
                                  <div>Site: {title}</div>
                                  <div>Type: {site_type}</div>
                                </div>
                              </div>
                            </div>
                          )
                        }) : 'No warehouse orders'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  )
}

export default UserCartOrderView