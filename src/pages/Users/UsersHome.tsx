import { Outlet, redirect } from 'react-router-dom'
import { toast } from 'react-toastify';

export const loader = (_queryClient: any, store: any) => async () => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;

  if (!admin_user) {
    toast.warn('There must be something wrong. Please refresh the page.');
    return redirect('/');
  }

  return {};
};

const UsersHome = () => {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default UsersHome