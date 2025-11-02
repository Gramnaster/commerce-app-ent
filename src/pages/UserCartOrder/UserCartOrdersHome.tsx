import { Outlet, redirect } from "react-router-dom"
import { toast } from "react-toastify";

export const loader = (_queryClient: any, store: any) => async () => {
  console.log('UserCartOrdersHome loader - START');
  const storeState = store.getState();
  console.log('UserCartOrdersHome loader - storeState:', storeState);
  const admin_user = storeState.userState?.user;
  console.log('UserCartOrdersHome loader - admin_user:', admin_user);
  console.log('UserCartOrdersHome loader - admin_role:', admin_user?.admin_role);

  if (!admin_user || (admin_user.admin_role !== 'management' && admin_user.admin_role !== 'warehouse')) {
    console.log('UserCartOrdersHome loader - UNAUTHORIZED - Redirecting to /');
    toast.warn('There must be something wrong. Please refresh the page.');
    return redirect('/');
  }

  console.log('UserCartOrdersHome loader - AUTHORIZED - Returning empty object');
  return {};
};

const UserCartOrdersHome = () => {
  console.log('UserCartOrdersHome component - RENDER');
  return (
    <div>
      <Outlet/>
    </div>
  )
}

export default UserCartOrdersHome
