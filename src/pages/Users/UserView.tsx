import { NavLink, redirect, useLoaderData } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import type { Phone, Receipt, User } from "./Users";
import { useState } from "react";
import type { UserCartOrder } from "../Home/Dashboard";
import { PaginationControls, BackButton } from "../../components";

interface UserViewResponse {
  data: User;
}


export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;

  const id = params.id;

  const UserViewQuery = {
    queryKey: ['UserView', id],
    queryFn: async () => {
      const response = await customFetch.get(`/users/${id}/full_details`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const UserViewDetails = await queryClient.ensureQueryData(UserViewQuery);
    return { UserViewDetails };
  } catch (error: any) {
    console.error('Failed to load user details:', error);
    toast.error('Failed to load user details');
    return redirect('/users');
  }
};

const UserView = () => {
  const { UserViewDetails } = useLoaderData() as {
    UserViewDetails: UserViewResponse;
  }
  const {
    email,
    is_verified,
    confirmed_at,
    created_at,
    user_detail: {
      first_name,
      middle_name,
      last_name,
      dob
    },
    phones,
    receipts,
    user_cart_orders
  } = UserViewDetails.data;

  const [activeTab, setActiveTab] = useState<'receipts' | 'orders'>('receipts');
  const [searchWord, setSearchWord] = useState('');
  const [cartOrderData, setCartOrderData] = useState<UserCartOrder[]>(user_cart_orders);
  const [userReceiptsData, setUserReceiptsData] = useState<Receipt[]>(receipts);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, per_page: 20 });
  const [loading, setLoading] = useState(false);
  console.log(`userReceiptsData`, userReceiptsData)
  console.log(`cartOrderData`, cartOrderData)

  const handleUserCartOrderPagination = async (page: number | null) => {
    if (!page) return;
    setLoading(true)
    
    try {
      const response = await customFetch.get(`/user_cart_orders?page=${page}&per_page=${pagination.per_page || 20}`);
      const data = response.data;
      console.log('Products handlePagination - Response:', data);
      setCartOrderData(data.data);
      setPagination(data.pagination);
      setLoading(false);
    }
    catch (error: any) {
      console.error('Products handlePagination - Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
    }
  }
  
  const handleReceiptPagination = async (page: number | null) => {
    if (!page) return;
    setLoading(true)
    
    try {
      const response = await customFetch.get(`/receipts?page=${page}&per_page=${pagination.per_page || 20}`);
      const data = response.data;
      console.log('Receipts handlePagination - Response:', data);
      setUserReceiptsData(data.data);
      setPagination(data.pagination);
      setLoading(false);
    }
    catch (error: any) {
      console.error('Receipts handlePagination - Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
    }
  }
  // const { data: cartOrders = [] } = useQuery({
  //   queryKey: ['cartOrders', user?.id],
  //   queryFn: async () => {
  //     const response = await customFetch.get('/user_cart_orders', {
  //       headers: {
  //         Authorization: user?.token,
  //       },
  //     });
  //     return response.data;
  //   },
  //   initialData: initialCartOrders,
  //   refetchOnWindowFocus: false,
  // });

  // const { data: receiptData = [] } = useQuery({
  //   queryKey: ['receipts', user?.id],
  //   queryFn: async () => {
  //     const response = await customFetch.get('/receipts', {
  //       headers: {
  //         Authorization: user?.token,
  //       },
  //     });
  //     return response.data;
  //   },
  //   initialData: initialCartOrders,
  //   refetchOnWindowFocus: false,
  // });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };
  console.log(`activeTab`, activeTab)

  const filteredOrders = activeTab !== 'receipts' && cartOrderData !== undefined ? cartOrderData
      .filter((order: UserCartOrder) => {
        const matchesSearch =
        order.cart_status.toLowerCase().includes(searchWord.toLowerCase()) ||
        order.is_paid.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        order.id.toString().toLowerCase().includes(searchWord.toLowerCase());

      return matchesSearch;
    })
    .sort(
      (a: UserCartOrder, b: UserCartOrder) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) : [] ;

    const filteredReceipts = activeTab !== 'orders' && userReceiptsData !== undefined ? userReceiptsData
      .filter((receipt: Receipt) => {
        const matchesSearch =
          receipt.id.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
          receipt.transaction_type.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
          receipt.amount.toLowerCase().includes(searchWord.toLowerCase()) ||
          receipt.balance_before.toLowerCase().includes(searchWord.toLowerCase()) ||
          receipt.balance_after.toLowerCase().includes(searchWord.toLowerCase()) ||
          receipt.description.toLowerCase().includes(searchWord.toLowerCase()) ||
          receipt.user_cart_order_id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
          receipt.created_at.toLowerCase().includes(searchWord.toLowerCase());
  

        return matchesSearch;
      })
      .sort(
        (a: Receipt, b: Receipt) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) : [];

      console.log(`filteredOrders`, filteredOrders)
      console.log(`filteredReceipts`, filteredReceipts)
  
    const { current_page, total_pages } = pagination;

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto place-items-center">
        <BackButton text="Back to User list" />
        <div className="w-[60%] bg-primary rounded-lg p-6 border border-gray-700">
          <div className=" mb-4 pb-2 border-b border-white flex items-center justify-between gap-1">
            <h2 className="text-xl font-bold text-white">User Information</h2>
            {/* <NavLink to={`/categories/edit/${id}`}>
                  <button className="btn bg-white border-primary text-l rounded-[8px] text-primary p-2 pt-1 pb-1 m-1 hover:border-[hsl(5,100%,98%)] hover:bg-primary hover:text-white">
                    Edit Category Info
                  </button>
                </NavLink> */}
          </div>
          <div>
            <div className="place-items-center text-[black] w-full">
              <div className=" px-6 py-3 rounded-2xl bg-white w-full">
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">
                    User Name:
                  </label>
                  <div>
                    {first_name} {middle_name || null} {last_name}
                  </div>
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">
                    Date of birth:
                  </label>
                  <div>{dob}</div>
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">Email:</label>
                  {email}
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">
                    Is Verified?
                  </label>
                  {is_verified ? 'Yes' : 'No'}
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">
                    Account confirmed?
                  </label>
                  {confirmed_at
                    ? `Yes ${confirmed_at}`
                    : 'Account not confirmed'}
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">
                    Creation/Addition Date:
                  </label>
                  {formatDate(created_at)}
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">Phones:</label>
                  <div>
                    {phones.map((phone: Phone) => {
                      const { phone_no, phone_type } = phone;
                      return (
                        <div>
                          <div>{phone_no}</div>
                          <div>{phone_type}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">
                    Addresses:
                  </label>
                  <div>
                    {/* {user_addresses && user_addresses.length > 0 ? user_addresses.map((address: Address)=> {
                            const { unit_no, street_no, address_line1, address_line2, city, region, country } = address.address
                            return (
                              <div>
                          <div>Unit #: {unit_no}</div>
                          <div>Street #: {street_no}</div>
                          <div>Address Line 1: {address_line1}</div>
                          <div>Address Line 2: {address_line2}</div>
                          <div>City: {city}</div>
                          <div>Region: {region}</div>
                          <div>Country: {country}</div>
                              </div>
                            )
                          }) : 'No address'} */}
                  </div>
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">
                    Receipts:
                  </label>
                  <div>
                    {/* {receipts.map((receipt: Receipt)=> {
                            const { id, transaction_type, amount, balance_before, balance_after, description, user_cart_order_id, created_at } = receipt
                            return (
                              <div>
                                <div>ID: {id}</div>
                                <div>Transaction Type: {transaction_type}</div>
                                <div>Amount: {amount}</div>
                                <div>Balance before: {balance_before}</div>
                                <div>Balance after: {balance_after}</div>
                                <div>Description: {description}</div>
                                <div>User Cart Order ID: {user_cart_order_id ?? null}</div>
                                <div>Creation Date: {formatDate(created_at)}</div>
                              </div>
                            )
                          })} */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex gap-8 mb-6 mt-6 border-b border-[#172349]">
            <button
              onClick={() => setActiveTab('receipts')}
              className={`pb-4 px-2 font-semibold text-lg transition-colors ${
                activeTab === 'receipts'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-[#615b5a] hover:text-[#615b5a]'
              }`}
            >
              Receipts
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 px-2 font-semibold text-lg transition-colors ${
                activeTab === 'orders'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-[#745f5c] hover:text-[#745f5c'
              }`}
            >
              Orders
            </button>
          </div>

          {/* Search and Filter */}
          {/* Conditional Content based on active tab */}
          {
            <>
              {/* Search and Filter */}
              <div className="bg-primary rounded-lg p-6 border border-primary mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search by Name or Date"
                      value={searchWord}
                      onChange={(e) => setSearchWord(e.target.value)}
                      className="w-full bg-white border border-primary rounded-lg p-3 pl-10 text-black placeholder-[#666666]"
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <button className="p-3 bg-primary hover:bg-[#03529c] border border-[white] rounded-lg hover:cursor-pointer transition-colors">
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
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Traders Table */}
              <div className="bg-transparent rounded-lg border border-primary overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary">
                      <tr className="border-b border-primary">
                        <th className="text-left p-4 text-s font-normal text-white">
                          ID
                        </th>
                        <th className="text-center p-4 text-s font-normal text-white">
                          {activeTab === 'receipts'
                            ? 'Transaction Type'
                            : 'Total Cost'}
                        </th>
                        <th className="text-center p-4 text-s font-normal text-white">
                          {activeTab === 'receipts' ? 'Amount' : 'Cart Status'}
                        </th>
                        <th className="text-center p-4 text-s font-normal text-white">
                          {activeTab === 'receipts'
                            ? 'Balance Before & After'
                            : 'Paid?'}
                        </th>
                        <th
                          className={`p-4 text-s font-extralight text-white text-center`}
                        >
                          {activeTab === 'receipts'
                            ? 'Description'
                            : 'Social program'}
                        </th>
                        <th className="text-center p-4 text-s font-extralight text-white">
                          Admin Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr className="border-b text-[#000000] border-primary hover:bg-[hsl(0,0%,87%)] transition-colors">
                          <td className="p-8 text-center" colSpan={10}>
                            <div className="h-screen flex items-center justify-center">
                              <span className="loading loading-ring loading-lg text-black">
                                LOADING
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : activeTab === 'orders' &&
                        filteredOrders.length > 0 ? (
                        filteredOrders.map(
                          (order: UserCartOrder, index: number) => (
                            <tr
                              key={order.id}
                              className={`border-b text-[#000000] border-primary hover:bg-white transition-colors ${
                                index % 2 === 0
                                  ? 'bg-transparent'
                                  : 'bg-[#f3f3f3]'
                              }`}
                            >
                              <td className="p-4 text-m text-left">
                                {order.id}
                              </td>
                              <td className="p-4 text-m text-center">
                                {order.total_cost}
                              </td>
                              <td
                                className={`p-4 text-m text-center ${order.cart_status === 'approved' ? 'text-green-700' : order.cart_status === 'rejected' ? 'text-red-800' : 'text-orange-500'}`}
                              >
                                {order.cart_status}
                              </td>
                              <td
                                className={`p-4 text-m text-center ${order.is_paid ? 'text-green-700' : 'text-red-800'}`}
                              >
                                {order.is_paid ? 'Yes' : 'No'}
                              </td>
                              <td
                                className={`p-4 text-m  ${activeTab === 'orders' ? 'text-center' : 'text-right'}`}
                              >
                                {order.social_program?.title || 'Not Available'}
                              </td>
                              <td
                                className={`p-4 text-m  ${activeTab === 'orders' ? 'text-center' : 'text-right'} hover:text-primary hover:underline`}
                              >
                                <NavLink to={`/orders/${order.id}`}>
                                  View User Cart Order Info
                                </NavLink>
                              </td>
                            </tr>
                          )
                        )
                      ) : activeTab === 'receipts' &&
                        filteredReceipts.length > 0 ? (
                        filteredReceipts.map(
                          (receipt: Receipt, index: number) => (
                            <tr
                              key={receipt.id}
                              className={`border-b text-[#000000] border-primary hover:bg-white transition-colors ${
                                index % 2 === 0
                                  ? 'bg-transparent'
                                  : 'bg-[#f3f3f3]'
                              }`}
                            >
                              <td className="p-4 text-m text-left">
                                {receipt.id}
                              </td>
                              <td className="p-4 text-m text-center">
                                {receipt.transaction_type}
                              </td>
                              <td className="p-4 text-m text-center">
                                {receipt.amount}
                              </td>
                              <td className="p-4 text-m text-center">
                                {receipt.balance_before} -{' '}
                                {receipt.balance_after}
                              </td>
                              <td
                                className={`p-4 text-m  ${activeTab === 'receipts' ? 'text-center' : 'text-right'}`}
                              >
                                {receipt.description}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center text-m justify-center gap-2 hover:text-primary hover:underline">
                                  <NavLink to={`/receipts/${receipt.id}`}>
                                    View Receipt Info
                                  </NavLink>
                                </div>
                              </td>
                            </tr>
                          )
                        )
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-black text-m bg-transparent"
                          >
                            No {activeTab} orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          }
        </div>
      </div>
      {activeTab === 'receipts' ? (
        <PaginationControls
          currentPage={current_page || 1}
          totalPages={total_pages || 1}
          onPageChange={(page) => handleReceiptPagination(page)}
        />
      ) : (
        <PaginationControls
          currentPage={current_page || 1}
          totalPages={total_pages || 1}
          onPageChange={(page) => handleUserCartOrderPagination(page)}
        />
      )}
    </div>
  );
}

export default UserView