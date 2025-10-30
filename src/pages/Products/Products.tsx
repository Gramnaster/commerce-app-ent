import { useLoaderData, useNavigation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

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
  product_category: ProductCategory;
  producer: Producer;
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


  const allProductsQuery = {
    queryKey: ['allProducts'],
    queryFn: async () => {
      const response = await customFetch.get('/products');
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
    return { allStocks: [] };
  }
};

const Products = () => {
  const { allProducts: initialProducts, ProductCategories } = useLoaderData() as {
    allProducts: ProductsResponse,
    ProductCategories: ProductCategoriesResponse
  };
  const [searchWord, setSearchWord] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(initialProducts);

  const handlePagination = async (page: number | null) => {
    if (!page) return;
    setLoading(true)
    
    try {
      const response = await customFetch.get(`/products?page=${page}&per_page=${productData.pagination.per_page || 20}`);
      const data = response.data;
      console.log('Products handlePagination - Response:', data);
      setProductData(data);
      setLoading(false);
    }
    catch (error: any) {
      console.error('Products handlePagination - Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
    }
  }

  const filteredProds = productData.data.filter((product: Product) => {
    const matchesSearch =
      product.id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
      product.title?.toLowerCase().includes(searchWord.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchWord.toLowerCase()) ||
      product.price?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
      product.product_category?.title.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
      product.producer?.title.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
      product.promotion_id?.toString().toLowerCase().includes(searchWord.toLowerCase());

    const matchesCategory = selectedCategory
      ? product.product_category.title === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
    })
    .sort(
    (a: Product, b: Product) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];
  
  const { current_page, total_pages, next_page, previous_page } = productData.pagination || {
    current_page: 1,
    per_page: 20,
    total_pages: 1,
    next_page: null,
    previous_page: null
  };

  console.log('Products component - Current page:', current_page, 'Total pages:', total_pages);

  const handleCategoryChange = (category: string | null) => {
    console.log('Products handleCategoryChange - Selected category:', category);
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Products handleSearchChange - Search value:', value);
    setSearchWord(value);
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <NavLink to={`/products/create`} className={'btn bg-primary border-primary rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-white hover:text-primary hover:border-primary'}>
           Create Product  
        </NavLink>
        <div className='text-primary font-bold'>
          <button onClick={() => handleCategoryChange(null)} className='m-1 px-2 py-2 border-2 border-primary rounded-2xl hover:cursor-pointer hover:bg-primary hover:text-white' >All</button>
          {ProductCategories.data.map((category: ProductCategory) => {
            const { id, title } = category;
            return (
              <button onClick={() => handleCategoryChange(title)} className='m-1 px-2 py-2 border-2 border-primary rounded-2xl hover:cursor-pointer hover:bg-primary hover:text-white' key={id}>{title}</button>
            )
          })}
      </div>
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
                    onChange={handleSearchChange}
                    className="w-full bg-[white] border border-black rounded-lg p-3 pl-10 text-black placeholder-[#666666]"
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
                <button className="p-3 bg-primary hover:bg-[#03529c] border border-[white] rounded-lg hover:cursor-pointer transition-colors">
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
                    { loading ?     
                    <tr className='border-b text-[#000000] border-primary hover:bg-[hsl(0,0%,87%)] transition-colors'>
                      <td className="p-8 text-center" colSpan={10}>
                        <div className="h-screen flex items-center justify-center">
                          <span className="loading loading-ring loading-lg text-black">LOADING</span>
                        </div>
                      </td> 
                    </tr>
                    : filteredProds.length > 0 ? 
                      (
                      filteredProds.map((product: Product, index: number) => (
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
                            {product.product_category.title}
                          </td>
                          <td className="p-4 text-m text-center">
                            {product.producer.title}
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
          </>
        )}
      </div>
      {/* Pagination Controls */}
      {total_pages && total_pages > 1 && (
        <div className="join mt-6 flex justify-center">
          <input
            className="join-item btn btn-square border-black" 
            type="radio" 
            name="options" 
            onClick={() => handlePagination(previous_page)}
            disabled={!previous_page}
            aria-label="❮" 
          />
          {[...Array(total_pages).keys()].map((_, i) => {
            const pageNum = i + 1;
            return (
              <input 
                key={i} 
                className="join-item btn btn-square border-black" 
                type="radio" 
                name="options" 
                checked={current_page === pageNum}
                onClick={() => handlePagination(pageNum)}
                aria-label={`${pageNum}`} 
                readOnly
              />
            );
          })}
          <input
            className="join-item btn btn-square border-black" 
            type="radio" 
            name="options" 
            onClick={() => handlePagination(next_page)}
            disabled={!next_page}
            aria-label="❯" 
          />
        </div>
      )}
    </div>
  )
}

export default Products