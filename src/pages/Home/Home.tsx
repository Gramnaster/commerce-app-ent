import { Outlet, useLocation, useNavigation } from 'react-router-dom'
import { Loading } from '../../components';
import { Navbar } from '../../components'


const Home = () => {
  const navigation = useNavigation();
  const isPageLoading = navigation.state === 'loading';
  let currentPath = useLocation();
  
  return (
    <div className='h-full'>
      { currentPath.pathname === '/' ? null : <Navbar />}
      <div className='h-full'>
        { isPageLoading ? <Loading /> : <Outlet /> }
      </div>
    </div>
  )
}
export default Home