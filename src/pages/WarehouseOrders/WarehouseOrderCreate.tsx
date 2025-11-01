import React, { useEffect, useState } from 'react'
import type { UserCartOrder, UserCartOrderResponse } from '../Home/Dashboard';
import type { CompanySite, CompanySiteResponse } from './WarehouseOrders';
import { customFetch } from '../../utils';
import type { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';


const WarehouseOrderCreate = () => {
  const queryClient = useQueryClient();
  const [userCartOrders, setUserCartOrders] = useState<UserCartOrder[]>([]);
  const [companySites, setCompanySites] = useState<CompanySiteResponse>();

  const user = useSelector((state: RootState) => state.userState.user);

  useEffect(() => {
    const fetchUserCartOrders = async () => {
      try {
        const response = await customFetch.get('/company_sites', {
        headers: {
          Authorization: user?.token,
        },
      });
        console.log(`fetchUserCartOrders`, response.data)
        setUserCartOrders(response.data);
      } catch (error) {
        console.error('Failed to load user cart orders:', error);
        toast.error('Failed to load user cart orders');
      }
    };
    
    const fetchCompanySites = async () => {
      try {
      const response = await customFetch.get('/company_sites', {
        headers: {
          Authorization: user?.token,
        },
      });
        console.log(`fetchCompanySites`, response.data)
        setCompanySites(response.data);
      } catch (error) {
        console.error('Failed to load countries:', error);
        toast.error('Failed to load countries');
      }
    };
    fetchUserCartOrders();
    fetchCompanySites();
  }, []);

  const [formData, setFormData] = useState({
    company_site_id: '',
    inventory_id: '',
    user_id: '',
    user_cart_order_id: '',
    qty: '',
    product_status: ''
  });

  const createOrderMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await customFetch.post(
        '/warehouse_orders',
        userData,
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
      toast.success('Order created successfully');
      queryClient.invalidateQueries({ queryKey: ['warehouse_orders', user?.id] });
      // Reset form
      setFormData({
        company_site_id: '',
        inventory_id: '',
        user_id: '',
        user_cart_order_id: '',
        qty: '',
        product_status: ''
      });
    },
    onError: (error: any) => {
      console.error('Create failed:', error);
      const errorMessage =
        error.response?.data?.message || 
        error.response?.data?.error?.message ||
        'Failed to create warehouse order';
      toast.error(errorMessage);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.company_site_id === '' ) {
      toast.error('Must have a company site');
      return;
    }

    if (formData.user_cart_order_id === '') {
      toast.error('Must be from an existing cart order');
      return;
    }

    // Create the payload matching the API format
    const payload = {
      warehouse_order: {
        company_site_id: Number(formData.company_site_id),
        inventory_id: Number(formData.inventory_id),
        user_id:  Number(formData.user_id),
        user_cart_order_id: Number(formData.user_cart_order_id),
        qty: Number(formData.qty),
        product_status: formData.product_status
      }
    };
    console.log(`handleSubmit payload:`, payload)
    createOrderMutation.mutate(payload);
  };
  console.log(`companySites`, companySites?.data)
  return (
    <div className="min-h-screen bg-transparent text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-black">
          <h1 className="text-3xl font-bold text-black mb-2">Create New Warehouse Order</h1>
          <p className="text-black">
            Manually add a warehouse order
          </p>
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
                  {companySites?.data
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
                  company_site_id: '',
                  inventory_id: '',
                  user_id: '',
                  user_cart_order_id: '',
                  qty: '',
                  product_status: ''
                });
              }}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={createOrderMutation.isPending}
              className="px-6 py-3 bg-[#11bb11] hover:bg-[#248324] disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {createOrderMutation.isPending ? 'Creating Order...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WarehouseOrderCreate