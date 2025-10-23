import LogoNoSun from '../../assets/images/JP&B no sun.png'
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { FormInput, SubmitBtn } from '../../components/index';
import {
  Form,
  Link,
  redirect,
  useNavigate,
  NavLink,
  type ActionFunctionArgs,
} from 'react-router-dom';
import { customFetch } from '../../utils';
import type { AxiosError } from 'axios';
import { loginUser } from '../../features/user/userSlice';
import type { AppDispatch } from '../../store';

export const action =  (store: { dispatch: AppDispatch }) => async ({ request }: ActionFunctionArgs) => {
    console.log(store);
    const requestFormData = await request.formData();
    const data = Object.fromEntries(requestFormData);

    // Modern React Router + Rails format
    // const payload = { user: data};

    try {
      // Convert to FormData to avoid preflight
      const formData = new FormData();
      formData.append('admin_user[email]', data.email);
      formData.append('admin_user[password]', data.password);

      const response = await customFetch.post('/admin_users/login', formData);
      console.log(response);

      // Data and Token extraction
      const token = response.headers.authorization; // Keep the full "Bearer <token>" format
      const userData = response.data.data;

      store.dispatch(loginUser({ user: userData, token }));
      console.log(`login.tsx user: userdata`, userData);
      toast.success('logged in successfully');
      return redirect('/dashboard');
    } catch (error) {
      console.log('Try-Catch Login Error:', error);
      const err = error as AxiosError<{ error: { message: string } }>;
      const errorMessage =
        err.response?.data?.error?.message || 'Invalid credentials';
      toast.error(errorMessage);
      return null;
    }
};

const Landing = () => {
  const admin_user = useSelector((state: RootState) => state.userState.user);
 
  console.log(`Landing admin_user`, admin_user)

  const isAdminSignedIn = () => {
    if (admin_user !== null && admin_user.admin_role === 'management' || admin_user?.admin_role === 'warehouse') {
      return true
    } else {
      return false
    }
  }

  return (
    <div className='grid grid-cols-[0.33fr_1fr] grid-rows-1 gap-0 h-full bg-gradient-to-t from-[#8d8d8d2a] to-[#e6e6e6]'>
     <div className='flex flex-col items-center justify-center font-[Aleo] p-2 gap-2 bg-gradient-to-t from-[#AE2012] to-[#BE493D] h-full'><img src={LogoNoSun} className='max-w-[120px]'/> <div className='text-4xl font-[380] text-[white]'>Enterprise Tool</div> </div>
      <div className="mt-4 flex flex-col gap-y-5 items-center w-full h-full">
          { 
          isAdminSignedIn() ? <NavLink to='dashboard'><button className='btn btn-xl bg-[#BE493D]'>To Dashboard</button></NavLink> 
          : 
          <section className="h-screen grid place-items-center">
            <Form
              method="post"
              className="card w-96 p-8 shadow-lg flex flex-col gap-y-5 outline-blue-800 h-[50%] bg-[#ffffff]"
            >
              <h4 className="text-center text-3x1 font-bold">
                Login
              </h4>
              <FormInput
                type="email"
                label="Email (required)"
                name="email"
                placeholder="email@email.com"
              />
              <FormInput
                type="password"
                label="Password (required)"
                name="password"
                placeholder="pass1234"
              />
              <div className="mt-4 flex flex-col gap-y-5 items-center w-full">
                <SubmitBtn text="Login" />
                {/* <button type="button" className="btn btn-primary btn-block" onClick={loginAsGuestUser}> */}
              </div>
            </Form>
          </section>
          }
        </div>
    </div>
  )
}

export default Landing