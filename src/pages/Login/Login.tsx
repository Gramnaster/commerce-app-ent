import { FormInput, SubmitBtn } from '../../components/index';
import {
  Form,
  redirect,
  type ActionFunctionArgs,
} from 'react-router-dom';
import { customFetch } from '../../utils';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import { loginUser } from '../../features/user/userSlice';
import type { AppDispatch } from '../../store';

export const action =  (store: { dispatch: AppDispatch }) => async ({ request }: ActionFunctionArgs) => {
    console.log(store);
    // const {request} = store;
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

const Login = () => {
  return (
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
  );
};
export default Login;
