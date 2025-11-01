// import { useSelector } from 'react-redux';
import { NavLink, useNavigation } from 'react-router-dom';
// import type { RootState } from '../store';

interface LinksType {
  id: number;
  url: string;
  text: string;
}
const links: LinksType[] = [
  { id: 1, url: 'products', text: 'Products' },
  { id: 2, url: 'producers', text: 'Producers' },
  { id: 3, url: 'categories', text: 'Categories' },
  { id: 4, url: 'admins', text: 'Admins' },
  { id: 5, url: 'users', text: 'Users' },
  { id: 6, url: 'promotions', text: 'Promotions' },
  { id: 7, url: 'warehouse_orders', text: 'Warehouse' },
  { id: 8, url: 'receipts', text: 'Receipts' },
  { id: 9, url: 'social_programs', text: 'Social Programs' },
  { id: 10, url: 'inventories', text: 'Inventories' }
];

const NavLinks = () => {
  // const user = useSelector((state: RootState) => state.userState.user);
  const navigation = useNavigation();
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
            <NavLink to={url} className={`capitalize text-[white] ${navigation.state === 'loading' ? 'pointer-events-none text-[#bebebe]' : '' }`}>
              {text}
            </NavLink>
          </li>
        );
      })}
    </>
  );
};
export default NavLinks;
