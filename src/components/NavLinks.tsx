// import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
// import type { RootState } from '../store';

interface LinksType {
  id: number;
  url: string;
  text: string;
}
const links: LinksType[] = [
  { id: 0, url: '/', text: 'Home' },
  { id: 1, url: 'products', text: 'Products' },
  { id: 3, url: '/dashboard/profile', text: 'Profile' },
  { id: 4, url: '/dashboard/cart', text: 'Cart' }
];

const NavLinks = () => {
  // const user = useSelector((state: RootState) => state.userState.user);
  return (
    <>
      {links.map((link) => {
        const { id, url, text } = link;
        // if (
        //   (url === 'home' ||
        //     url === 'products' ||
        //     url === 'searchbar' ||
        //     url === 'profile' ||
        //     url === 'cart')  &&
        //   (!user || user.user_role === 'admin')
        // )
        //   return null;

        // if (
        //   (url === 'admin' ||
        //     url === 'admin/transactions') 
        //     // &&
        //   // (!user || user.user_role !== 'admin')
        // )
        //   return null;

        // Hide "About Us" when user is logged in\
        // if (url === 'about' && user) return null;
        // if (url === 'about') return null;
        return (
          <li key={id}>
            <NavLink to={url} className="capitalize">
              {text}
            </NavLink>
          </li>
        );
      })}
    </>
  );
};
export default NavLinks;
