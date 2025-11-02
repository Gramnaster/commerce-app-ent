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
  { id: 2, url: 'categories', text: 'Categories' },
  { id: 3, url: 'producers', text: 'Producers' },
  { id: 4, url: 'promotions', text: 'Promotions' },
  { id: 5, url: 'social_programs', text: 'Social Programs' },
  { id: 6, url: 'admins', text: 'Admins' },
  { id: 7, url: 'users', text: 'Users' },
  { id: 8, url: 'receipts', text: 'Receipts' },
  { id: 9, url: 'warehouse_orders', text: 'Warehouse' },
  { id: 10, url: 'orders', text: 'Orders' },
  { id: 11, url: 'inventories', text: 'Inventories' }
];

const NavLinks = () => {
  const navigation = useNavigation();
  return (
    <>
      {links.map((link) => {
        const { id, url, text } = link;
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
