import { Outlet, useNavigation } from 'react-router-dom'
import { Navbar } from '../../components'


const Home = () => {
  const navigation = useNavigation();
  const isPageLoading = navigation.state === 'loading';

  return (
    <div>
      <Navbar />
      <h1>
        <Outlet />
      </h1>
    </div>
  )
}
export default Home