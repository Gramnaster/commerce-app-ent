import { redirect, useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Producer } from '../Products/Products';
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { SubmitBtn, PhilippineAddressFields } from "../../components";

export interface User {
  id: number;
  email: string;
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

  const ProducersQuery = {
    queryKey: ['ProducerDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/producers/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      console.log(`ProducerEdit response.data`, response.data)
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

  try {
    const [ countries, ProducerDetails] = await Promise.all([
      queryClient.ensureQueryData(countriesQuery),
      queryClient.ensureQueryData(ProducersQuery),
    ])
    return { countries, ProducerDetails };
  } catch (error: any) {
    console.error('Failed to load producer:', error);
    toast.error('Failed to load producer details');
    return redirect('/products');
  }
};

const ProducerEdit = () => {
  const { ProducerDetails, countries } = useLoaderData() as {
    ProducerDetails: { data: Producer };
    countries: { data: Country[] };
  }
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id, title, address: { id: address_id, unit_no, street_no, address_line1, address_line2, barangay, city, region, zipcode, country_id} } = ProducerDetails.data

  const user = useSelector((state: RootState) => state.userState.user);

  const [formData, setFormData] = useState({
    title: title,
    address_attributes: {
      id: address_id,
      unit_no: unit_no,
      street_no: street_no,
      address_line1: address_line1,
      address_line2: address_line2,
      barangay: barangay,
      city: city,
      region: region,
      zipcode: zipcode,
      country_id: country_id
    }
  })

  const updateProductMutation = useMutation({
    mutationFn: async (producerData: any) => {
      const response = await customFetch.patch(
        `/producers/${id}`,
        {
          producer: producerData,
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
      toast.success('Producer Details updated successfully');
      queryClient.invalidateQueries({ queryKey: ['producers', id] });
      navigate(`/producers/${id}`);
    },
    onError: (error: any) => {
      console.error('Update failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to update producer';
      toast.error(errorMessage);
    },
  });
  
  const NESTED_FIELDS: Record<string, string> = {
      unit_no: "address_attributes",
      street_no: "address_attributes",
      address_line1: "address_attributes",
      address_line2: "address_attributes",
      barangay: "address_attributes",
      city: "address_attributes",
      region: "address_attributes",
      zipcode:  "address_attributes",
      country_id: "address_attributes"
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const parentKey = NESTED_FIELDS[name];

    setFormData((prev) => {
      if (parentKey) {
        return {
      ...prev,
      [parentKey]: {
      ...(prev[parentKey as keyof typeof prev] as any),
      [name]: value,
        },
      }
    }
    return {
      ...prev,
      [name]: value,
    }
  });
  };

  // Handler for Philippine address fields
  const handleAddressFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address_attributes: {
        ...prev.address_attributes,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`handleSubmit formData:`, formData)
    // Create the payload matching the API format
    const payload = {
      ...formData,
    };
    console.log(`ProducerEdit payload:`, payload)
    updateProductMutation.mutate(payload);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this producer?")) return;
  
    console.log(`handleSubmit formData:`, formData)
    navigate(`/producers`)
    // Create the payload matching the API format
   try {
      const response = await customFetch.delete(`/producers/${id}`,
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      redirect('/producers');
      toast.success('Producer deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('Failed to load producer:', error);
      toast.error('Failed to load producer details');
      return redirect('/producers');
    }
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-black">
          <button
            onClick={() => navigate(`/producers/${ProducerDetails.data.id}`)}
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
            Back to Producer View
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">Edit Producer Interface</h1>
          <button type="button" onClick={handleDelete} className="text-primary hover:underline hover:cursor-pointer">Delete Producer?</button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-primary rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white">
              Producer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-3">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Producer's Name
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
            </div>
          <div className="bg-primary rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white">
              Producer Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Unit No
                </label>
                <input
                  type="text"
                  name="unit_no"
                  value={formData.address_attributes.unit_no}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Street No
                </label>
                <input
                  type="text"
                  name="street_no"
                  value={formData.address_attributes.street_no}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.address_attributes.address_line1}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address_line2"
                  value={formData.address_attributes.address_line2}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Philippine Address Fields */}
            <div className="mt-6">
              <PhilippineAddressFields
                initialRegion={region || ''}
                initialCity={city || ''}
                initialBarangay={barangay || ''}
                onAddressChange={handleAddressFieldChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Zipcode
                </label>
                <input
                  type="text"
                  name="zipcode"
                  value={formData.address_attributes.zipcode}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Country *
                </label>
                <select
                  name="country_id"
                  value={formData.address_attributes.country_id}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                >
                  <option value="">Select Country...</option>
                  {countries.data
                    .slice()
                    .sort((a: Country, b: Country) => a.name.localeCompare(b.name))
                    .map((country: Country) => (
                      <option key={country.id} value={country.id} className="text-black">
                        {country.name} ({country.code})
                      </option>
                    ))}
                </select>
              </div>              
            </div>
          </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/producers/${ProducerDetails.data.id}`)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <SubmitBtn text="Submit" />
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProducerEdit