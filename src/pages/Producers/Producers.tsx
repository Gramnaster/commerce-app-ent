import { redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import type { ProducersResponse, Producer } from '../Products/Products';
import { SearchBar, PaginationControls } from '../../components';

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

    if (!admin_user || admin_user.admin_role !== 'management') {
      toast.warn('There must be something wrong. Please refresh the page.');
      return redirect('/dashboard');
    }

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
    Producers: ProducersResponse
  };
  const [loading, setLoading] = useState(false);
  const [producerData, setProducerData] = useState(Producers)

  const handlePagination = async (page: number | null) => {
    if (!page) return;
    setLoading(true)
    
    try {
      const response = await customFetch.get(`/products?page=${page}&per_page=${producerData.pagination.per_page || 20}`);
      const data = response.data;
      console.log('Products handlePagination - Response:', data);
      setProducerData(data);
      setLoading(false);
    }
    catch (error: any) {
      console.error('Products handlePagination - Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
    }
  }

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

  const { current_page, total_pages } = producerData.pagination

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <NavLink to={`/producers/create`} className={'btn bg-primary border-primary rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-white hover:text-primary hover:border-primary'}>
          Create Producer
        </NavLink>
        {(
          <>
            {/* Search and Filter */}
            <SearchBar
              searchValue={searchWord}
              onSearchChange={(e) => setSearchWord(e.target.value)}
            />

            {/* Traders Table */}
            <div className="bg-transparent rounded-lg border border-primary overflow-hidden">
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
                    { loading ?     
                    <tr className='border-b text-[#000000] border-primary hover:bg-[hsl(0,0%,87%)] transition-colors'>
                      <td className="p-8 text-center" colSpan={10}>
                        <div className="h-screen flex items-center justify-center">
                          <span className="loading loading-ring loading-lg text-black">LOADING</span>
                        </div>
                      </td> 
                    </tr>
                    : filteredProducers.length > 0 ? (
                      filteredProducers.map((producer: Producer, index: number) => (
                        <tr
                          key={producer.id}
                          className={`border-b text-[#000000] border-primary hover:bg-white transition-colors ${
                            index % 2 === 0 ? 'bg-transparent' : 'bg-[#f3f3f3]'
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
                          className="p-8 w-full text-center text-black text-m bg-transparent"
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
      
      {/* Pagination Controls */}
      {current_page && total_pages && (
        <PaginationControls
          currentPage={current_page}
          totalPages={total_pages}
          onPageChange={(page) => handlePagination(page)}
        />
      )}
    </div>
  )
}

export default Producers