import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import type { Pagination } from "../Products/Products";
import { useState } from "react";
import { NavLink, useLoaderData } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RootState } from "../../store";
import type { UserCartOrder, UserCartOrderResponse } from "../Home/Dashboard";
import WarehouseOrderCreate from "./WarehouseOrderCreate";

export interface CompanySite {
  id: number;
  title: string;
  site_type: 'headquarters' | 'warehouse';
}

export interface Inventory {
  id: number;
  sku: string;
  product_id: number;
}

export interface WareHouseOrder {
  id: number;
  qty: number;
  product_status: 'storage' | 'progress' | 'delivered';
  company_site: CompanySite;
  inventory: Inventory;
  user_cart_order_id: number;
  created_at: string;
}

export interface WareHouseOrdersResponse {
  data: WareHouseOrder[];
  pagination: Pagination;
}

export interface CompanySiteResponse {
  data: CompanySite[];
  pagination: Pagination;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const user = storeState.userState?.user;
  const id = params.id;


  const WarehouseOrdersQuery = {
    queryKey: ['WarehouseOrders'],
    queryFn: async () => {
      const response = await customFetch.get('/warehouse_orders');
      console.log('Products loader - response.data:', response.data)
      return response.data;
    },
  };

  try {
    const [WarehouseOrders] = await Promise.all([
      queryClient.ensureQueryData(WarehouseOrdersQuery),
    ]);
    console.log('WarehouseOrders WarehouseOrders :', WarehouseOrders)
    return { WarehouseOrders };
  } catch (error: any) {
    console.error('Products loader - Failed to load WarehouseOrders data:', error);
    toast.error('Failed to load WarehouseOrders data');
    return { WarehouseOrders: [] };
  }
};

const WarehouseOrders = () => {
  const [activeTab, setActiveTab] = useState<'storage' | 'progress' | 'delivered' | 'create'>('storage');
  const [searchWord, setSearchWord] = useState('');

  const { warehouseOrders: initialWarehouseOrders } = useLoaderData() as {
    warehouseOrders: WareHouseOrder[];
  };

  // Use React Query for live users data
  const { data: warehouse_orders = [] } = useQuery({
    queryKey: ['WarehouseOrders'],
    queryFn: async () => {
      const response = await customFetch.get('/warehouse_orders');
      console.log(`React query response.data : `, response.data)
      return response.data;
    },
    initialData: initialWarehouseOrders,
    refetchOnWindowFocus: false,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Filter users based on active tab and search
  const filteredWarehouseOrders = activeTab !== 'create' ? warehouse_orders.data
    .filter((order: WareHouseOrder) => {
      const matchesSearch =
        order.id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        order.qty?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        order.product_status?.toLowerCase().includes(searchWord.toLowerCase()) ||
        order.company_site.title?.toLowerCase().includes(searchWord.toLowerCase()) ||
        order.company_site.site_type?.toLowerCase().includes(searchWord.toLowerCase()) ||
        order.inventory.sku?.toLowerCase().includes(searchWord.toLowerCase()) ||
        order.inventory.product_id?.toString().toLowerCase().includes(searchWord.toLowerCase());


      if (activeTab === 'storage') {
        return matchesSearch && order.product_status === 'storage';
      } else if (activeTab === 'progress') {
        return matchesSearch && order.product_status === 'progress';
      } else if (activeTab === 'delivered') {
        return matchesSearch && order.product_status === 'delivered';
      }
      return false;
    })
    .sort(
      (a: WareHouseOrder, b: WareHouseOrder) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) : [];
  
  return (
    <div className="min-h-screen bg-[#161420] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-8 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('storage')}
            className={`pb-4 px-2 font-semibold text-lg transition-colors ${
              activeTab === 'storage'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Orders in Storage
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`pb-4 px-2 font-semibold text-lg transition-colors ${
              activeTab === 'progress'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Orders in Progress
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`pb-4 px-2 font-semibold text-lg transition-colors ${
              activeTab === 'delivered'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Delivered Orders
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-4 px-2 font-semibold text-lg transition-colors ${
              activeTab === 'create'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Create Order
          </button>
        </div>

        {/* Search and Filter */}
                {/* Conditional Content based on active tab */}
        {activeTab === 'create' ? (
          <WarehouseOrderCreate />
        ) : (
          <>
            {/* Search and Filter */}
            <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search by name, date, or etc..."
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 pl-10 text-white placeholder-gray-400"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
                <button className="p-3 bg-[#2a2740] border border-gray-600 rounded-lg hover:bg-[#353350] transition-colors">
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
            <div className="bg-[#1e1b2e] rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-4 text-xs font-extralight text-gray-300">
                        ID
                      </th>
                      <th className="text-center p-4 text-xs font-extralight text-gray-300">
                        Order Status
                      </th>
                      <th className="text-center p-4 text-xs font-extralight text-gray-300">
                        Company Site
                      </th>
                      <th className={`p-4 text-xs font-extralight text-gray-300 ${
                        activeTab === 'progress' ? 'text-center' : 'text-right'
                      }`}>
                        SKU
                      </th>
                      <th className={`p-4 text-xs font-extralight text-gray-300 ${
                        activeTab === 'progress' ? 'text-center' : 'text-right'
                      }`}>
                        Cart Order ID
                      </th>
                      <th className={`p-4 text-xs font-extralight text-gray-300 ${
                        activeTab === 'progress' ? 'text-center' : 'text-right'
                      }`}>
                        Creation date
                      </th>
                      <th className="text-center p-4 text-xs font-extralight text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWarehouseOrders.length > 0 ? (
                      filteredWarehouseOrders.map((order: WareHouseOrder, index: number) => (
                        <tr
                          key={order.id}
                          className={`border-b border-gray-800 hover:bg-[#2a2740] transition-colors ${
                            index % 2 === 0 ? 'bg-[#1e1b2e]' : 'bg-[#252238]'
                          }`}
                        >
                          <td className="p-4 text-xs  text-left">
                            {order.id}
                          </td>
                          <td className="p-4 text-xs  text-center">
                            {order.product_status}
                          </td>
                          <td className="p-4 text-xs  text-center">
                            {order.company_site.title}
                          </td>
                          <td className={`p-4 text-xs  ${activeTab === 'progress' ? 'text-center' : 'text-right'}`}>
                            {order.inventory.sku}
                          </td>
                          <td className={`p-4 text-xs  ${activeTab === 'progress' ? 'text-center' : 'text-right'}`}>
                            {order.user_cart_order_id}
                          </td>
                          <td className={`p-4 text-xs  ${activeTab === 'progress' ? 'text-center' : 'text-right'}`}>
                            {formatDate(order.created_at)}
                          </td>
                          <td className="p-4 text-center">
                            <NavLink to={`/warehouse_orders/${order.id}`}>View</NavLink> | <NavLink to={`/warehouse_orders/edit/${order.id}`}>Edit </NavLink>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-gray-400"
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
        )}
      </div>
    </div>
  )
}

export default WarehouseOrders