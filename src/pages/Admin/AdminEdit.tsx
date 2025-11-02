import { redirect, useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { SubmitBtn } from "../../components";

export interface Address {
  id: number,
  unit_no: string;
  street_no: string;
  address_line1: string;
  address_line2: string;
  city: string;
  region: string;
  zipcode: string;
  country_id: number;
  country: string;
}

interface CompanySite {
  id: number;
  title: string;
  site_type: "management" | "warehouse";
  address: Address
}

interface Country {
  id: number;
  name: string;
  code: string;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;

  const id = params.id;

  const AdminDetailsQuery = {
    queryKey: ['AdminDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/admin_users/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  const countriesQuery = {
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await customFetch.get('/countries');
      return response.data;
    },
  };

  const companySitesQuery = {
    queryKey: ['CompanySites'],
    queryFn: async () => {
      const response = await customFetch.get('/company_sites');
      return response.data;
    },
  };

  try {
    const [ AdminDetails, Countries, CompanySites  ] = await Promise.all([
      queryClient.ensureQueryData(AdminDetailsQuery),
      queryClient.ensureQueryData(countriesQuery),
      queryClient.ensureQueryData(companySitesQuery)
    ])
    return { AdminDetails, Countries, CompanySites };
  } catch (error: any) {
    console.error('Failed to load admin details:', error);
    toast.error('Failed to load admin details');
    return redirect('/admins');
  }
};

const AdminEdit = () => {
  const { AdminDetails, Countries, CompanySites } = useLoaderData() as{
    AdminDetails: { data: any },
    Countries: { data: Country[] },
    CompanySites: CompanySite[]
  }
    const user = useSelector((state: RootState) => state.userState.user);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
      email: AdminDetails.data.email || '',
      admin_role: AdminDetails.data.admin_role || '',
      admin_detail_attributes: {
        first_name: AdminDetails.data.admin_detail?.first_name || '',
        middle_name: AdminDetails.data.admin_detail?.middle_name || '',
        last_name: AdminDetails.data.admin_detail?.last_name || '',
        dob: AdminDetails.data.admin_detail?.dob || ''
      },
      admin_phones_attributes: AdminDetails.data.admin_phones?.length
        ? AdminDetails.data.admin_phones
        : [{ phone_no: '', phone_type: 'mobile' }],
      admin_addresses_attributes: AdminDetails.data.admin_addresses?.length
        ? AdminDetails.data.admin_addresses
        : [{
            is_default: true,
            address_attributes: {
              unit_no: '',
              street_no: '',
              address_line1: '',
              address_line2: '',
              city: '',
              region: '',
              zipcode: '',
              country_id: Countries?.[0]?.id || ''
            }
          }],
      admin_users_company_sites_attributes: AdminDetails.data.company_sites?.length
        ? AdminDetails.data.company_sites
        : [{ company_site_id: CompanySites?.data?.[0]?.id || '' }]
    });
  
    const updateAdminMutation = useMutation({
      mutationFn: async (AdminData: any) => {
        const response = await customFetch.patch(
          `/admin_users/${AdminDetails.data.id}`,
          {
            admin_user: AdminData,
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
        toast.success('Admin Details updated successfully');
        queryClient.invalidateQueries({ queryKey: ['AdminUser', AdminDetails.data.id] });
        navigate(`/admins/${AdminDetails.data.id}`);
      },
      onError: (error: any) => {
        console.error('Update failed:', error);
        const errorMessage =
          error.response?.data?.message || 'Failed to update user';
        toast.error(errorMessage);
      },
    });

    const NESTED_FIELDS: Record<string, string> = {
      first_name: 'admin_detail_attributes',
      middle_name: 'admin_detail_attributes',
      last_name: 'admin_detail_attributes',
      dob: 'admin_detail_attributes',

      unit_no: 'admin_addresses_attributes',
      street_no: 'admin_addresses_attributes',
      address_line1: 'admin_addresses_attributes',
      address_line2: 'admin_addresses_attributes',
      city: 'admin_addresses_attributes',
      region: 'admin_addresses_attributes',
      zipcode: 'admin_addresses_attributes',
      country_id: 'admin_addresses_attributes',
      
      phone_no: 'admin_phones_attributes',
      phone_type: 'admin_phones_attributes',

      company_site_id: 'admin_users_company_sites_attributes'
    };

const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  addressIndex?: number,
  phoneIndex?: number,
  siteIndex?: number
) => {
  const { name, value } = e.target;
  const parentKey = NESTED_FIELDS[name];

  setFormData((prev) => {
    if (parentKey === 'admin_detail_attributes') {
      return {
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [name]: value,
        },
      };
    }
    if (parentKey === 'admin_addresses_attributes' && addressIndex !== undefined) {
      const updated = [...prev.admin_addresses_attributes];
      updated[addressIndex] = {
        ...updated[addressIndex],
        address_attributes: {
          ...updated[addressIndex].address_attributes,
          [name]: value,
        },
      };
      return { ...prev, admin_addresses_attributes: updated };
    }

    if (parentKey === 'admin_users_company_sites_attributes' && siteIndex !== undefined) {
      const updated = [...prev.admin_users_company_sites_attributes];
      updated[siteIndex] = { ...updated[siteIndex], [name]: value };
      return { ...prev, admin_users_company_sites_attributes: updated };
    }
  
    if (parentKey === 'admin_phones_attributes' && phoneIndex !== undefined) {
      const updated = [...prev.admin_phones_attributes];
      updated[phoneIndex] = { ...updated[phoneIndex], [name]: value };
      return { ...prev, admin_phones_attributes: updated };
    }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
    };
    
    console.log(`handleSubmit formData`, formData)
    updateAdminMutation.mutate(payload);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    
      console.log(`handleSubmit formData:`, formData)
      navigate(`/admins`)
    try {
      const response = await customFetch.delete(`/admin_users/${AdminDetails.data.id}`,
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      redirect('/admins');
      toast.success('Admin deleted successfully');
        return response.data;
      } catch (error: any) {
        console.error('Failed admin deletion:', error);
        toast.error('Failed to delete admin');
        return redirect('/admins');
    }
  };
  
  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-black">
          <button
            onClick={() => navigate(`/admins/${AdminDetails.data.id}`)}
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
            Back to Admin View
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">Edit Admin</h1>
          <p className="text-black">
            Editing information for {formData.admin_detail_attributes.first_name || ''}{' '} 
            {formData.admin_detail_attributes.last_name || ''}{' '}
          </p>
          <button type="button" onClick={handleDelete} className="text-primary hover:underline hover:cursor-pointer">Delete Admin?</button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-primary rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.admin_detail_attributes.first_name}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.admin_detail_attributes.middle_name}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.admin_detail_attributes.last_name}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.admin_detail_attributes.dob}
                  onChange={handleInputChange}
                  min="1900-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
            </div>

          {/* Address Information */}
          {/* <div className="bg-transparent rounded-lg p-6 border border-gray-700"> */}
            <h2 className="text-xl font-bold text-white mb-4 pb-2 pt-4 border-b border-white">
              Address Information
            </h2>
            {formData.admin_addresses_attributes.map((adminAddress: any, index: number) => { 
              return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" key={adminAddress.id}>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Unit No. 
                </label>
                <input
                  type="text"
                  name="unit_no"
                  value={adminAddress.unit_no}
                  onChange={(e) => handleInputChange(e, index)}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Street No.
                </label>
                <input
                  type="text"
                  name="street_no"
                  value={adminAddress.street_no}
                  onChange={(e) => handleInputChange(e, index)}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="address_line1"
                  value={adminAddress.address_line1}
                  onChange={(e) => handleInputChange(e, index)}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address_line2"
                  value={adminAddress.address_line2}
                  onChange={(e) => handleInputChange(e, index)}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={adminAddress.city}
                  onChange={(e) => handleInputChange(e, index)}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zipcode"
                  value={adminAddress.zipcode}
                  onChange={(e) => handleInputChange(e, index)}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-white text-sm font-medium mb-2">
                  Country *
                </label>
                <select
                  name="country_id"
                  value={adminAddress.country_id}
                  onChange={(e) => handleInputChange(e, index)}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                >
                  <option value="" className="text=black">Select Country...</option>
                  {Countries.data
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((country) => (
                      <option key={country.id} value={country.id} className="text-black">
                        {country.name} ({country.code})
                      </option>
                    ))}
                </select>
              </div>
            </div>
            )})}
          {/* </div> */}

          {/* Phones */}
            <h2 className="text-xl font-bold text-white mb-4 pt-4 pb-2 border-b border-white">
              Phone Numbers
            </h2>
            {formData.admin_phones_attributes.map((phoneNumber: any, index: number) => { 
              return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" key={phoneNumber.id}>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="number"
                  name="phone_no"
                  value={phoneNumber.phone_no}
                  onChange={(e) => handleInputChange(e, undefined, index)}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Type:
                </label>
                <input
                  type="radio"
                  name="phone_type"
                  value="work"
                  checked={phoneNumber.phone_type === 'work'}
                  onChange={(e) => handleInputChange(e, undefined, index)}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                />
                <div>Work</div>
                <input
                  type="radio"
                  name="phone_type"
                  value="home"
                  checked={phoneNumber.phone_type === 'home'}
                  onChange={(e) => handleInputChange(e, undefined, index)}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                />
                <div>Home</div>
                <input
                  type="radio"
                  name="phone_type"
                  value="mobile"
                  checked={phoneNumber.phone_type === 'mobile'}
                  onChange={(e) => handleInputChange(e, undefined, index)}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                />
                <div>Mobile</div>
              </div>
            </div>
            )})}
          {/* </div> */}
          
          {/*Company Site*/}
          {formData.admin_users_company_sites_attributes.map((site: CompanySite, index: number) => (
          <div key={index}>
            <label className="block text-white text-sm font-medium mb-2">
              Company Site *
            </label>
            <select
              name="company_site_id"
              value={site?.company_site_id}
              onChange={(e) => handleInputChange(e, undefined, undefined, index)} // ✅ pass index
              className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
              required
            >
              <option value="" className="text-black">Select Site...</option>
              {CompanySites.data
                .slice()
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((siteOption: CompanySite) => (
                  <option key={siteOption.id} value={siteOption.id} className="text-black">
                    {siteOption.title} ({siteOption.site_type})
                  </option>
                ))}
            </select>
          </div>
        ))}
        </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/admins/${AdminDetails.data.id}`)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <SubmitBtn text="Update User" isSubmitting={updateAdminMutation.isPending} loadingText="Updating..." />
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminEdit