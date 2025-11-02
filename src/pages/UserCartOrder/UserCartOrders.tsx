import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import type { Pagination } from "../Products/Products";
import { useState, useEffect, useMemo } from "react";
import { NavLink, useLoaderData } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SearchBar, PaginationControls } from "../../components";
import type { CompanySite, CompanySiteResponse } from "../WarehouseOrders/WarehouseOrders";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

interface Address {
  unit_no: string;
  street_no: string;
  barangay: string;
  city: string;
  region: string;
  zipcode: string;
}

interface UserAddress {
  id: number;
  address: Address;
}

export interface UserCartOrder {
  id: number;
  total_cost: string;
  is_paid: boolean;
  cart_status: "pending" | "approved" | "rejected";
  social_program_id: number | null;
  user_address: UserAddress;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserCartOrdersResponse {
  data: UserCartOrder[];
  pagination: Pagination;
}

export const loader = (queryClient: any, store: any) => async () => {
  const storeState = store.getState();
  const user = storeState.userState?.user;

  const userCartOrdersQuery = {
    queryKey: ['UserCartOrders', 'all'],
    queryFn: async () => {
      const response = await customFetch.get('/user_cart_orders?page=1&per_page=30', {
        headers: {
          Authorization: user.token,
        },
      });
      console.log('UserCartOrders loader - response.data:', response.data);
      return response.data;
    },
  };

  const companySitesQuery = {
    queryKey: ['CompanySites'],
    queryFn: async () => {
      const response = await customFetch.get('/company_sites');
      console.log('UserCartOrders loader - company sites:', response.data);
      return response.data;
    },
  };

  try {
    const [userCartOrders, companySites] = await Promise.all([
      queryClient.ensureQueryData(userCartOrdersQuery),
      queryClient.ensureQueryData(companySitesQuery),
    ]);
    return { userCartOrders, companySites };
  } catch (error: any) {
    console.error('UserCartOrders loader - Failed to load data:', error);
    toast.error('Failed to load cart orders data');
    return { userCartOrders: { data: [], pagination: {} }, companySites: { data: [] } };
  }
};

const UserCartOrders = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [searchWord, setSearchWord] = useState('');
  const [loading, setLoading] = useState(false);

  const { userCartOrders: initialUserCartOrders, companySites } = useLoaderData() as {
    userCartOrders: UserCartOrdersResponse;
    companySites: CompanySiteResponse;
  };

  const [userCartOrdersData, setUserCartOrdersData] = useState(initialUserCartOrders);
  const user = useSelector((state: RootState) => state.userState.user);

  // Filter warehouses from company sites
  const warehouses = useMemo(() => {
    return companySites.data
      .filter((site: CompanySite) => site.site_type === 'warehouse')
      .sort((a: CompanySite, b: CompanySite) => a.title.localeCompare(b.title));
  }, [companySites.data]);

  // Fetch data when warehouse filter changes
  useEffect(() => {
    const fetchFilteredData = async () => {
      setLoading(true);
      try {
        const endpoint = selectedWarehouse
          ? `/user_cart_orders/warehouse/${selectedWarehouse}?page=1&per_page=30`
          : `/user_cart_orders?page=1&per_page=30`;

        const response = await customFetch.get(endpoint, {
          headers: {
            Authorization: user?.token,
          },
        });
        console.log('UserCartOrders warehouse filter - Response:', response.data);
        setUserCartOrdersData(response.data);
      } catch (error: any) {
        console.error('UserCartOrders warehouse filter - Failed to load data:', error);
        console.error('Error response data:', error.response?.data);
        console.error('Error status:', error.response?.status);
        toast.error(`Failed to load filtered cart orders: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredData();
  }, [selectedWarehouse]);

  const handleWarehouseChange = (warehouseId: number | null) => {
    console.log('UserCartOrders handleWarehouseChange - Selected warehouse ID:', warehouseId);
    setSelectedWarehouse(warehouseId);
    setSearchWord(''); // Clear search when changing warehouses
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchWord(e.target.value);
    console.log('UserCartOrders handleSearchChange - Search term:', e.target.value);
  };

  const handlePagination = async (page: number) => {
    if (!page || page < 1) return;
    setLoading(true);

    try {
      const endpoint = selectedWarehouse
        ? `/user_cart_orders/warehouse/${selectedWarehouse}?page=${page}&per_page=30`
        : `/user_cart_orders?page=${page}&per_page=30`;

      const response = await customFetch.get(endpoint);
      console.log('UserCartOrders handlePagination - Response:', response.data);
      setUserCartOrdersData(response.data);
    } catch (error: any) {
      console.error('UserCartOrders handlePagination - Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
    } finally {
      setLoading(false);
    }
  };

  // Use React Query for live data
  useQuery({
    queryKey: ['UserCartOrders', selectedWarehouse],
    queryFn: async () => {
      const endpoint = selectedWarehouse
        ? `/user_cart_orders/warehouse/${selectedWarehouse}?page=1&per_page=30`
        : `/user_cart_orders?page=1&per_page=30`;
      const response = await customFetch.get(endpoint);
      return response.data;
    },
    initialData: initialUserCartOrders,
    refetchOnWindowFocus: false,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Filter cart orders based on search
  const filteredCartOrders = useMemo(() => {
    return userCartOrdersData.data
      .filter((order: UserCartOrder) => {
        if (!searchWord) return true;

        const matchesSearch =
          order.id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
          order.total_cost?.toLowerCase().includes(searchWord.toLowerCase()) ||
          order.cart_status?.toLowerCase().includes(searchWord.toLowerCase()) ||
          order.user_address?.address?.barangay?.toLowerCase().includes(searchWord.toLowerCase()) ||
          order.user_address?.address?.city?.toLowerCase().includes(searchWord.toLowerCase()) ||
          order.user_address?.address?.region?.toLowerCase().includes(searchWord.toLowerCase()) ||
          order.social_program_id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
          order.items_count?.toString().toLowerCase().includes(searchWord.toLowerCase());

        return matchesSearch;
      })
      .sort(
        (a: UserCartOrder, b: UserCartOrder) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [userCartOrdersData.data, searchWord]);

  const { current_page, total_pages } = userCartOrdersData.pagination || {
    current_page: 1,
    per_page: 30,
    total_pages: 1,
    next_page: null,
    previous_page: null,
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Warehouse Filter Tabs */}
        <div className="text-primary font-bold mb-4">
          <button
            onClick={() => handleWarehouseChange(null)}
            className={`m-1 px-2 py-2 border-2 border-primary rounded-2xl hover:cursor-pointer hover:bg-primary hover:text-white ${
              selectedWarehouse === null ? 'bg-primary text-white' : ''
            }`}
          >
            All
          </button>
          {warehouses.map((warehouse: CompanySite) => (
            <button
              key={warehouse.id}
              onClick={() => handleWarehouseChange(warehouse.id)}
              className={`m-1 px-2 py-2 border-2 border-primary rounded-2xl hover:cursor-pointer hover:bg-primary hover:text-white ${
                selectedWarehouse === warehouse.id ? 'bg-primary text-white' : ''
              }`}
            >
              {warehouse.title}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <SearchBar searchValue={searchWord} onSearchChange={handleSearchChange} isLoading={loading} />

        {/* Cart Orders Table */}
        <div className="bg-transparent rounded-lg border border-primary overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Total Cost</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Payment Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Order Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Delivery Address</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Social Program</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Created Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[#8d8d8d2a] divide-y divide-gray-700">
                {filteredCartOrders.length > 0 ? (
                  filteredCartOrders.map((order: UserCartOrder) => (
                    <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-black font-medium">{order.id}</td>
                      <td className="px-6 py-4 text-black">₱{parseFloat(order.total_cost).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.is_paid
                              ? 'bg-green-500/20 text-green-700 border border-green-700'
                              : 'bg-red-500/20 text-red-700 border border-red-700'
                          }`}
                        >
                          {order.is_paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.cart_status === 'approved'
                              ? 'bg-green-500/20 text-green-700 border border-green-700'
                              : order.cart_status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-700'
                              : 'bg-red-500/20 text-red-700 border border-red-700'
                          }`}
                        >
                          {order.cart_status.charAt(0).toUpperCase() + order.cart_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-black">
                        {order.user_address.address.barangay}, {order.user_address.address.city}
                      </td>
                      <td className="px-6 py-4 text-black text-center">{order.items_count}</td>
                      <td className="px-6 py-4 text-black text-center">
                        {order.social_program_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-black">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4">
                        <NavLink
                          to={`/orders/${order.id}`}
                          className="text-[#5290ca] hover:text-[#5290ca]/80 font-medium transition-colors"
                        >
                          View
                        </NavLink>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-black">
                      {loading ? 'Loading...' : 'No cart orders found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <PaginationControls
          currentPage={current_page || 1}
          totalPages={total_pages || 1}
          onPageChange={handlePagination}
        />
      </div>
    </div>
  );
};

export default UserCartOrders;
