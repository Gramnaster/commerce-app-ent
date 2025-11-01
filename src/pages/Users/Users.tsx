import { toast } from "react-toastify";
import { customFetch } from "../../utils";
import type { Address } from "../Admin/AdminEdit";
import type { Pagination } from "../Products/Products";
import { NavLink, useLoaderData } from "react-router-dom";
import { useState } from "react";
import type { RootState } from "../../store";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import type { UserCartOrder } from "../Home/Dashboard";

export interface Phone {
  id: number;
  phone_type: 'mobile' | 'work' | 'home';
  phone_no: string;
}

export interface UserDetail {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  dob: string;
}

export interface UserPaymentMethod {
  id: number;
  balance: string;
  payment_type: 'e_wallet' | null;
}

export interface SocialProgram {
  id: number;
  title: string;
  description: string;
}

export interface Receipt {
  id: number;
  transaction_type: 'purchase' | 'withdraw' | 'deposit' | 'donation';
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  user_cart_order_id: number | null;
  social_programs: SocialProgram;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  is_verified: boolean;
  confirmed_at: string | null;
  user_detail: UserDetail;
  phones: Phone[];
  user_adresses: Address[];
  user_payment_methods: UserPaymentMethod[];
  created_at: string;
  receipts: Receipt[];
  user_cart_orders: UserCartOrder[]
}

export interface Data {
  users: User[];
}

export interface UserResponse {
  data: Data;
  pagination: Pagination;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

  const UsersQuery = {
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await customFetch.get(`/users`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const [Users] = await Promise.all([
      queryClient.ensureQueryData(UsersQuery)
    ]);
    return { Users };
  } catch (error: any) {
    console.error('Failed to load Users data:', error);
    toast.error('Failed to load Users data');
    return { Users: [] };
  }
};

const Users = () => {
  const { Users: initialUsers } = useLoaderData() as {
    Users: UserResponse
  };
  const [searchWord, setSearchWord] = useState('');
  const [usersData, setUsersData] = useState(initialUsers);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.userState.user);

  const handlePagination = async (page: number | null) => {
    if (!page) return;
    setLoading(true)
    
    try {
      const response = await customFetch.get(`/users?page=${page}&per_page=${usersData.pagination.per_page || 20}`);
      const data = response.data;
      console.log('Users handlePagination - Response:', data);
      setUsersData(data);
      setLoading(false);
    }
    catch (error: any) {
      console.error('Users handlePagination - Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
    }
  }
  
  const { data: users = [] } = useQuery({
    queryKey: ['users', user?.id],
    queryFn: async () => {
      const response = await customFetch.get('/product_categories', {
        headers: {
          Authorization: user?.token,
        },
      });
      return response.data;
    },
    initialData: initialUsers,
    refetchOnWindowFocus: false,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };
  console.log(`Users users`, users)
  console.log(`Users users.data`, users.data)
  console.log(`Users users.data val`, Object.values(users.data.users))

  const filteredUsers = Object.values(users.data.users).filter((user: User) => {
    const matchesSearch =
      user.id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchWord.toLowerCase()) ||
      user.is_verified?.toString().includes(searchWord.toLowerCase()) ||
      user.user_detail?.first_name.includes(searchWord.toLowerCase()) ||
      user.user_detail?.middle_name?.includes(searchWord.toLowerCase()) ||
      user.user_detail?.last_name.includes(searchWord.toLowerCase()) ||
      user.created_at.includes(searchWord.toLowerCase()) ||
      user.phones?.some(
        (phone) =>
          phone.phone_no.toLowerCase().includes(searchWord.toLowerCase()) ||
          phone.phone_type.toLowerCase().includes(searchWord.toLowerCase())
      );
      user.user_adresses?.some(
        (address) =>
          address.unit_no.toLowerCase().includes(searchWord.toLowerCase()) ||
          address.street_no.toLowerCase().includes(searchWord.toLowerCase()) ||
          address.address_line1.toLowerCase().includes(searchWord.toLowerCase()) ||
          address.address_line2.toLowerCase().includes(searchWord.toLowerCase()) ||
          address.city.toLowerCase().includes(searchWord.toLowerCase()) ||
          address.region.toLowerCase().includes(searchWord.toLowerCase()) ||
          address.zipcode.toLowerCase().includes(searchWord.toLowerCase()) ||
          address.country.toLowerCase().includes(searchWord.toLowerCase())
      );

      return matchesSearch;
      })
      .sort(
        (a: User, b: User) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || [];

    const { current_page, total_pages, next_page, previous_page } = users.pagination || {
      current_page: 1,
      per_page: 20,
      total_pages: 1,
      next_page: null,
      previous_page: null
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* <NavLink to={`/categories/create`} className={'btn bg-primary border-primary rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-white hover:text-primary hover:border-primary'}>
          Create Category
        </NavLink> */}
        {(
          <>
            {/* Search and Filter */}
            <div className="bg-primary rounded-lg p-6 border border-primary mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search by Name or Date"
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    className="w-full bg-[white] border border-black rounded-lg p-3 pl-10 text-black placeholder-[#666666]"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <button className="p-3 bg-primary hover:bg-[#03529c] border border-[white] rounded-lg hover:cursor-pointer transition-colors">
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Traders Table */}
            <div className="bg-transparent rounded-lg border border-primary overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr className="border-b border-primary">
                      <th className="text-left p-4 text-s font-normal text-white">
                        User ID
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Name
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Verified?
                      </th> 
                      <th className="text-center p-4 text-s font-normal text-white">
                        Account creation date:
                      </th> 
                      <th className="text-center p-4 text-s font-normal text-white">
                        Admin Actions:
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    { loading ? 
                      <tr className='border-b text-[#000000] border-primary hover:bg-[hsl(0,0%,87%)] transition-colors'>
                        <td className="p-8 text-center" colSpan={10}>
                          <div className="h-screen flex items-center justify-center">
                            <span className="loading loading-ring loading-lg text-black">LOADING</span>
                          </div>
                        </td> 
                      </tr>
                     : filteredUsers.length > 0 ? (
                      filteredUsers.map((user: User, index: number) => (
                        <tr
                          key={user.id}
                          className={`border-b text-[#000000] border-primary hover:bg-white transition-colors ${
                            index % 2 === 0 ? 'bg-transparent' : 'bg-[#f3f3f3]'
                          }`}
                        >
                          <td className="p-4 text-m text-left">
                            {user.id}
                          </td>
                          <td className="p-4 text-m text-center">
                             {user.user_detail.first_name} {user.user_detail.middle_name || null} {user.user_detail.last_name}
                          </td>
                          <td className="p-4 text-m text-center">
                             {user.is_verified ? 'Yes' : 'No'}
                          </td>
                          <td className={`p-4 text-m text-center`}>
                            {formatDate(user.created_at)}
                          </td>
                          <td className={`p-4 text-m text-center`}>
                            <NavLink to={`/users/${user.id}`}><span className='hover:text-primary hover:underline'>View User Info</span></NavLink>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="w-full">
                        <td
                          colSpan={6}
                          className="p-8 w-full text-center text-black text-m bg-transparent"
                        >
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      {total_pages && total_pages > 1 && (
        <div className="join mt-6 flex justify-center">
          <input
            className="join-item btn btn-square border-black" 
            type="radio" 
            name="options" 
            onClick={() => handlePagination(previous_page)}
            disabled={!previous_page}
            aria-label="❮" 
          />
          {[...Array(total_pages).keys()].map((_, i) => {
            const pageNum = i + 1;
            return (
              <input 
                key={i} 
                className="join-item btn btn-square border-black" 
                type="radio" 
                name="options" 
                checked={current_page === pageNum}
                onClick={() => handlePagination(pageNum)}
                aria-label={`${pageNum}`} 
                readOnly
              />
            );
          })}
          <input
            className="join-item btn btn-square border-black" 
            type="radio" 
            name="options" 
            onClick={() => handlePagination(next_page)}
            disabled={!next_page}
            aria-label="❯" 
          />
        </div>
      )}
    </div>
  )
}

export default Users