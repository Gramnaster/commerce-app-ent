import { useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useQuery } from '@tanstack/react-query';

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

interface Pagination {
  current_page: number | null;
  per_page: number | null;
  total_entries: number | null;
  total_pages: number | null;
  next_page: number | null;
  previous_page: number | null;
}

interface Producer {
  id: number;
  title: string;
  products_count: number;
  address: Address;
  created_at: string;
  pagination: Pagination;
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
  const [searchWord, setSearchWord] = useState('');
  const { Producers } = useLoaderData() as {
    Producers: Producer[]
  };
  const user = useSelector((state: RootState) => state.userState.user);
  const [producerData, setProducerData] = useState(Producers)

  const handlePagination = async (page: number) => {
    try {
      const response = await customFetch.get(`/products?page=${page}&per_page=${per_page}`);
      const data = response.data
      setProducerData(data)
    }
    catch (error: any) {
      console.error('Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
      return { pagination: [] };
    }
  }

  // const { data: producers = [] } = useQuery({
  //     queryKey: ['producers', user?.id],
  //     queryFn: async () => {
  //       const response = await customFetch.get('/producers', {
  //         headers: {
  //           Authorization: user?.token,
  //         },
  //       });
  //       return response.data;
  //     },
  //     initialData: initialProducers,
  //     refetchOnWindowFocus: false,
  //   });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const filteredProducers = producerData.data.filter((producer: Producer) => {
        const matchesSearch =
        producer.id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        producer.title?.toLowerCase().includes(searchWord.toLowerCase()) ||
        producer.products_count?.toString().includes(searchWord.toLowerCase()) ||
        producer.address?.unit_no?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        producer.address?.street_no?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        producer.address?.address_line1?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        producer.address?.address_line2?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        producer.address?.city?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        producer.address?.region?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        producer.address?.zipcode?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        producer.address?.country?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        producer.address?.city?.toString().toLowerCase().includes(searchWord.toLowerCase());

      return matchesSearch;
      })
      .sort(
        (a: Producer, b: Producer) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || [];

  const { current_page, per_page, total_entries, total_pages, next_page, previous_page } = producerData.pagination

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <NavLink to={`/producers/create`} className={'btn bg-primary border-primary rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-[hsl(5,100%,98%)] hover:text-primary hover:border-primary'}>
          Create Producer
        </NavLink>
        {(
          <>
            {/* Search and Filter */}
            <div className="bg-primary rounded-lg p-6 border border-primary mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search by Name or Date"
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    className="w-full bg-white border border-primary rounded-lg p-3 pl-10 text-black placeholder-[#c27971]"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <button className="p-3 bg-[#924b43] hover:bg-[#743b35] border border-primary rounded-lg hover:cursor-pointer transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Traders Table */}
            <div className="bg-white rounded-lg border border-[hsl(5,100%,80%)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr className="border-b border-primary">
                      <th className="text-left p-4 text-s font-normal text-white">
                        Producer ID
                      </th>
                      <th className="text-left p-4 text-s font-normal text-white">
                        Producer Name
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Products Count
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Address
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Creation/Addition Date
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        View Producer Info
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducers.length > 0 ? (
                      filteredProducers.map((producer: Producer, index: number) => (
                        <tr
                          key={producer.id}
                          className={`border-b text-[#000000] border-[hsl(5,100%,80%)] hover:bg-[hsl(4,81%,90%)] transition-colors ${
                            index % 2 === 0 ? 'bg-[hsl(5,100%,98%)]' : 'bg-[hsl(5,100%,98%)]'
                          }`}
                        >
                          <td className="p-4 text-m text-left">
                            {producer.id}
                          </td>
                          <td className="p-4 text-m text-center">
                             {producer.title}
                          </td>
                          <td className="p-4 text-m text-center">
                             {producer.products_count}
                          </td>
                          <td className="p-4 text-m text-center">
                            <div>{producer.address.unit_no}</div>
                            <div>{producer.address.street_no}</div>
                            <div>{producer.address.address_line1}</div>
                            <div>{producer.address.address_line2}</div>
                            <div>{producer.address.city}</div>
                            <div>{producer.address.region}</div>
                            <div>{producer.address.zipcode}</div>
                            <div>{producer.address.country}</div>
                          </td>
                          <td className={`p-4 text-m`}>
                            {formatDate(producer.created_at)}
                          </td>
                          <td className={`p-4 text-m`}>
                            <NavLink to={`/producers/${producer.id}`}><span className='hover:text-primary hover:underline'>View Producer Info</span></NavLink>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="w-full">
                        <td
                          colSpan={6}
                          className="p-8 w-full text-center text-black text-m bg-[hsl(5,100%,98%)]"
                        >
                          No producer found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="join">
        <input
          className="join-item btn btn-square" 
          type="radio" 
          name="options" 
          onClick={() => handlePagination(previous_page)}
          aria-label={`<`} 
        />
        {[...Array(total_pages).keys()].map((_, i) => 
          (
          <input key={i} 
          className="join-item btn btn-square" 
          type="radio" 
          name="options" 
          onClick={() => handlePagination(i + 1)}
          aria-label={`${i + 1}`} 
          />
          ))
        }
        <input
          className="join-item btn btn-square" 
          type="radio" 
          name="options" 
          onClick={() => handlePagination(next_page)}
          aria-label={`>`} 
        />
      </div>
    </div>
  )
}

export default Producers