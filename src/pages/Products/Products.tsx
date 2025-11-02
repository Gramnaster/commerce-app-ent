import { useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { SearchBar, PaginationControls } from '../../components';

// Shared Types - Export for use in other Product files
export interface ProductCategory {
  id: number;
  title: string;
}

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

export interface User {
  id: number;
  email: string;
}

export interface Pagination {
  current_page: number | null;
  per_page: number | null;
  total_entries: number | null;
  total_pages: number | null;
  next_page: number | null;
  previous_page: number | null;
}

export interface Promotion {
  id: number;
  discount_amount: number;
}

export interface Product {
  id: number;
  title: string;
  product_title: string;
  product_category?: ProductCategory; // Optional because /product_categories/:id doesn't include it
  producer?: Producer; // Optional because /product_categories/:id doesn't include it
  description: string;
  price: number;
  promotion_id: number | null;
  promotion?: Promotion | null;
  product_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
}

export interface ProductCategoriesResponse {
  data: ProductCategory[];
  pagination: Pagination;
}

export interface ProducersResponse {
  data: Producer[];  
  pagination: Pagination;
}

export interface ProductDetailsResponse {
  data: Product;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const user = storeState.userState?.user;
  const id = params.id;

  // Fetch ALL products at once for client-side filtering and pagination
  const allProductsQuery = {
    queryKey: ['allProducts'],
    queryFn: async () => {
      const response = await customFetch.get('/products?per_page=10000');
      console.log('Products loader - response.data:', response.data)
      return response.data;
    },
  };

  const ProductCategoriesQuery = {
    queryKey: ['ProductCategoriesDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/product_categories`, {
        headers: {
          Authorization: user.token,
        },
      });
      console.log('Products loader - product_categories response.data:', response.data)
      return response.data;
    },
  };

  try {
    const [allProducts, ProductCategories] = await Promise.all([
      queryClient.ensureQueryData(allProductsQuery),
      queryClient.ensureQueryData(ProductCategoriesQuery)
    ]);

    console.log('Products loader - allProducts:', allProducts)
    console.log('Products loader - ProductCategories:', ProductCategories)
    return { allProducts, ProductCategories };
  } catch (error: any) {
    console.error('Products loader - Failed to load Product data:', error);
    toast.error('Failed to load Product data');
    return { allProducts: { data: [], pagination: null }, ProductCategories: { data: [] } };
  }
};

const Products = () => {
  const { allProducts, ProductCategories } = useLoaderData() as {
    allProducts: ProductsResponse,
    ProductCategories: ProductCategoriesResponse
  };
  console.log('Products - ProductCategories:', ProductCategories)
  console.log('Products - All products loaded:', allProducts.data.length)
  
  const [searchWord, setSearchWord] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // When user types in search, automatically switch to "All" category
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Products handleSearchChange - Search value:', value);
    setSearchWord(value);
    
    // If user starts typing, switch to "All" category to search across all products
    if (value && selectedCategory !== null) {
      setSelectedCategory(null);
      console.log('Products handleSearchChange - Switched to "All" category for search');
    }
    
    // Reset to page 1 when searching
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string | null) => {
    console.log('Products handleCategoryChange - Selected category:', category);
    setSelectedCategory(category);
    setSearchWord(''); // Clear search when changing categories
    setCurrentPage(1); // Reset to page 1 when changing categories
  };

  // Client-side filtering: category and search
  const filteredProds = useMemo(() => {
    let filtered = allProducts.data;

    // Filter by category first (if not "All")
    if (selectedCategory) {
      filtered = filtered.filter((product: Product) => 
        product.product_category?.title === selectedCategory
      );
    }

    // Then filter by search term
    if (searchWord) {
      filtered = filtered.filter((product: Product) => {
        const matchesSearch =
          product.id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
          product.title?.toLowerCase().includes(searchWord.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchWord.toLowerCase()) ||
          product.price?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
          product.product_category?.title.toLowerCase().includes(searchWord.toLowerCase()) ||
          product.producer?.title.toLowerCase().includes(searchWord.toLowerCase()) ||
          product.promotion_id?.toString().toLowerCase().includes(searchWord.toLowerCase());
        return matchesSearch;
      });
    }

    // Sort by created_at (newest first)
    return filtered.sort(
      (a: Product, b: Product) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [allProducts.data, selectedCategory, searchWord]);

  // Client-side pagination
  const totalPages = Math.ceil(filteredProds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProds = filteredProds.slice(startIndex, endIndex);

  const handlePagination = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    console.log('Products handlePagination - Page:', page);
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <NavLink to={`/products/create`} className={'btn bg-primary border-primary rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-white hover:text-primary hover:border-primary'}>
           Create Product  
        </NavLink>
        <div className='text-primary font-bold'>
          <button 
            onClick={() => handleCategoryChange(null)} 
            className={`m-1 px-2 py-2 border-2 border-primary rounded-2xl hover:cursor-pointer hover:bg-primary hover:text-white ${!selectedCategory ? 'bg-primary text-white' : ''}`}
          >
            All
          </button>
          {ProductCategories?.data?.length
            ? ProductCategories.data.map((category: ProductCategory) => {
            const { id, title } = category;
            console.log(`ProductCategories.data`,ProductCategories.data)
            return (
              <button 
                onClick={() => handleCategoryChange(title)} 
                className={`m-1 px-2 py-2 border-2 border-primary rounded-2xl hover:cursor-pointer hover:bg-primary hover:text-white ${selectedCategory === title ? 'bg-primary text-white' : ''}`}
                key={id}
              >
                {title}
              </button>
            )
          }) : null }
      </div>
        
        {/* Search and Filter */}
        <SearchBar
          searchValue={searchWord}
          onSearchChange={handleSearchChange}
        />

        {/* Traders Table */}
            <div className="bg-transparent rounded-lg border border-primary overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr className="border-b border-primary">
                      <th className="text-left p-4 text-s font-normal text-white">
                        Product ID
                      </th>
                      <th className="text-left p-4 text-s font-normal text-white">
                        Product Name
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Product Image
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Product Category
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Producer
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Product Description
                      </th>
                      <th className="text-center p-4 text-s font-extralight text-white">
                        Price
                      </th>
                      <th className="text-center p-4 text-s font-extralight text-white">
                        Promotion IDs
                      </th>
                    </tr>
                  </thead>
                  <tbody >
                    {paginatedProds.length > 0 ? 
                      (
                      paginatedProds.map((product: Product, index: number) => (
                        <tr
                          key={product.id}
                          className={`border-b text-[#000000] border-primary hover:bg-white transition-colors ${
                            index % 2 === 0 ? 'bg-transparent' : 'bg-[#f3f3f3]'
                          }`}
                        >
                          <td className="p-4 text-m text-left">
                            {product.id}
                          </td>
                          <td className="p-4 text-m text-center">
                             {product.title}
                          </td>
                          <td className="p-4 text-m text-center">
                            <NavLink to={`/products/${product.id}`}>
                              {product.product_image_url ? (
                                <img 
                                  src={product.product_image_url} 
                                  alt={product.title}
                                  className="w-[100px] h-[100px] object-cover rounded"
                                  onError={(e) => {
                                    // Fallback to placeholder if image fails to load
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                              ) 
                              : 
                              (
                                <div className="w-[100px] h-[100px] bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                                  No Image
                                </div>
                              )}
                            </NavLink>
                          </td>
                          <td className="p-4 text-m text-center">
                            {product.product_category?.title || 'N/A'}
                          </td>
                          <td className="p-4 text-m text-center">
                            {product.producer?.title || 'N/A'}
                          </td>
                          <td className={`p-4 text-m`}>
                            {product.description}
                          </td>
                          <td className={`p-4 text-m`}>
                            {product.price}
                          </td>
                          <td className={`p-4 text-m`}>
                            {product.promotion_id || "No active promotions"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="w-full">
                        <td
                          colSpan={6}
                          className="p-8 w-full text-center text-black text-m bg-transparent"
                        >
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
      </div>
      
      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePagination}
      />
    </div>
  )
}

export default Products