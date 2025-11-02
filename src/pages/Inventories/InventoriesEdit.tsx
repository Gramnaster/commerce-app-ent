import { redirect, useLoaderData, useNavigate, useNavigation } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { InventoryViewResponse } from "./InventoriesView";
import type { CompanySite, CompanySiteResponse } from "../WarehouseOrders/WarehouseOrders";

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

  const InventoryDetailsQuery = {
    queryKey: ['InventoryDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/inventories/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  const CompanySitesQuery = {
    queryKey: ['CompanySites'],
    queryFn: async () => {
      const response = await customFetch.get('/company_sites');
      return response.data;
    },
  }; 

  try {
    const [ InventoryDetails, CompanySitesDetails ] = await Promise.all([
    queryClient.ensureQueryData(InventoryDetailsQuery),
    queryClient.ensureQueryData(CompanySitesQuery)
    ])
    console.log(`InventoriesEdit InventoryDetails`, InventoryDetails)
    return { InventoryDetails, CompanySitesDetails };
  } catch (error: any) {
    console.error('Failed to load InventoryDetails:', error);
    toast.error('Failed to load InventoryDetails list');
    return { InventoryDetails: [] };
  }
};

const InventoriesEdit = () => {
  const { InventoryDetails, CompanySitesDetails } = useLoaderData() as {
    InventoryDetails: InventoryViewResponse;
    CompanySitesDetails: CompanySiteResponse;
  }
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const user = useSelector((state: RootState) => state.userState.user);
  const { id, company_site: {id: company_site_id}, qty_in_stock, sku} = InventoryDetails.data

  const [formData, setFormData] = useState({
    company_site_id: company_site_id,
    qty_in_stock: qty_in_stock,
    sku: sku
  })

  const updateInventoryMutation = useMutation({
    mutationFn: async (inventoryData: any) => {
      const response = await customFetch.patch(
        `/inventories/${id}`,
        {
          inventory: inventoryData,
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
      toast.success('Inventory updated successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory', id] });
      navigate(`/inventories/${id}`);
    },
    onError: (error: any) => {
      console.error('Update failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to update inventory';
      toast.error(errorMessage);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
    return {
      ...prev,
      [name]: value,
    }
  });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create the payload matching the API format
    const payload = {
      ...formData,
    };
    
    updateInventoryMutation.mutate(payload);
  };

  const handleDelete = async (e: React.FormEvent) => {
  if (!confirm("Are you sure you want to delete this inventory?")) return;
  
    console.log(`handleSubmit formData:`, formData)
    navigate(`/inventories`)
    // Create the payload matching the API format
   try {
      const response = await customFetch.delete(`/inventories/${id}`,
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      redirect('/inventories');
      toast.success('Inventory deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('Failed to load promotion:', error);
      toast.error('Failed to load promotion details');
      return redirect('/inventories');
    }
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-black">
          <button
            onClick={() => navigate(`/inventories${id}`)}
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
            Back to Inventories View
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">Edit Inventory Interface</h1>
          <p className="text-black">
            Editing Inventory #{id}
          </p>
          <button type="button" onClick={handleDelete}>Delete Inventory?</button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-primary rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white">
              Inventory Information
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
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                >
                  <option value="" className='text-white'>Select Company Site</option>
                  {CompanySitesDetails?.data
                    .sort((a: CompanySite, b: CompanySite) => a.title.localeCompare(b.title))
                    .filter((site: CompanySite) => site.site_type !== 'management' )
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
                  Quantity in Stock
                </label>
                <input
                  type="text"
                  name="qty_in_stock"
                  value={formData.qty_in_stock}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
            </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
          </div>
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/inventories`)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#11bb11] hover:bg-[#248324] disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InventoriesEdit