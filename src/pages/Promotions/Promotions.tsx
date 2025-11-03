import { NavLink, redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { Pagination } from '../Products/Products';
import { SearchBar, PaginationControls } from '../../components';

interface ProductCategory {
  id: number;
  title: string;
}

interface Promotion {
  id: number;
  discount_amount: string;
  products_count: number;
  created_at: string;
  product_categories: ProductCategory[];
}

interface PromotionDetailsResponse {
  data: Promotion[];
  pagination: Pagination;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

  if (!admin_user || admin_user.admin_role !== 'management') {
    toast.warn('There must be something wrong. Please refresh the page.');
    return redirect('/dashboard');
  }

  const PromotionsQuery = {
    queryKey: ['Promotions', id],
    queryFn: async () => {
      const response = await customFetch.get('/promotions', {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };
    console.log(`Promotions admin_user.token`, admin_user.token)

  try {
    const [ promotions ] = await Promise.all([
    queryClient.ensureQueryData(PromotionsQuery)
    ])
    console.log(`Promotions Promotions`, promotions)
    return { promotions };
  } catch (error: any) {
    console.error('Failed to load Promotions:', error);
    toast.error('Failed to load Promotions list');
    return { promotions: [] };
  }
};

const Promotions = () => {
  const { promotions: initialPromotions } = useLoaderData() as {
   promotions: PromotionDetailsResponse;
  }
  const [searchWord, setSearchWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [promotionData, SetPromotionData] = useState(initialPromotions);
  const admin_user = useSelector((state: RootState) => state.userState?.user);

  const handlePagination = async (page: number | null) => {
    if (!page) return;
    setLoading(true)
    
    try {
      const response = await customFetch.get(`/promotions?page=${page}&per_page=${promotionData.pagination.per_page || 20}`);
      const data = response.data;
      console.log('Products handlePagination - Response:', data);
      SetPromotionData(data);
      setLoading(false);
    }
    catch (error: any) {
      console.error('Products handlePagination - Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
    }
  }

  useQuery({
    queryKey: ['promotion', admin_user?.id],
    queryFn: async () => {
      const response = await customFetch.get('/promotions', {
        headers: {
          Authorization: admin_user?.token,
        },
      });
      console.log(`Promotions response.data`, response.data)
      return response.data;
    },
    initialData: initialPromotions,
    refetchOnWindowFocus: false,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const filteredPromotions = promotionData.data.length !== 0 && promotionData.data !== undefined ? promotionData.data.filter((promotion: Promotion) => {
        const matchesSearch =
        promotion.id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        promotion.discount_amount?.toLowerCase().includes(searchWord.toLowerCase()) ||
        promotion.products_count?.toString().includes(searchWord.toLowerCase()) ||
        promotion.product_categories?.toString().toLowerCase().includes(searchWord.toLowerCase());

      return matchesSearch;
      })
      .sort(
        (a: Promotion, b: Promotion) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) : [] ;

  const { current_page, total_pages } = promotionData.pagination || {
    current_page: 1,
    per_page: 20,
    total_pages: 1,
    next_page: null,
    previous_page: null
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <NavLink to={`/promotions/create`} className={'btn bg-primary border-primary rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-[hsl(5,100%,98%)] hover:text-primary hover:border-primary'}>
          Create Promotion
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
                        Promotion ID
                      </th>
                      <th className="text-left p-4 text-s font-normal text-white">
                        Discount Amount
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Products Count
                      </th>  
                      <th className="text-center p-4 text-s font-normal text-white">
                        Categories
                      </th> 
                      <th className="text-center p-4 text-s font-normal text-white">
                        Creation/Addition Date
                      </th> 
                      <th className="text-center p-4 text-s font-normal text-white">
                        Admin Actions:
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
                    : filteredPromotions.length > 0 ? (
                      filteredPromotions.map((promotion: Promotion, index: number) => (
                        <tr
                          key={promotion.id}
                          className={`border-b text-[#000000] border-primary hover:bg-white transition-colors ${
                            index % 2 === 0 ? 'bg-transparent' : 'bg-[#f3f3f3]'
                          }`}
                        >
                          <td className="p-4 text-m text-left">
                            {promotion.id}
                          </td>
                          <td className="p-4 text-m text-center">
                             {promotion.discount_amount}
                          </td>
                          <td className="p-4 text-m text-center">
                             {promotion.products_count}
                          </td>
                          <td className="p-4 text-m text-center">
                             {promotion.product_categories.length !== 0 ? promotion.product_categories.map((category: ProductCategory) => (
                                <div key={category.id}>
                                  <div>{category.title}</div>
                                </div>
                             )) : "Currently not applied to any categories"}
                          </td>
                          <td className={`p-4 text-m`}>
                            {formatDate(promotion.created_at)}
                          </td>
                          <td className={`p-4 text-m`}>
                            <NavLink to={`/promotions/${promotion.id}`}><span className='hover:text-primary hover:underline'>View Promotion Info</span></NavLink>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="w-full">
                        <td
                          colSpan={6}
                          className="p-8 w-full text-center text-black text-m bg-transparent"
                        >
                          No promotions found
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

export default Promotions