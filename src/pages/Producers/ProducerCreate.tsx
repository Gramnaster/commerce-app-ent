import { redirect, useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { SubmitBtn } from "../../components";

interface Country {
  id: number;
  name: string;
  code: string;
}

export const loader = (queryClient: any) => async () => {
  const countriesQuery = {
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await customFetch.get('/countries');
      return response.data;
    },
  };

  try {
    const [ countries ] = await  Promise.all([
      queryClient.ensureQueryData(countriesQuery)
    ])
    return { countries };
  } catch (error: any) {
    console.error('Failed to load product:', error);
    toast.error('Failed to load product details');
    return redirect('/products');
  }
};

const ProducerCreate = () => {
  const { countries } = useLoaderData() as {
    countries: { data: Country[] };
  };
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.userState.user);

  const [formData, setFormData] = useState({
    title: "",
    address_attributes: {
      unit_no: "",
      street_no: "",
      address_line1: "",
      address_line2: "",
      city: "",
      region: "",
      zipcode: "",
      country_id: 0,
      country: ""
    }
  })

  const NESTED_FIELDS: Record<string, string> = {
      unit_no: "address_attributes",
      street_no: "address_attributes",
      address_line1: "address_attributes",
      address_line2: "address_attributes",
      city: "address_attributes",
      region: "address_attributes",
      zipcode:  "address_attributes",
      country_id: "address_attributes",
      country: "address_attributes"
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`handleSubmit formData:`, formData)

    try {
      const response = await customFetch.post('/producers', 
        { 
          producer: formData
        },
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('Producer created successfully');
      navigate('/producers');
      return response.data;
    } catch (error: any) {
      console.error('Failed to load producer:', error);
      toast.error('Failed to load producer details');
      return redirect('/producers');
    }
  };

  return (
<div className="min-h-screen bg-[hsl(5,100%,98] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-black">
          <button
            onClick={() => navigate('/producers')}
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
            Back to Producer List
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">Create Producer Interface</h1>
          <p className="text-black">
            Create a Producer
          </p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-primary rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-white">
              Producer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.address_attributes.city}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Region
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.address_attributes.region}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent"
                  required
                />
              </div>
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
                      <option key={country.id} value={country.id}
                      className="text-black">
                        {country.name} ({country.code})
                      </option>
                    ))}
                </select>
              </div>              
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/products`)}
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

export default ProducerCreate