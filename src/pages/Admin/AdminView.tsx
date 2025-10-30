import { NavLink, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";

interface Address {
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

interface AdminPhone {
  id: number;
  phone_no: number;
  phone_type: "mobile" | "work" | "home";
}

interface AdminAddress {
  id: number;
  is_default: boolean;
  address: Address
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
  const user = storeState.userState?.user;

  const id = params.id;

  const AdminDetailsQuery = {
    queryKey: ['AdminDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/admin_users/${id}`, {
        headers: {
          Authorization: user.token,
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

  try {
    const [ AdminDetails, Countries  ] = await Promise.all([
      queryClient.ensureQueryData(AdminDetailsQuery),
      queryClient.ensureQueryData(countriesQuery)
    ])
    return { AdminDetails, Countries };
  } catch (error: any) {
    console.error('Failed to load admin details:', error);
    toast.error('Failed to load admin details');
    return redirect('/admins');
  }
};

const AdminView = () => {
  const { AdminDetails, Countries } = useLoaderData() as{
    AdminDetails: { data: any },
    Countries: { data: Country[] }
  }
  const navigate = useNavigate();
  const { id, email, admin_role, admin_detail: {first_name, last_name, dob }, admin_phones, admin_addresses, company_sites } = AdminDetails.data
  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto place-items-center ">
        <div className="mb-6 text-black">
          <button
          onClick={() => navigate(`/admins`)}
          className="mb-4 flex items-center gap-2 hover:underline transition-colors text-black">
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
          Back to Admins list
        </button>
      </div>

      <div className="w-[60%] bg-primary rounded-lg p-6 border border-gray-700">
        <div className=" mb-4 pb-2 border-b border-white flex items-center justify-between gap-1">
          <h2 className="text-xl font-bold text-white">
            Admin Information
          </h2>
          <NavLink to={`/admins/edit/${id}`}>
            <button className="btn bg-white border-primary text-l rounded-[8px] text-primary p-2 pt-1 pb-1 m-1 hover:border-[hsl(5,100%,98%)] hover:bg-primary hover:text-white">
              Edit Admin Info
            </button>
          </NavLink>
        </div>
      <div>
      </div>
          <div className="place-items-center text-[black] w-full">
            <div className=" px-6 py-3 rounded-2xl bg-white w-full">
              <div className="m-1">
                <label className="block text-l font-bold mb-2">
                  Admin ID:
                </label>
                <div>
                  {id}
                </div>
              </div>
              <div className="m-1">
                <label className="block text-l font-bold mb-2">
                  Email
                </label>
                {email}
              </div>
              <div className="m-1">
                <label className="block text-l font-bold mb-2">
                  Role
                </label>
                {admin_role}
              </div>
              <div className="pl-2">
                <div className="border-b border-black p-1 font-bold">
                  Admin Details:
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">
                    First Name
                  </label>
                  {first_name}
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">
                    Last Name
                  </label>
                  {last_name}
                </div>
                <div className="m-1">
                  <label className="block text-l font-bold mb-2">
                    Date of Birth
                  </label>
                  {dob}
                </div>
              </div>
              <div className="pl-2">
                <div className="border-b border-black p-1 font-bold pl-2">
                  Phone Numbers:
                </div>
                  <div className="pl-2 m-1">
                  {admin_phones.length !== 0 ? admin_phones.map((phone_number: AdminPhone) => {
                    const { id, phone_no, phone_type } = phone_number
                    return (
                      <div key={id}>
                        <div><div className="font-medium">Number:</div> {phone_no}</div>
                        <div><div className="font-medium">Phone Type:</div> {phone_type}</div>
                      </div>
                    )
                    }) : "User has no phone number"}
                </div>
              </div>
              <div className="pl-2">
                <div className="border-b border-black p-1 font-bold pl-2">
                  Admin Addresses:
                </div>
                  <div className="pl-2 m-1">
                    {admin_addresses.length !== 0 ? admin_addresses.map((adminAddress: AdminAddress) => {
                      const { id, is_default, address: { unit_no, street_no, address_line1, address_line2, city, region, zipcode, country_id} } = adminAddress
                      return (
                        <div key={id}>
                          <div><div className="font-medium">Unit #:</div> {unit_no}</div>
                          <div><div className="font-medium">Street #:</div> {street_no}</div>
                          <div><div className="font-medium">Address Line 1:</div> {address_line1 ? address_line1 : "N/A"}</div>
                          <div><div className="font-medium">Address Line 2:</div> {address_line2 ? address_line2 : "N/A"}</div>
                          <div><div>City:</div> {city}</div>
                          <div><div className="font-medium">Region:</div> {region}</div>
                          <div><div className="font-medium">Zipcode:</div> {zipcode}</div>
                          <div><div className="font-medium">Country:</div> {Countries.data.find((country: Country) => Number(country.id) === Number(country_id))?.name ?? "Country invalid"}</div>
                          <div><div className="font-medium">Default address?:</div> { is_default ? "Yes" : "No" }</div>
                        </div>
                      )
                    }) : "No address" }
                </div>
              </div>
              <div className="pl-2">
                <div className="border-b border-black p-1 font-bold pl-2">
                  Company Sites:
                </div>
                  <div className="pl-2 m-1">
                    {company_sites.length !== 0 ? company_sites.map((site: CompanySite) => {
                      const { id, title, address: { unit_no, street_no, address_line1, address_line2, city, region, zipcode, country_id} } = site
                      return (
                        <div key={id}>
                          <div><div className="font-medium">Site title:</div> {title}</div>
                          <div><div className="font-medium">Unit #:</div> {unit_no}</div>
                          <div><div className="font-medium">Street #:</div> {street_no}</div>
                          <div><div className="font-medium">Address Line 1:</div> {address_line1 ? address_line1 : "N/A"}</div>
                          <div><div className="font-medium">Address Line 2:</div> {address_line2 ? address_line2 : "N/A"}</div>
                          <div><div className="font-medium">City:</div> {city}</div>
                          <div><div className="font-medium">Region:</div> {region}</div>
                          <div><div className="font-medium">Zipcode:</div> {zipcode}</div>
                          <div><div className="font-medium">Country:</div> {Countries.data.find((country: Country) => Number(country.id) === Number(country_id))?.name ?? "Country invalid"} </div>
                        </div>
                      )
                    }) : "Does not belong to any site"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminView