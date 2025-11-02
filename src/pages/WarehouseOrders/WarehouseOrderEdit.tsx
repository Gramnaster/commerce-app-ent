import React, { useState } from 'react'
import { customFetch } from '../../utils';
import { redirect, useLoaderData, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { CompanySite, CompanySiteResponse, WareHouseOrder } from './WarehouseOrders';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { SubmitBtn } from '../../components';

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;

  const id = params.id;

  const WarehouseOrderDetailsQuery = {
    queryKey: ['WarehouseOrderDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/warehouse_orders/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  const CompanySitesQuery = {
    queryKey: ['CompanySites', id],
    queryFn: async () => {
      const response = await customFetch.get(`/company_sites`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const [WarehouseOrderDetails, CompanySites] = await Promise.all([
      queryClient.ensureQueryData(WarehouseOrderDetailsQuery),
      queryClient.ensureQueryData(CompanySitesQuery)
    ]);

    console.log('WarehouseOrderEdit loader - WarehouseOrderDetails:', WarehouseOrderDetails)
    console.log('WarehouseOrderEdit loader - CompanySites:', CompanySites)
    return { WarehouseOrderDetails, CompanySites };
  } catch (error: any) {
    console.error('Failed to load warehouse order:', error);
    toast.error('Failed to load warehouse order details');
    return redirect('/warehouse_orders');
  }
};

const WarehouseOrderEdit = () => {
  const { WarehouseOrderDetails, CompanySites } = useLoaderData() as {
    WarehouseOrderDetails: { data: WareHouseOrder };
    CompanySites: CompanySiteResponse;
  }
  console.log(`CompanySites`, CompanySites)
  console.log(`CompanySites.data`, CompanySites.data)
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const storeUser = useSelector((state: RootState) => state.userState.user);

  const { qty, product_status, company_site: { id: company_site_id }, inventory: { id: inventory_id,  }, user, user_cart_order_id, } = WarehouseOrderDetails.data;
  
  const user_id = user?.id || 0;

  const [formData, setFormData] = useState({
    company_site_id: company_site_id,
    inventory_id: inventory_id,
    user_id: user_id,
    user_cart_order_id: user_cart_order_id,
    qty: qty,
    product_status: product_status
  })

  const updateWarehouseOrderMutation = useMutation({
    mutationFn: async (orderData: FormData | any) => {
      console.log('WarehouseOrderEdit mutation - Sending update request');
      const response = await customFetch.patch(
        `/warehouse_orders/${WarehouseOrderDetails.data.id}`,
        orderData,
        {
          headers: {
            Authorization: storeUser?.token,
            // Content-Type will be set automatically for FormData
          },
        }
      );
      console.log('ProductEdit mutation - Response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('WarehouseOrderEdit mutation - Success, updating product ID:', WarehouseOrderDetails.data.id);
      toast.success('Warehouse Order Details updated successfully');
      queryClient.invalidateQueries({ queryKey: ['warehouse_orders', WarehouseOrderDetails.data.id] });
      navigate(`/warehouse_orders/${WarehouseOrderDetails.data.id}`);
    },
    onError: (error: any) => {
      console.error('WarehouseOrderEdit mutation - Update failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to update product';
      toast.error(errorMessage);
    },
  });

  console.log(`WarehouseOrderEdit WarehouseOrderDetails`, WarehouseOrderDetails)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`handleSubmit formData:`, formData)
    // Create the payload matching the API format
    const payload = {
      ...formData,
    };
    console.log(`WarehouseOrderEdit payload:`, payload)
    updateWarehouseOrderMutation.mutate(payload);
  };

  const handleDelete = async () => {
  if (!confirm("Are you sure you want to delete this product?")) return;
  
    console.log('WarehouseOrderEdit handleDelete - Deleting product ID:', WarehouseOrderDetails.data.id)
    navigate(`/warehouse_orders`)
    
   try {
      console.log('WarehouseOrderEdit handleDelete - Sending DELETE request');
      const response = await customFetch.delete(`/warehouse_orders/${WarehouseOrderDetails.data.id}`,
        {
          headers: {
            Authorization: storeUser?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('WarehouseOrderEdit handleDelete - Delete response:', response.data);
      redirect('/warehouse_orders');
      toast.success('Product deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('WarehouseOrderEdit handleDelete - Failed to delete product:', error);
      toast.error('Failed to load WarehouseOrder details');
      return redirect('/warehouse_orders');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-black">
          <button
            onClick={() => navigate(`/warehouse_orders/${WarehouseOrderDetails.data.id}`)}
            className="mb-4 flex items-center gap-2 hover:underline transition-colors text-black"
          >
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
            Back to Warehouse Order View
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">Edit Warehouse Order Interface</h1>
          <button type="button" onClick={handleDelete} className="text-primary hover:underline hover:cursor-pointer">Delete Warehouse Order?</button>
        </div>

        {/* Create Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-primary rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white">
              Enter information:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Company Site
                </label>
                <select
                  name="company_site_id"
                  value={formData.company_site_id}
                  onChange={handleInputChange}
                  className='text-black'
                  required
                >
                  <option value="" className='text-white'>Select Company Site</option>
                  {CompanySites?.data
                    .sort((a: CompanySite, b: CompanySite) => a.title.localeCompare(b.title))
                    .map((site: CompanySite) => {
                    const { id, title } = site
                    return (
                      <option key={id} value={id} className='text-black'>
                        {title}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Inventory ID
                </label>
                <input
                  type="text"
                  name="inventory_id"
                  value={formData.inventory_id}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Cart Order ID
                </label>
                <input
                  type="text"
                  name="user_cart_order_id"
                  value={formData.user_cart_order_id}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  placeholder="e.g. 1, 2, 3"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Quantity
                </label>
                <input
                  type="text"
                  name="qty"
                  value={formData.qty}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Product Status
                </label>
                <select
                  name="product_status"
                  value={formData.product_status}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="storage">storage</option>
                  <option value="progress">progress</option>
                  <option value="delivered">delivered</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  company_site_id: 0,
                  inventory_id: 0,
                  user_id: 0,
                  user_cart_order_id: 0,
                  qty: 0,
                  product_status: 'storage'
                });
              }}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Clear Form
            </button>
            <SubmitBtn 
              text="Update Order" 
              isSubmitting={updateWarehouseOrderMutation.isPending} 
              loadingText="Updating Order..." 
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default WarehouseOrderEdit