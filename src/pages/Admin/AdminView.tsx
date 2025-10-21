import { NavLink, redirect, useLoaderData } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";

interface AdminUser {
  id: number;
  email: string;
  admin_role: string;
}

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
    AdminDetails: AdminUser,
    Countries: Country[]
  }
  const { id, email, admin_role, admin_detail: {first_name, middle_name, last_name, dob }, admin_phones, admin_addresses, company_sites } = AdminDetails.data
  console.log(`AdminView Countries`, Countries)
  return (
    <div>
      <NavLink to={`/admins/edit/${id}`}>Edit Admin details</NavLink>
      <div>Admin Details: </div>
      <div>
        ID: {id}
        Email: {email}
        Role: {admin_role}
        <div>
          <div>Admin Details</div>
          <div>First Name: {first_name}</div>
          <div>Middle Name: {middle_name}</div>
          <div>Last Name: {last_name}</div>
          <div>Date of Birth: {dob}</div>
        </div>
        <div>
          <div>Phone Numbers</div>
          <div>
            {admin_phones.map((phone_number: AdminPhone) => {
              const { id, phone_no, phone_type } = phone_number
              return (
                <div key={id}>
                  <div>Phone Number: {phone_no}</div>
                  <div>Phone Type: {phone_type}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div>
          <div>Admin Addresses</div>
          <div>
            {admin_addresses.map((adminAddress: AdminAddress) => {
              const { id, is_default, address: { unit_no, street_no, address_line1, address_line2, city, region, zipcode, country_id} } = adminAddress
              return (
                <div key={id}>
                  <div>Unit #: {unit_no}</div>
                  <div>Street #: {street_no}</div>
                  <div>Address Line 1: {address_line1}</div>
                  <div>Address Line 2: {address_line2}</div>
                  <div>City: {city}</div>
                  <div>Region: {region}</div>
                  <div>Zipcode: {zipcode}</div>
                  <div>Country: {Countries.find((country: Country) => country.id === country_id).name ?? "Country invalid" }</div>
                  <div>Default address?: { is_default ? "Yes" : "No" }</div>
                </div>
              )
            })}
          </div>
        </div>
        <div>
          <div>Company Sites</div>
          <div>
            {company_sites.map((site: CompanySite) => {
              const { id, title, address: { unit_no, street_no, address_line1, address_line2, city, region, zipcode, country_id} } = site
              return (
                <div key={id}>
                  <div>Site title: {title}</div>
                  <div>Unit #: {unit_no}</div>
                  <div>Street #: {street_no}</div>
                  <div>Address Line 1: {address_line1}</div>
                  <div>Address Line 2: {address_line2}</div>
                  <div>City: {city}</div>
                  <div>Region: {region}</div>
                  <div>Zipcode: {zipcode}</div>
                  <div>Country: {Countries.find((country: Country) => country.id === country_id).name ?? "Country invalid" } </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminView