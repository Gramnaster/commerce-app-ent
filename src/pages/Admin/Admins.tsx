import { NavLink, redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';


interface AdminUser {
  id: number,
  email: string,
  admin_role: string,
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
  const { AdminUsers } = useLoaderData() as {
    AdminUsers: AdminUser[]
  }
  const adminList = Object.values(AdminUsers.admin_users)

  return (
    <div>
      <NavLink to={`/admins/create`}>Create Admin</NavLink>
      <div>
        {adminList.map((admin: any) => {
          const { id, email, admin_role } = admin
          return (
            <div key={id} className='m-1 border-b-[1px] flex flex-col'>
              Email: {email}
              Role: {admin_role}
              <NavLink to={`/admins/${id}`}>View Admin details</NavLink>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Admins