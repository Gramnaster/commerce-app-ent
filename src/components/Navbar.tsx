import { Link, Navigate, NavLink, useNavigate } from 'react-router-dom';
import logoIcon from '../assets/images/7dc5e18325bc176bbed1a92319e1f7eed2a78b4a.png';
import userIcon from '../assets/images/icon-user.png';
import languageIcon from '../assets/images/icon-language.png';
import hamburgerIcon from '../assets/images/icon-hamburger.png';
import NavLinks from './NavLinks';
import { logoutUser } from '../features/user/userSlice';
import { useDispatch } from 'react-redux';
import logoutIcon from '../assets/images/logout-icon2.png';
import IconProfile from '../assets/images/icon-user.png';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    navigate('/');
    dispatch(logoutUser());

    console.log("logout function here")
  };

// [#BE493D]
  return (
    <nav className="bg-primary px-10 max-h-[75px]">
      <div className="navbar align-element">
        <div className="navbar-start">
          <NavLink
            to="dashboard"
            className="hidden lg:flex btn text-2xl bg-transparent text-white items-center border-[0px]"
          >
            <img src={logoIcon} alt="Logo" className="w-[84px] h-[42px]" />
            Enterprise Tools
          </NavLink>
          {/* Dropdown Menu */}
          {/* <label className="input bg-[white] text-[#353535]">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input type="search" required placeholder="Search" className='bg-[white]'/>
          </label> */}
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <img src={hamburgerIcon} alt="Hamburger" />
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box border-base-300"
            >
              <NavLinks />
            </ul>
          </div>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal [&_li>*:not(ul):not(.menu-title):not(details):active]:bg-[#DD9A94]">
            <NavLinks />
          </ul>
        </div>
        <div className="navbar-end">
          {/* <div className="flex gap-x-y justify-center items-center ">
            <button className="" onClick={handleLogout}>
                  <img src={logoutIcon} className='max-w-[25px] hover:underline hover:cursor-pointer' />
            </button>
          </div> */}
          <div className="flex gap-x-2 sm:gap-x-8 items-center">
              <div className="dropdown">
              <label
                tabIndex={0}
                className="btn bg-transparent h-[30px] border-none shadow-none outline-none btn-circle"
              >
                <img src={IconProfile} alt="user-icon" />
              </label>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white rounded-box"
                >
                  <li>
                    <button className=" text-black" onClick={handleLogout}>
                        Logout
                    </button>
                  </li>
                </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
