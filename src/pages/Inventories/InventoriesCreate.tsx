import { Form, Link, redirect, useLoaderData, useNavigate, useNavigation, type ActionFunctionArgs } from "react-router-dom";
import { customFetch } from "../../utils";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { FormInput, SubmitBtn } from "../../components";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useState } from "react";
import type { CompanySite, CompanySiteResponse } from "../WarehouseOrders/WarehouseOrders";

export const loader = (queryClient: any, store: any) => async () => {

  const CompanySitesQuery = {
    queryKey: ['CompanySites'],
    queryFn: async () => {
      const response = await customFetch.get('/company_sites');
      return response.data;
    },
  };

  try {
    const [ companySites ] = await  Promise.all([
      queryClient.ensureQueryData(CompanySitesQuery)
    ])
    return { companySites };
  } catch (error: any) {
    console.error('Failed to load product:', error);
    toast.error('Failed to load product details');
    return redirect('/products');
  }
};

const InventoriesCreate = () => {
  const { companySites } = useLoaderData() as {
    companySites: CompanySiteResponse;
  };
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.userState.user);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [formData, setFormData] = useState({
    company_site_id: "",
    product_id: "",
    qty_in_stock: ""
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
        return {
      ...prev,
      [name]: value
      }});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await customFetch.post('/inventories', 
        { 
          inventory: formData
        },
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`InventoryCreate response`, response)
      toast.success('Inventory created successfully');
      navigate('/inventories');
      return response.data;
    } catch (error: any) {
      console.error('Failed to create inventory:', error);
      toast.error('Failed creation');
      return redirect('/inventories');
    }
  }; 
  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-black">
          <button
            onClick={() => navigate('/inventories')}
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
            Back to Inventories List
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">Create Inventory Interface</h1>
          <p className="text-black">
            Create Inventory
          </p>
        </div>

        {/* Create Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-primary rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white">
              Inventory Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  {companySites?.data
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
                  Product ID
                </label>
                <input
                  type="text"
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

export default InventoriesCreate