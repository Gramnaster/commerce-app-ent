import { Link, useRouteError } from 'react-router-dom';

const Error = () => {
  const error: any = useRouteError();
  console.log(error);

  if (error && error.status === 404) {
    return (
      <main className="grid min-ih-[100vh] place-items-center px-8">
        <div className="text-center">
          <p>404</p>
          <h1>Page Not Found</h1>
          <p>Sorry, we couldn't find the page you're looking for</p>
        </div>
        <div>
          <Link to="/">
            <button type='button' className='btn bg-primary'>Return Home</button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-ih-[100vh] place-items-center px-8">
      <h4>There was an error...</h4>
      <Link to="/">
        <button type='button' className='btn bg-primary'>Return Home</button>
      </Link>
    </main>
  );
};
export default Error;
