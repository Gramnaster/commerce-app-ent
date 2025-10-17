import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-neutral py-2 text-neutral-content">
      <div className="align-element flex sm:justify-end">
        {/* USER */}
        {/* LINKS */}
        <div className="flex gap-x-y justify-center items-center gap-x-4 ">
          <button className='btn btn-primary h-[33px]'><Link to="/login" className="link link-hover text-cs sm:text-sm">
            Login
          </Link></button>
          <button className='btn btn-primary h-[33px]'><Link to="/login" className="link link-hover text-cs sm:text-sm">
            Sign Up
          </Link></button>
        </div>
      </div>
    </header>
  );
};
export default Header;
