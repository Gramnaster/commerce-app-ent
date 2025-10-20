import { useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { NavLink } from 'react-router-dom';

interface Address {
  id: number,
  unit_no: string;
  street_no: string;
  address_line1: string;
  address_line2: string;
  city: string;
  region: string;
  zipcode: string;
  country_id: number;
  country: string;
}

interface Producer {
  id: number;
  title: string;
  products_count: number;
  address: Address;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

  const ProducersQuery = {
    queryKey: ['ProducersDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/producers`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      console.log(`Producers producers`, response.data)
      return response.data;
    },
  };

  try {
    const [ Producers ] = await Promise.all([
      queryClient.ensureQueryData(ProducersQuery)
    ]);
    return { Producers };
  } catch (error: any) {
    console.error('Failed to load Producers data:', error);
    toast.error('Failed to load Producers data');
    return { allStocks: [] };
  }
};

const Producers = () => {
  const { Producers } = useLoaderData() as {
    Producers: Producer[]
  };

  return (
    <div>
       <NavLink to={`/producers/create`}>Create Producer</NavLink>
      <div className='m-1 text-red-50'> Producers </div>
      {Producers.data.map((producer: Producer) => {
        const { id, title, products_count } = producer;
        return(
          <div key={id}>
            <div>Product Name: {title}</div>
            <div>Products Count: {products_count}</div>
            <NavLink to={`/producers/${id}`}>View Producer details</NavLink>
          </div>
        )
      })}
    </div>
  )
}

export default Producers