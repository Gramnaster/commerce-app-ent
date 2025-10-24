import { NavLink, redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import type { RootState } from '../../store';
import { useQuery } from '@tanstack/react-query';

interface AdminUser {
  id: number;
  email: string;
  admin_role: string;
  created_at: string;
}

export const loader = (queryClient: any, store: any) => async () => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  console.log(`Admins admin_user`, admin_user)

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
    AdminUsers: AdminUser[]
  }
  // console.log(`Admins AdminUsers`, AdminUsers)
  // const adminList = Object.values(AdminUsers.admin_users)

  const [searchWord, setSearchWord] = useState('');
  const user = useSelector((state: RootState) => state.userState.user);

  const { data: admins = [] } = useQuery({
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
  console.log(`admins`, admins)

    const filteredAdmins = Object.values(admins.admin_users as AdminUser).filter((admin: AdminUser) => {
      const matchesSearch =
        admin.id.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchWord.toLowerCase()) ||
        admin.admin_role.toString().includes(searchWord.toLowerCase()) ||
        admin.created_at.toString().includes(searchWord.toLowerCase());

      return matchesSearch;
      })
      .sort(
        (a: AdminUser, b: AdminUser) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || [];

  return (
    // <div>
    //   <NavLink to={`/admins/create`}>Create Admin</NavLink>
    //   <div>
    //     {adminList.map((admin: any) => {
    //       const { id, email, admin_role } = admin
    //       return (
    //         <div key={id} className='m-1 border-b-[1px] flex flex-col'>
    //           Email: {email}
    //           Role: {admin_role}
    //           <NavLink to={`/admins/${id}`}>View Admin details</NavLink>
    //         </div>
    //       )
    //     })}
    //   </div>
    // </div>


    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <NavLink to={`/admins/create`} className={'btn bg-[#BE493D] border-[#BE493D] rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-[hsl(5,100%,98%)] hover:text-[#BE493D] hover:border-[#BE493D]'}>
          Create Admin
        </NavLink>
        {(
          <>
            {/* Search and Filter */}
            <div className="bg-[#BE493D] rounded-lg p-6 border border-[#75332d] mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search by Name or Date"
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    className="w-full bg-[hsl(5,100%,98%)] border border-[#75332d] rounded-lg p-3 pl-10 text-black placeholder-[#c27971]"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#75332d]"
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
                <button className="p-3 bg-[#924b43] hover:bg-[#743b35] border border-[#75332d] rounded-lg hover:cursor-pointer transition-colors">
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
            <div className="bg-[hsl(5,100%,98%)] rounded-lg border border-[hsl(5,100%,80%)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#BE493D]">
                    <tr className="border-b border-[#75332d]">
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
                    {filteredAdmins.length > 0 ? (
                      filteredAdmins.map((admin: AdminUser, index: number) => (
                        <tr
                          key={admin.id}
                          className={`border-b text-[#000000] border-[hsl(5,100%,80%)] hover:bg-[hsl(4,81%,90%)] transition-colors ${
                            index % 2 === 0 ? 'bg-[hsl(5,100%,98%)]' : 'bg-[hsl(5,100%,98%)]'
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
                            <NavLink to={`/admins/${admin.id}`}><span className='hover:text-[#BE493D] hover:underline'>View Admin Info</span></NavLink>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="w-full">
                        <td
                          colSpan={6}
                          className="p-8 w-full text-center text-black text-m bg-[hsl(5,100%,98%)]"
                        >
                          No admin found
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
    </div>
  )
}

export default Admins