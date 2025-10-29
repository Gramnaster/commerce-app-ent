import { useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import type { RootState } from '../../store';
import { useQuery } from '@tanstack/react-query';

interface ProductCategory {
  id: number;
  title: string;
  products_count: number;
  created_at: string;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

  const ProductCategoriesQuery = {
    queryKey: ['ProductCategoriesDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/product_categories`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const [ProductCategories] = await Promise.all([
      queryClient.ensureQueryData(ProductCategoriesQuery)
    ]);
    return { ProductCategories };
  } catch (error: any) {
    console.error('Failed to load Categories data:', error);
    toast.error('Failed to load Categories data');
    return { allStocks: [] };
  }
};

const Categories = () => {
  const { ProductCategories: initialCategories } = useLoaderData() as {
    ProductCategories: ProductCategory[]
  };

  const [searchWord, setSearchWord] = useState('');
  const user = useSelector((state: RootState) => state.userState.user);

    const { data: categories = [] } = useQuery({
      queryKey: ['category', user?.id],
      queryFn: async () => {
        const response = await customFetch.get('/product_categories', {
          headers: {
            Authorization: user?.token,
          },
        });
        return response.data;
      },
      initialData: initialCategories,
      refetchOnWindowFocus: false,
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const filteredCategories = categories.data.filter((category: ProductCategory) => {
        const matchesSearch =
        category.id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        category.title?.toLowerCase().includes(searchWord.toLowerCase()) ||
        category.products_count?.toString().includes(searchWord.toLowerCase()) ||
        category.created_at?.toString().includes(searchWord.toLowerCase());

      return matchesSearch;
      })
      .sort(
        (a: ProductCategory, b: ProductCategory) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || [];

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <NavLink to={`/categories/create`} className={'btn bg-primary border-primary rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-[hsl(5,100%,98%)] hover:text-primary hover:border-primary'}>
          Create Category
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
                        Product Category ID
                      </th>
                      <th className="text-left p-4 text-s font-normal text-white">
                        Product Category Name
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Products Count
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
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category: ProductCategory, index: number) => (
                        <tr
                          key={category.id}
                          className={`border-b text-[#000000] border-[hsl(5,100%,80%)] hover:bg-[hsl(4,81%,90%)] transition-colors ${
                            index % 2 === 0 ? 'bg-[hsl(5,100%,98%)]' : 'bg-[hsl(5,100%,98%)]'
                          }`}
                        >
                          <td className="p-4 text-m text-left">
                            {category.id}
                          </td>
                          <td className="p-4 text-m text-center">
                             {category.title}
                          </td>
                          <td className="p-4 text-m text-center">
                             {category.products_count}
                          </td>

                          <td className={`p-4 text-m`}>
                            {formatDate(category.created_at)}
                          </td>
                          <td className={`p-4 text-m`}>
                            <NavLink to={`/categories/${category.id}`}><span className='hover:text-primary hover:underline'>View Category Info</span></NavLink>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="w-full">
                        <td
                          colSpan={6}
                          className="p-8 w-full text-center text-black text-m bg-white"
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

export default Categories