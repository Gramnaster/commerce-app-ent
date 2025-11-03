import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import { NavLink, redirect, useLoaderData } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RootState } from "../../store";
import type { Pagination, Address } from "../Products/Products";
import type { WareHouseOrder } from "../WarehouseOrders/WarehouseOrders";
import type { SocialProgram } from "../Users/Users";
import { SearchBar, PaginationControls } from "../../components";

export interface UserCartOrder {
  id: number;
  total_cost: string;
  is_paid: boolean;
  cart_status: "pending" | "approved" | "rejected";
  user_address: Address;
  items_count: number;
  created_at: string;
  warehouse_orders: WareHouseOrder;
  social_program: SocialProgram;
}

export interface UserCartOrderResponse {
  data: UserCartOrder[];
  pagination: Pagination;
}

export const loader = (queryClient: any, store: any) => async () => {
  const storeState = store.getState();
  const user = storeState.userState?.user;

  if (!user || user.admin_role !== 'management' &&  user.admin_role !== 'warehouse') {
    toast.warn('There must be something wrong. Please refresh the page.');
    return redirect('/dashboard');
  }

  const userCartOrdersQuery = {
    queryKey: ['UserCartOrders', user.id],
    queryFn: async () => {
      const response = await customFetch.get('/user_cart_orders', {
        headers: {
          Authorization: user.token,
        },
      });
    console.log(`Dashboard response.data`, response.data)
      return response.data;
    },
  };

  try {
    const userCartOrders = await queryClient.ensureQueryData(userCartOrdersQuery);
    console.log(`Dashboard userCartOrders`, userCartOrders)
    return { userCartOrders };
  } catch (error: any) {
    console.error('Failed to load cart orders:', error);
    toast.error('Failed to load cart orders list');
    return { userCartOrders: [] };
  }
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'create'>('pending');
  const [searchWord, setSearchWord] = useState('');

  const { userCartOrders: initialCartOrders } = useLoaderData() as {
    userCartOrders: UserCartOrderResponse;
  };
  const user = useSelector((state: RootState) => state.userState.user);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [cartOrderData, setCartOrderData] = useState(initialCartOrders);

  const handlePagination = async (page: number | null) => {
    if (!page) return;
    setLoading(true)
    
    try {
      const response = await customFetch.get(`/user_cart_orders?page=${page}&per_page=${cartOrderData.pagination.per_page || 20}`);
      const data = response.data;
      console.log('Products handlePagination - Response:', data);
      setCartOrderData(data);
      setLoading(false);
    }
    catch (error: any) {
      console.error('Products handlePagination - Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
    }
  }

  const { data: _cartOrders = [] } = useQuery({
    queryKey: ['cartOrders', user?.id],
    queryFn: async () => {
      const response = await customFetch.get('/user_cart_orders', {
        headers: {
          Authorization: user?.token,
        },
      });
      return response.data;
    },
    initialData: initialCartOrders,
    refetchOnWindowFocus: false,
  });

  const approveMutation = useMutation({
    mutationFn: async (cartOrderId: number) => {
      const response = await customFetch.patch(
        `/user_cart_orders/${cartOrderId}/approve`,
        {
          cart_status: 'approved',
        },
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Cart order approved successfully');
      queryClient.invalidateQueries({ queryKey: ['cartOrder', user?.id] });
    },
    onError: (error: any) => {
      console.error('Approve failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to approve order';
      toast.error(errorMessage);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (cartOrderId: number) => {
      const response = await customFetch.patch(
        `/user_cart_orders/${cartOrderId}`,
        {
          cart_status: 'rejected',
        },
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Cart Order rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['cartOrder', user?.id] });
    },
    onError: (error: any) => {
      console.error('Reject failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to reject order';
      toast.error(errorMessage);
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleApprove = (userId: number) => {
    approveMutation.mutate(userId);
  };

  const handleReject = (userId: number) => {
    rejectMutation.mutate(userId);
  };
  // console.log(`cartOrders`, cartOrders)
    
  const filteredOrders = activeTab !== 'create' && cartOrderData.data !== undefined ? cartOrderData.data
    .filter((order: UserCartOrder) => {
      const matchesSearch =
        order.cart_status.toLowerCase().includes(searchWord.toLowerCase()) ||
        order.is_paid.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        order.id.toString().toLowerCase().includes(searchWord.toLowerCase());

      if (activeTab === 'pending') {
        return matchesSearch && order.cart_status === 'pending';
      } else if (activeTab === 'approved') {
        return matchesSearch && order.cart_status === 'approved';
      } else if (activeTab === 'rejected') {
        return matchesSearch && order.cart_status === 'rejected';
      }
      return false;
    })
    .sort(
      (a: UserCartOrder, b: UserCartOrder) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) : [];

    const { current_page, total_pages } = cartOrderData.pagination || {
      current_page: 1,
      per_page: 20,
      total_pages: 1,
      next_page: null,
      previous_page: null
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-8 mb-6 border-b border-[#172349]">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-4 px-2 font-semibold text-lg transition-colors ${
              activeTab === 'pending'
                ? 'text-primary border-b-2 border-primary'
                : 'text-[#615b5a] hover:text-[#615b5a]'
            }`}
          >
            Pending orders
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`pb-4 px-2 font-semibold text-lg transition-colors ${
              activeTab === 'approved'
                ? 'text-primary border-b-2 border-primary'
                : 'text-[#745f5c] hover:text-[#745f5c'
            }`}
          >
            Approved Orders
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`pb-4 px-2 font-semibold text-lg transition-colors ${
              activeTab === 'rejected'
                ? 'text-primary border-b-2 border-primary'
                : 'text-[#745f5c] hover:text-[#745f5c]'
            }`}
          >
            Rejected Orders
          </button>
        </div>

        {/* Search and Filter */}
        {/* Conditional Content based on active tab */}
        {
          <>
            {/* Search and Filter */}
            <SearchBar
              searchValue={searchWord}
              onSearchChange={(e) => setSearchWord(e.target.value)}
            />

            {/* Traders Table */}
            <div className="bg-transparent rounded-lg border border-primary overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr className="border-b border-primary">
                      <th className="text-left p-4 text-s font-normal text-white">
                        Order ID
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Cart Status
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Total Cost
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Creation date
                      </th>
                      <th
                        className={`p-4 text-s font-extralight text-white ${
                          activeTab === 'pending' ? 'text-center' : 'text-right'
                        }`}
                      >
                        Items Count
                      </th>
                      <th className="text-center p-4 text-s font-extralight text-white">
                        Admin Actions
                      </th>
                      <th className="text-center p-4 text-s font-extralight text-white">
                        View
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
                    ) : filteredOrders.length > 0 ? (
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
                            <td className="p-4 text-m text-left">{order.id}</td>
                            <td className="p-4 text-m text-center">
                              {order.cart_status}
                            </td>
                            <td className="p-4 text-m text-center">
                              {order.total_cost}
                            </td>
                            <td className="p-4 text-m text-center">
                              {formatDate(order.created_at)}
                            </td>
                            <td
                              className={`p-4 text-m  ${activeTab === 'pending' ? 'text-center' : 'text-right'}`}
                            >
                              {order.items_count}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center text-m justify-center gap-2">
                                {activeTab === 'pending' ? (
                                  <>
                                    <button
                                      onClick={() => handleReject(order.id)}
                                      disabled={
                                        rejectMutation.isPending ||
                                        order.cart_status === 'rejected'
                                      }
                                      className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                                        order.cart_status === 'rejected'
                                          ? 'bg-red-500 text-white cursor-default'
                                          : 'bg-transparent text-red-500 border border-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50'
                                      }`}
                                    >
                                      Rejected
                                    </button>
                                    <button
                                      disabled
                                      className={`px-4 py-1 rounded-full text-sm font-medium cursor-default ${
                                        order.cart_status === 'pending'
                                          ? 'bg-yellow-500 text-black'
                                          : 'bg-transparent text-yellow-500 border border-yellow-500'
                                      }`}
                                    >
                                      Pending
                                    </button>
                                    <button
                                      onClick={() => handleApprove(order.id)}
                                      disabled={
                                        approveMutation.isPending ||
                                        order.cart_status === 'approved'
                                      }
                                      className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                                        order.cart_status === 'approved'
                                          ? 'bg-green-500 text-white cursor-default'
                                          : 'bg-transparent text-green-500 border border-green-500 hover:bg-green-500 hover:text-white disabled:opacity-50'
                                      }`}
                                    >
                                      Approved
                                    </button>
                                  </>
                                ) : activeTab === 'approved' ? (
                                  <span className="text-sm font-medium text-green-500">
                                    {order.cart_status}
                                  </span>
                                ) : (
                                  <span className="text-sm font-medium text-[#AE2012]">
                                    {order.cart_status}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td
                              className={`p-4 text-m ${activeTab === 'pending' ? 'text-center' : 'text-right'}`}
                            >
                              <NavLink to={`/orders/${order.id}`}>
                                View cart order info
                              </NavLink>
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

      {/* Pagination Controls */}
      {current_page && total_pages && (
        <PaginationControls
          currentPage={current_page}
          totalPages={total_pages}
          onPageChange={(page) => handlePagination(page)}
        />
      )}
    </div>
  );
}

export default Dashboard