import { redirect, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import type { Item } from "../Receipts/ReceiptView";
import type { WareHouseOrder } from "../WarehouseOrders/WarehouseOrders";
import { BackButton } from "../../components";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type { Address } from "../Products/Products";

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
  items?: Item[]; // Keep for backward compatibility, but warehouse_orders is the source of truth
  warehouse_orders: WareHouseOrder[];
  warehouse_orders_count: number;
  created_at: string;
}

interface UserCartOrderResponse {
  data: UserCartOrder
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  console.log('UserCartOrderView loader - START');
  console.log('UserCartOrderView loader - params:', params);
  const storeState = store.getState();
  console.log('UserCartOrderView loader - storeState:', storeState);
  const admin_user = storeState.userState?.user;
  console.log('UserCartOrderView loader - admin_user:', admin_user);
  const id = params.id;
  console.log('UserCartOrderView loader - Order ID:', id);

  const UserCartOrderViewQuery = {
    queryKey: ["UserCartOrderViewDetails", id],
    queryFn: async () => {
      console.log('UserCartOrderView loader - Fetching order details for ID:', id);
      const response = await customFetch.get(`/user_cart_orders/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      console.log('UserCartOrderViewQuery response.data:', response.data);
      console.log('UserCartOrderViewQuery response.data.warehouse_orders:', response.data?.data?.warehouse_orders);
      console.log('UserCartOrderViewQuery response.data.items:', response.data?.data?.items);
      return response.data;
    },
  };

  try {
    const UserCartOrderViewDetails = await queryClient.ensureQueryData(UserCartOrderViewQuery);
    console.log('UserCartOrderView loader - SUCCESS - Returning data');
    return { UserCartOrderViewDetails };
  } catch (error: any) {
    console.error('UserCartOrderView loader - Failed to load cart order info:', error);
    console.error('UserCartOrderView loader - Error response:', error.response?.data);
    toast.error('Failed to load cart order info');
    return redirect('/dashboard');
  }
};

const UserCartOrderView = () => {
  console.log('UserCartOrderView component - RENDER START');
  const { UserCartOrderViewDetails: initialData } = useLoaderData() as {
    UserCartOrderViewDetails: UserCartOrderResponse;
  };
  const navigate = useNavigate();
  console.log('UserCartOrderView component - initialData:', initialData);
  const { id } = useParams();
  console.log('UserCartOrderView component - Order ID from params:', id);
  const user = useSelector((state: RootState) => state.userState.user);
  console.log('UserCartOrderView component - user from Redux:', user);
  const queryClient = useQueryClient();

  // Use useQuery to enable auto-refetch on invalidation
  const { data: UserCartOrderViewDetails } = useQuery({
    queryKey: ["UserCartOrderViewDetails", id],
    queryFn: async () => {
      console.log('UserCartOrderView useQuery - Fetching order details for ID:', id);
      const response = await customFetch.get(`/user_cart_orders/${id}`, {
        headers: {
          Authorization: user?.token,
        },
      });
      console.log('UserCartOrderView useQuery - Response:', response.data);
      return response.data;
    },
    initialData: initialData,
    refetchOnWindowFocus: false,
  });

  console.log('UserCartOrderView component - UserCartOrderViewDetails:', UserCartOrderViewDetails);
  console.log('UserCartOrderView component - UserCartOrderViewDetails.data:', UserCartOrderViewDetails.data);
  const { id: _cartOrderId, total_cost, is_paid, social_program_id, user_address, warehouse_orders, items } = UserCartOrderViewDetails.data;
  console.log('UserCartOrderView component - Destructured data:');
  console.log('  - total_cost:', total_cost);
  console.log('  - is_paid:', is_paid);
  console.log('  - social_program_id:', social_program_id);
  console.log('  - user_address:', user_address);
  console.log('  - warehouse_orders:', warehouse_orders);
  console.log('  - warehouse_orders length:', warehouse_orders?.length);
  console.log('  - items:', items);
  console.log('  - items length:', items?.length);
  const { unit_no, street_no, barangay, city, region, zipcode } = user_address.address;

  // State for bulk status update
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [newStatus, setNewStatus] = useState<'storage' | 'progress' | 'delivered'>('storage');
  const [isUpdating, setIsUpdating] = useState(false);
  console.log('UserCartOrderView component - selectedOrders:', selectedOrders);
  console.log('UserCartOrderView component - newStatus:', newStatus);

  // Mutation for updating warehouse order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      console.log('UserCartOrderView updateStatusMutation - Updating order:', orderId, 'to status:', status);
      const response = await customFetch.patch(
        `/warehouse_orders/${orderId}`,
        { warehouse_order: { product_status: status } },
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('UserCartOrderView updateStatusMutation - Response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('UserCartOrderView updateStatusMutation - SUCCESS - Invalidating query');
      queryClient.invalidateQueries({ queryKey: ['UserCartOrderViewDetails', id] });
    },
  });

  // Handle select/deselect individual order
  const handleSelectOrder = (orderId: number) => {
    console.log('UserCartOrderView handleSelectOrder - Order ID:', orderId);
    setSelectedOrders((prev) => {
      const newSelection = prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId];
      console.log('UserCartOrderView handleSelectOrder - New selection:', newSelection);
      return newSelection;
    });
  };

  // Handle select/deselect all orders
  const handleSelectAll = () => {
    console.log('UserCartOrderView handleSelectAll - Current selection:', selectedOrders.length);
    console.log('UserCartOrderView handleSelectAll - Total warehouse orders:', warehouse_orders.length);
    if (selectedOrders.length === warehouse_orders.length) {
      console.log('UserCartOrderView handleSelectAll - Deselecting all');
      setSelectedOrders([]);
    } else {
      const allIds = warehouse_orders.map((order: WareHouseOrder) => order.id);
      console.log('UserCartOrderView handleSelectAll - Selecting all:', allIds);
      setSelectedOrders(allIds);
    }
  };

  // Handle bulk status update
  const handleBulkUpdate = async () => {
    console.log('UserCartOrderView handleBulkUpdate - START');
    console.log('UserCartOrderView handleBulkUpdate - Selected orders:', selectedOrders);
    console.log('UserCartOrderView handleBulkUpdate - New status:', newStatus);
    
    if (selectedOrders.length === 0) {
      console.log('UserCartOrderView handleBulkUpdate - No orders selected');
      toast.warn('Please select at least one warehouse order');
      return;
    }

    setIsUpdating(true);

    try {
      // Send individual PATCH requests for each selected order
      console.log('UserCartOrderView handleBulkUpdate - Creating update promises...');
      const updatePromises = selectedOrders.map((orderId) =>
        updateStatusMutation.mutateAsync({ orderId, status: newStatus })
      );

      console.log('UserCartOrderView handleBulkUpdate - Awaiting all updates...');
      await Promise.all(updatePromises);

      console.log('UserCartOrderView handleBulkUpdate - All updates successful');
      toast.success(`Successfully updated ${selectedOrders.length} warehouse order(s) to ${newStatus}`);
      setSelectedOrders([]); // Clear selection after update
      
      // Refetch the cart order details immediately
      console.log('UserCartOrderView handleBulkUpdate - Refetching query data...');
      await queryClient.invalidateQueries({ queryKey: ['UserCartOrderViewDetails', id] });
      await queryClient.refetchQueries({ queryKey: ['UserCartOrderViewDetails', id] });
      console.log('UserCartOrderView handleBulkUpdate - Query refetched');
    } catch (error: any) {
      console.error('UserCartOrderView handleBulkUpdate - Failed to update warehouse orders:', error);
      toast.error('Failed to update some warehouse orders');
    } finally {
      setIsUpdating(false);
      console.log('UserCartOrderView handleBulkUpdate - COMPLETE');
      navigate(`/orders/${id}`)
    }
  };


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
        <BackButton to="/orders" />

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
                  <div>{id}</div>
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">
                    Total Cost:
                  </label>
                  {total_cost}
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">Paid?</label>
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
                    {items && items.length > 0
                      ? (() => {
                          console.log('UserCartOrderView render - Rendering items:', items);
                          return items.map((item: any, index: number) => {
                            console.log('UserCartOrderView render - Item:', index, item);
                            return (
                              <div key={index} className="mb-3 pb-2 border-b border-gray-300">
                                <div><strong>Product:</strong> {item.product_title}</div>
                                <div><strong>Quantity:</strong> {item.qty}</div>
                                <div><strong>Price:</strong> ${item.price}</div>
                                {item.subtotal && <div className="underline"><strong>Subtotal:</strong> ${item.subtotal}</div>}
                              </div>
                            );
                          });
                        })()
                      : (() => {
                          console.log('UserCartOrderView render - No items to display');
                          return 'No items';
                        })()}
                  </div>
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">
                    Warehouse orders:
                  </label>
                  
                  {/* Bulk Update Controls */}
                  {warehouse_orders && warehouse_orders.length > 0 && (
                    <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <label className="flex items-center gap-2 font-medium">
                          <input
                            type="checkbox"
                            checked={selectedOrders.length === warehouse_orders.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 cursor-pointer"
                          />
                          Select All
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="font-medium">Update selected to:</label>
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as 'storage' | 'progress' | 'delivered')}
                            className="px-3 py-1 border border-gray-600 rounded-lg text-black"
                          >
                            <option value="storage">Storage</option>
                            <option value="progress">In Progress</option>
                            <option value="delivered">Delivered</option>
                          </select>
                          <button
                            onClick={handleBulkUpdate}
                            disabled={selectedOrders.length === 0 || isUpdating}
                            className="px-4 py-1 bg-secondary hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                          >
                            {isUpdating ? 'Updating...' : `Update Selected (${selectedOrders.length})`}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warehouse Orders List */}
                  <div className="space-y-4">
                    {warehouse_orders && warehouse_orders.length > 0
                      ? (() => {
                          console.log('UserCartOrderView render - Rendering warehouse_orders:', warehouse_orders);
                          return warehouse_orders.map((order: WareHouseOrder) => {
                            console.log('UserCartOrderView render - Processing warehouse order:', order);
                            console.log('UserCartOrderView render - order.inventory:', order.inventory);
                            
                            // Check if inventory exists
                            if (!order.inventory) {
                              console.log('UserCartOrderView render - Skipping order - no inventory:', order.id);
                              return null;
                            }

                            const {
                              id: orderId,
                              qty,
                              subtotal,
                              product_status,
                              created_at,
                              inventory: {
                                id: inventory_id,
                                sku,
                                product_id,
                                qty_in_stock,
                              },
                              company_site,
                            } = order;

                            console.log('UserCartOrderView render - Destructured warehouse order data:', {
                              orderId,
                              qty,
                              subtotal,
                              product_status,
                              inventory_id,
                              sku,
                              product_id,
                              company_site
                            });

                            const title = company_site?.title || '-';
                            const site_type = company_site?.site_type || '-';

                            return (
                              <div
                              key={orderId}
                              className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50"
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedOrders.includes(orderId)}
                                  onChange={() => handleSelectOrder(orderId)}
                                  className="mt-1 w-4 h-4 cursor-pointer"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold">Order ID: {orderId}</span>
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        product_status === 'delivered'
                                          ? 'bg-green-500/20 text-green-700 border border-green-700'
                                          : product_status === 'progress' || product_status === 'on_delivery'
                                          ? 'bg-yellow-500/20 text-yellow-700 border border-yellow-700'
                                          : 'bg-gray-500/20 text-gray-700 border border-gray-700'
                                      }`}
                                    >
                                      {product_status.charAt(0).toUpperCase() + product_status.slice(1)}
                                    </span>
                                  </div>
                                  
                                  {/* Product Details */}
                                  <div className="mb-3 p-2 bg-blue-50 rounded">
                                    <div className="font-semibold text-blue-900">Product ID: {product_id}</div>
                                    {subtotal && <div className="text-sm text-blue-700">Subtotal: ${subtotal}</div>}
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div><strong>Ordered on:</strong> {formatDate(created_at)}</div>
                                      <div><strong>Quantity:</strong> {qty}</div>
                                    </div>
                                    <div>
                                      <div><strong>Warehouse:</strong> {title}</div>
                                      <div><strong>Type:</strong> {site_type}</div>
                                    </div>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                    <div className="text-sm">
                                      <strong>Inventory Info:</strong> ID: {inventory_id}, SKU: {sku}, Product ID: {product_id}, Stock: {qty_in_stock}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()
                      : (() => {
                          console.log('UserCartOrderView render - No warehouse orders to display');
                          return 'No warehouse orders';
                        })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCartOrderView