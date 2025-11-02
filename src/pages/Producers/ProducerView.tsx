import { NavLink, redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { BackButton } from '../../components';

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
  created_at: string;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;

  const id = params.id;

  const ProducerViewQuery = {
    queryKey: ['ProductDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/producers/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };
  console.log(`ProducerView ProducerViewQuery`, ProducerViewQuery)

  try {
    const ProducerDetails = await queryClient.ensureQueryData(ProducerViewQuery);
    return { ProducerDetails };
  } catch (error: any) {
    console.error('Failed to load producer:', error);
    toast.error('Failed to load producer details');
    return redirect('/producers');
  }
};

const ProducerView = () => {
  const { ProducerDetails } = useLoaderData() as {
    ProducerDetails: Producer;
  }
  const { id, title, products_count, address: { unit_no, street_no, address_line1, address_line2, city, region, zipcode, country }, created_at } = ProducerDetails.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto place-items-center ">
        <div className="mb-6 text-black">
          <BackButton text="Back to Producers list" to="/producers" />
        </div>

          <div className="w-[60%] bg-primary rounded-lg p-6 border border-gray-700">
            <div className=" mb-4 pb-2 border-b border-white flex items-center justify-between gap-1">
              <h2 className="text-xl font-bold text-white">
                Producer Information
              </h2>
              <NavLink to={`/producers/edit/${id}`}>
                <button className="btn bg-white border-primary text-l rounded-[8px] text-primary p-2 pt-1 pb-1 m-1 hover:border-[hsl(5,100%,98%)] hover:bg-primary hover:text-white">
                  Edit Producer Info
                </button>
              </NavLink>
            </div>
            <div>
                <div className="place-items-center text-[black] w-full">
                  <div className=" px-6 py-3 rounded-2xl bg-white w-full">
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Producer Name:
                      </label>
                      <div>
                        {title}
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Products Count:
                      </label>
                      {products_count}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Address:
                      </label>
                      <div>
                        <div>Unit #: {unit_no}</div>
                        <div>Street #: {street_no}</div>
                        <div>Address Line 1: {address_line1}</div>
                        <div>Address Line 2: {address_line2}</div>
                        <div>City: {city}</div>
                        <div>Region: {region}</div>
                        <div>Country: {country}</div>
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Creation/Addition Date:
                      </label>
                      {formatDate(created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  )
}

export default ProducerView