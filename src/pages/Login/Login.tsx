import { FormInput, SubmitBtn } from '../../components/index';
import {
  Form,
  Link,
  redirect,
  useNavigate,
  type ActionFunctionArgs,
} from 'react-router-dom';
import { customFetch } from '../../utils';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import { loginUser } from '../../features/user/userSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';

export const action =
  (store: { dispatch: AppDispatch }) =>
  async ({ request }: ActionFunctionArgs) => {
    console.log(store);
    // const {request} = store;
    const requestFormData = await request.formData();
    const data = Object.fromEntries(requestFormData);

    // Modern React Router + Rails format
    // const payload = { user: data};

    try {
      // Convert to FormData to avoid preflight
      const formData = new FormData();
      formData.append('user[email]', data.email);
      formData.append('user[password]', data.password);

      const response = await customFetch.post('/users/login', formData);
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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginAsGuestUser = async () => {
    try {
      const formData = new FormData();
      formData.append('user[email]', 'manuel@test.com');
      formData.append('user[password]', 'test123456');

      const response = await customFetch.post('/users/login', formData);
      
      // Extract token and user data (same as form submission)
      const token = response.headers.authorization; // Keep the full "Bearer <token>" format
      const userData = response.data.data;

      dispatch(loginUser({ user: userData, token }));
      toast.success('Welcome, guest user');
      navigate('/dashboard');
    } catch (error) {
      console.log(error);
      toast.error('Please try again')
    }
  };

  return (
    <section className="h-screen grid place-items-center">
      <Form
        method="post"
        className="card w-96 p-8 shadow-lg flex flex-col gap-y-5 outline-blue-800"
      >
        <h4 className="text-center text-3x1 font-bold">
          Login to Orbital Finances
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
          <button type="button" className="btn btn-primary btn-block">
            Google
          </button><button type="button" className="btn btn-primary btn-block">
            Facebook
          </button>
          <Link to="/">
            <button type="button" className="btn bg-neutral-800 btn-block">
              Cancel
            </button>
          </Link>
          <p>
            Not yet registered?
            <Link
              to="/signup"
              className="ml-2 link link-hover link-secondary capitalize"
            >
              Register
            </Link>
          </p>
        </div>
      </Form>
    </section>
  );
};
export default Login;
