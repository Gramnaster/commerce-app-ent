import { NavLink, useNavigate } from 'react-router-dom';
import logoIcon from '../assets/images/logo1.png';
import hamburgerIcon from '../assets/images/icon-hamburger.png';
import NavLinks from './NavLinks';
import { logoutUser } from '../features/user/userSlice';
import { useDispatch } from 'react-redux';
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
      <div className="navbar mx-auto max-w-9xl px-8">
        <div className="navbar-start item-start">
          <NavLink
            to="dashboard"
            className="hidden lg:flex btn text-2xl bg-transparent text-white items-center border-[0px]"
          >
            <img src={logoIcon} alt="Logo" className="w-[84px] h-[42px]" />
          </NavLink>
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden hover:bg-primary">
              <img src={hamburgerIcon} alt="Hamburger" />
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-primary rounded-box border-base-300 text-primary"
            >
              <NavLinks />
            </ul>
          </div>
        </div>
        <div className="navbar-center hidden lg:flex max-w-[70%] overflow-hidden">
          <ul className="menu menu-horizontal flex-wrap justify-center items-center text-white [&_li>*:not(ul):not(.menu-title):not(details):active]:bg-[#2080da] active:text-primary font-semibold">
            <NavLinks />
          </ul>
        </div>
        <div className="navbar-end">
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
