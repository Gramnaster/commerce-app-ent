import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import type { Pagination } from "../Products/Products";
import { useState } from "react";
import { NavLink, useLoaderData } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import WarehouseOrderCreate from "./WarehouseOrderCreate";

export interface CompanySite {
  id: number;
  title: string;
  site_type: 'management' | 'warehouse';
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  product_image_url: string | null;
}

export interface Inventory {
  id: number;
  sku: string;
  product_id: number;
  qty_in_stock: number;
  product: Product;
}

export interface WareHouseOrder {
  id: number;
  qty: number;
  subtotal?: string;
  inventory_id: number;
  company_site_id: number;
  product_status: 'storage' | 'progress' | 'delivered' | 'on_delivery';
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
  const { WarehouseOrders: initialWarehouseOrders } = useLoaderData() as {
    WarehouseOrders: WareHouseOrdersResponse;
  };
  const [warehouseOrdersData, setWarehouseOrdersData] = useState(initialWarehouseOrders);
  const [loading, setLoading] = useState(false);

  const handlePagination = async (page: number | null) => {
    if (!page) return;
    setLoading(true)
    
    try {
      const response = await customFetch.get(`/warehouse_orders?page=${page}&per_page=${warehouseOrdersData.pagination.per_page || 20}`);
      const data = response.data;
      console.log('Products handlePagination - Response:', data);
      setWarehouseOrdersData(data);
      setLoading(false);
    }
    catch (error: any) {
      console.error('Products handlePagination - Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
    }
  }
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

  const { current_page, total_pages, next_page, previous_page } = warehouseOrdersData.pagination || {
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
            onClick={() => setActiveTab('storage')}
            className={`pb-4 px-2 font-semibold text-lg transition-colors ${
              activeTab === 'storage'
                ? 'text-primary border-b-2 border-primary'
                : 'text-[#615b5a] hover:text-[#615b5a]'
            }`}
          >
            Orders in Storage
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`pb-4 px-2 font-semibold text-lg transition-colors ${
              activeTab === 'progress'
                ? 'text-primary border-b-2 border-primary'
                : 'text-[#615b5a] hover:text-[#615b5a]'
            }`}
          >
            Orders in Progress
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`pb-4 px-2 font-semibold text-lg transition-colors ${
              activeTab === 'delivered'
                ? 'text-primary border-b-2 border-primary'
                : 'text-[#615b5a] hover:text-[#615b5a]'
            }`}
          >
            Delivered Orders
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-4 px-2 font-semibold text-lg transition-colors ${
              activeTab === 'create'
                ? 'text-primary border-b-2 border-primary'
                : 'text-[#615b5a] hover:text-[#615b5a]'
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
            <div className="bg-primary rounded-lg p-6 border border-primary mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search by name, date, or etc..."
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
                      <th className="text-left p-4 text-s font-normal text-white">
                        Order Status
                      </th>
                      <th className="text-left p-4 text-s font-normal text-white">
                        Company Site
                      </th>
                      <th className={`p-4 text-s font-extralight text-white ${
                        activeTab === 'progress' ? 'text-center' : 'text-right'
                      }`}>
                        SKU
                      </th>
                      <th className={`p-4 text-s font-extralight text-white ${
                        activeTab === 'progress' ? 'text-center' : 'text-right'
                      }`}>
                        Cart Order ID
                      </th>
                      <th className={`p-4 text-s font-extralight text-white ${
                        activeTab === 'progress' ? 'text-center' : 'text-right'
                      }`}>
                        Creation date
                      </th>
                      <th className="text-center p-4 text-s font-extralight text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    { loading ?     
                    <tr className='border-b text-[#000000] border-primary hover:bg-[hsl(0,0%,87%)] transition-colors'>
                      <td className="p-8 text-center" colSpan={10}>
                        <div className="h-screen flex items-center justify-center">
                          <span className="loading loading-ring loading-lg text-black">LOADING</span>
                        </div>
                      </td> 
                    </tr>
                    : filteredWarehouseOrders.length > 0 ? (
                      filteredWarehouseOrders.map((order: WareHouseOrder, index: number) => (
                        <tr
                          key={order.id}
                          className={`border-b text-[#000000] border-primary hover:bg-white transition-colors${
                            index % 2 === 0 ? 'bg-transparent' : 'bg-[#f3f3f3]'
                          }`}
                        >
                          <td className="p-4 text-m text-left">
                            {order.id}
                          </td>
                          <td className="p-4 text-m text-center">
                            {order.product_status}
                          </td>
                          <td className="p-4 text-m text-center">
                            {order.company_site.title}
                          </td>
                          <td className={`p-4 text-m ${activeTab === 'progress' ? 'text-center' : 'text-right'}`}>
                            {order.inventory.sku}
                          </td>
                          <td className={`p-4 text-m  ${activeTab === 'progress' ? 'text-center' : 'text-right'}`}>
                            {order.user_cart_order_id}
                          </td>
                          <td className={`p-4 text-m ${activeTab === 'progress' ? 'text-center' : 'text-right'}`}>
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
        )}
      </div>
      {total_pages && total_pages > 1 && (
        <div className="join mt-6 flex justify-center">
          <input
            className="join-item btn btn-square border-black" 
            type="radio" 
            name="options" 
            onClick={() => handlePagination(previous_page)}
            disabled={!previous_page}
            aria-label="❮" 
          />
          {[...Array(total_pages).keys()].map((_, i) => {
            const pageNum = i + 1;
            return (
              <input 
                key={i} 
                className="join-item btn btn-square border-black" 
                type="radio" 
                name="options" 
                checked={current_page === pageNum}
                onClick={() => handlePagination(pageNum)}
                aria-label={`${pageNum}`} 
                readOnly
              />
            );
          })}
          <input
            className="join-item btn btn-square border-black" 
            type="radio" 
            name="options" 
            onClick={() => handlePagination(next_page)}
            disabled={!next_page}
            aria-label="❯" 
          />
        </div>
      )}
    </div>
  )
}

export default WarehouseOrders