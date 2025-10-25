import { NavLink, redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

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

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  console.log(`Admins admin_user`, admin_user)
  const id = params.id;

  if (!admin_user || admin_user.admin_role !== 'management') {
    toast.warn('There must be something wrong. Please refresh the page.');
    return redirect('/');
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
   promotions: Promotion[];
  }
  const [searchWord, setSearchWord] = useState('');
  const user = useSelector((state: RootState) => state.userState.user);

  const { data: promotions = [] } = useQuery({
    queryKey: ['promotion', user?.id],
    queryFn: async () => {
      const response = await customFetch.get('/promotions', {
        headers: {
          Authorization: user?.token,
        },
      });
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

  const filteredPromotions = promotions.data.filter((promotion: Promotion) => {
        const matchesSearch =
        promotion.id.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        promotion.discount_amount.toLowerCase().includes(searchWord.toLowerCase()) ||
        promotion.products_count.toString().includes(searchWord.toLowerCase()) ||
        promotion.product_categories.toString().includes(searchWord.toLowerCase());

      return matchesSearch;
      })
      .sort(
        (a: Promotion, b: Promotion) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <NavLink to={`/promotions/create`} className={'btn bg-[#BE493D] border-[#BE493D] rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-[hsl(5,100%,98%)] hover:text-[#BE493D] hover:border-[#BE493D]'}>
          Create Promotion
        </NavLink>
        {(
          <>
            {/* Search and Filter */}
            <div className="bg-[#BE493D] rounded-lg p-6 border border-[#75332d] mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search by Name or Date"
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    className="w-full bg-[hsl(5,100%,98%)] border border-[#75332d] rounded-lg p-3 pl-10 text-black placeholder-[#c27971]"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#75332d]"
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
                <button className="p-3 bg-[#924b43] hover:bg-[#743b35] border border-[#75332d] rounded-lg hover:cursor-pointer transition-colors">
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
            <div className="bg-[hsl(5,100%,98%)] rounded-lg border border-[hsl(5,100%,80%)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#BE493D]">
                    <tr className="border-b border-[#75332d]">
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
                    {filteredPromotions.length > 0 ? (
                      filteredPromotions.map((promotion: Promotion, index: number) => (
                        <tr
                          key={promotion.id}
                          className={`border-b text-[#000000] border-[hsl(5,100%,80%)] hover:bg-[hsl(4,81%,90%)] transition-colors ${
                            index % 2 === 0 ? 'bg-[hsl(5,100%,98%)]' : 'bg-[hsl(5,100%,98%)]'
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
                            <NavLink to={`/promotions/${promotion.id}`}><span className='hover:text-[#BE493D] hover:underline'>View Promotion Info</span></NavLink>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="w-full">
                        <td
                          colSpan={6}
                          className="p-8 w-full text-center text-black text-m bg-[hsl(5,100%,98%)]"
                        >
                          No category found
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
    </div>
  )
}

export default Promotions