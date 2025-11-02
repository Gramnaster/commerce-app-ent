import { useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import type { RootState } from '../../store';
import { useQuery } from '@tanstack/react-query';
import type { ProductCategoriesResponse } from '../Products/Products.tsx';
import { SearchBar, PaginationControls } from '../../components';

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
    ProductCategories: ProductCategoriesResponse
  };

  const [searchWord, setSearchWord] = useState('');
  const [categoryData, setCategoriesData] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.userState.user);

  const handlePagination = async (page: number | null) => {
    if (!page) return;
    setLoading(true)
    
    try {
      const response = await customFetch.get(`/product_categories?page=${page}&per_page=${categoryData.pagination.per_page || 20}`);
      const data = response.data;
      console.log('Categories handlePagination - Response:', data);
      setCategoriesData(data);
      setLoading(false);
    }
    catch (error: any) {
      console.error('Products handlePagination - Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
    }
  }

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

    const { current_page, total_pages } = categoryData.pagination || {
      current_page: 1,
      per_page: 20,
      total_pages: 1,
      next_page: null,
      previous_page: null
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <NavLink to={`/categories/create`} className={'btn bg-primary border-primary rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-white hover:text-primary hover:border-primary'}>
          Create Category
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
                    { loading ? 
                      <tr className='border-b text-[#000000] border-primary hover:bg-[hsl(0,0%,87%)] transition-colors'>
                        <td className="p-8 text-center" colSpan={10}>
                          <div className="h-screen flex items-center justify-center">
                            <span className="loading loading-ring loading-lg text-black">LOADING</span>
                          </div>
                        </td> 
                      </tr>
                     : filteredCategories.length > 0 ? (
                      filteredCategories.map((category: ProductCategory, index: number) => (
                        <tr
                          key={category.id}
                          className={`border-b text-[#000000] border-primary hover:bg-white transition-colors ${
                            index % 2 === 0 ? 'bg-transparent' : 'bg-[#f3f3f3]'
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
                          className="p-8 w-full text-center text-black text-m bg-transparent"
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

export default Categories