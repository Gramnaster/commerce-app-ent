import { NavLink, redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import type { RootState } from '../../store';
import { useQuery } from '@tanstack/react-query';
import type { Pagination } from '../Products/Products'
import { SearchBar, PaginationControls } from '../../components'

interface AdminUser {
  id: number;
  email: string;
  admin_role: string;
  created_at: string;
}

export interface AdminUserResponse {
  admin_users: AdminUser[];
  pagination: Pagination;
}

export const loader = (queryClient: any, store: any) => async () => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;

  if (!admin_user || admin_user.admin_role !== 'management') {
    toast.warn('There must be something wrong. Please refresh the page.');
    return redirect('/');
  }

  const AdminUsersQuery = {
    queryKey: ['admin_users', admin_user.id],
    queryFn: async () => {
      const response = await customFetch.get('/admin_users', {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const [ AdminUsers ] = await Promise.all([queryClient.ensureQueryData(AdminUsersQuery)])
    console.log(`Admins AdminUsers`, AdminUsers)
    return { AdminUsers };
  } catch (error: any) {
    console.error('Failed to load admins:', error);
    toast.error('Failed to load admin list');
    return { users: [] };
  }
};

const Admins = () => {
  const { AdminUsers: initialAdmins } = useLoaderData() as {
    AdminUsers: AdminUserResponse
  }

  const [searchWord, setSearchWord] = useState('');
  const user = useSelector((state: RootState) => state.userState.user);
  const [adminData, setAdminData] = useState(initialAdmins);
  const [loading, setLoading] = useState(false);
    const handlePagination = async (page: number | null) => {
    if (!page) return;
    setLoading(true)
    
    try {
      const response = await customFetch.get(`/admin_users?page=${page}&per_page=${adminData.pagination.per_page || 20}`);
      const data = response.data;
      setAdminData(data);
      setLoading(false);
    }
    catch (error: any) {
      console.error('Products handlePagination - Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
    }
  }

  useQuery({
    queryKey: ['admin', user?.id],
    queryFn: async () => {
      const response = await customFetch.get('/admin_users', {
        headers: {
          Authorization: user?.token,
        },
      });
      return response.data;
    },
    initialData: initialAdmins,
    refetchOnWindowFocus: false,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
  const filteredAdmins = Object.values(adminData.admin_users as AdminUser[]).filter((admin: AdminUser) => {
      const matchesSearch =
        admin.id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchWord.toLowerCase()) ||
        admin.admin_role?.toString().includes(searchWord.toLowerCase()) ||
        admin.created_at?.toString().includes(searchWord.toLowerCase());

      return matchesSearch;
      })
      .sort(
        (a: AdminUser, b: AdminUser) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || [];

    const { current_page, total_pages } = adminData.pagination || {
    current_page: 1,
    per_page: 20,
    total_pages: 1,
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <NavLink to={`/admins/create`} className={'btn bg-primary border-primary rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-white hover:text-primary hover:border-primary'}>
          Create Admin
        </NavLink>
        {(
          <>
            {/* Search and Filter */}
            <SearchBar
              searchValue={searchWord}
              onSearchChange={(e) => setSearchWord(e.target.value)}
              placeholder="Search by Name or Date"
            />

            {/* Traders Table */}
            <div className="bg-transparent rounded-lg border border-primary overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr className="border-b border-primary">
                      <th className="text-left p-4 text-s font-normal text-white">
                        ID
                      </th>
                      <th className="text-left p-4 text-s font-normal text-white">
                        Email
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Role
                      </th> 
                      <th className="text-center p-4 text-s font-normal text-white">
                        Creation/Addition Date
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
                    : filteredAdmins && filteredAdmins.length > 0 ? (
                      filteredAdmins.map((admin: AdminUser, index: number) => (
                        <tr
                          key={admin.id}
                          className={`border-b text-[#000000] border-primary hover:bg-white transition-colors ${
                            index % 2 === 0 ? 'bg-transparent' : 'bg-[#f3f3f3]'
                          }`}
                        >
                          <td className="p-4 text-m text-left">
                            {admin.id}
                          </td>
                          <td className="p-4 text-m text-center">
                             {admin.email}
                          </td>
                          <td className="p-4 text-m text-center">
                             {admin.admin_role}
                          </td>
                          <td className={`p-4 text-m`}>
                            {formatDate(admin.created_at)}
                          </td>
                          <td className={`p-4 text-m`}>
                            <NavLink to={`/admins/${admin.id}`}><span className='hover:text-primary hover:underline'>View Admin Info</span></NavLink>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="w-full">
                        <td
                          colSpan={6}
                          className="p-8 w-full text-center text-black text-m bg-transparent"
                        >
                          No admins found
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
      <PaginationControls
        currentPage={current_page || 1}
        totalPages={total_pages || 1}
        onPageChange={(page) => handlePagination(page)}
      />
    </div>
  )
}

export default Admins