import { customFetch } from '../../utils';
import { toast } from 'react-toastify';
import { NavLink, useLoaderData } from 'react-router-dom';
import type { Pagination, Product } from '../Products/Products';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { Address } from '../Admin/AdminEdit';
import type { CompanySite, CompanySiteResponse } from '../WarehouseOrders/WarehouseOrders';

export interface Inventory {
  id: number;
  sku: string;
  qty_in_stock: number;
  company_site: CompanySite;
  product: Product;
  created_at: string;
}

interface InventoriesResponse {
  data: Inventory[];
  pagination: Pagination;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

  const InventoriesQuery = {
    queryKey: ['Inventories', id],
    queryFn: async () => {
      const response = await customFetch.get(`/inventories`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  const CompanySitesQuery = {
    queryKey: ['CompanySitesDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/company_sites`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      console.log('Products loader - product_categories response.data:', response.data)
      return response.data;
    },
  };

  try {
    const [Inventories, CompanySites] = await Promise.all([
      queryClient.ensureQueryData(InventoriesQuery),
      queryClient.ensureQueryData(CompanySitesQuery)
    ]);
    return { Inventories, CompanySites };
  } catch (error: any) {
    console.error('Failed to load Inventories data:', error);
    toast.error('Failed to load Inventories data');
    return { Inventories: [] };
  }
};

const Inventories = () => {
  const {Inventories, CompanySites} = useLoaderData() as {
    Inventories: InventoriesResponse
    CompanySites: CompanySiteResponse
  };
    const [inventoriesData, setInventoriesData] = useState(Inventories)
    console.log(`inventoriesData`, inventoriesData)
    const [searchWord, setSearchWord] = useState('');
    const [selectedSite, setSelectedSite] = useState<string | null>(null);
    const user = useSelector((state: RootState) => state.userState.user);
    const [loading, setLoading] = useState(false);
  
    const handlePagination = async (page: number | null) => {
      if (!page) return;
      setLoading(true)
      
      try {
        const response = await customFetch.get(`/inventories?page=${page}&per_page=${inventoriesData.pagination.per_page || 20}`);
        const data = response.data;
        console.log('SocialPrograms handlePagination - Response:', data);
        setInventoriesData(data);
        setLoading(false);
      }
      catch (error: any) {
        console.error('Products handlePagination - Failed to load pagination data:', error);
        toast.error('Failed to load pagination data');
      }
    }
   
    const filteredInventories = inventoriesData.data.filter((inventory: Inventory) => {
      const matchesSearch =
        inventory.id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
        inventory.sku.toLowerCase().includes(searchWord.toLowerCase()) ||
        inventory.company_site.title.toLowerCase().includes(searchWord.toLowerCase()) ||
        inventory.company_site.site_type.toLowerCase().includes(searchWord.toLowerCase()) ||
        inventory.product.title.toLowerCase().includes(searchWord.toLowerCase()) ||
        inventory.created_at?.toString().toLowerCase().includes(searchWord.toLowerCase());

    const matchesCategory = selectedSite
      ? inventory.company_site.title === selectedSite
      : true;

    return matchesSearch && matchesCategory;
      })
      .sort(
      (a: Inventory, b: Inventory) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || [];
  
    const { current_page, total_pages, next_page, previous_page } = inventoriesData.pagination


  const handleSiteChange = (site: string | null) => {
    setSelectedSite(site);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Products handleSearchChange - Search value:', value);
    setSearchWord(value);
  };

  return (
    <div>
        <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
          <div className="max-w-7xl mx-auto">
            <NavLink to={`/social_programs/create`} className={'btn bg-primary border-primary rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-white hover:text-primary hover:border-primary'}>
              Create Inventory
            </NavLink>
                    <div className='text-primary font-bold'>
                      <button onClick={() => handleSiteChange(null)} className='m-1 px-2 py-2 border-2 border-primary rounded-2xl hover:cursor-pointer hover:bg-primary hover:text-white' >All</button>
                      {CompanySites.data.map((site: CompanySite) => {
                        const { id, title } = site;
                        return (
                          <button onClick={() => handleSiteChange(title)} className='m-1 px-2 py-2 border-2 border-primary rounded-2xl hover:cursor-pointer hover:bg-primary hover:text-white' key={id}>{title}</button>
                        )
                      })}
                  </div>
            {
              <>
                {/* Search and Filter */}
                <div className="bg-primary rounded-lg p-6 border border-primary mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Search here"
                        value={searchWord}
                        onChange={handleSearchChange}
                        className="w-full bg-white border border-primary rounded-lg p-3 pl-10 text-black placeholder-[#666666]"
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
                    <button className="p-3 bg-primary hover:bg-[#03529c] border border-white rounded-lg hover:cursor-pointer transition-colors">
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
                            ID
                          </th>
                          <th className="text-center p-4 text-s font-normal text-white">
                            SKU
                          </th>
                          <th className="text-center p-4 text-s font-normal text-white">
                            Quantity in Stock
                          </th>
                          <th className="text-center p-4 text-s font-normal text-white">
                            Company Site
                          </th>
                          <th className="text-center p-4 text-s font-normal text-white">
                            Product name
                          </th>
                          <th className="text-center p-4 text-s font-normal text-white">
                            Price
                          </th>
                          <th className="text-center p-4 text-s font-normal text-white">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr className="border-b text-[#000000] border-primary hover:bg-[hsl(0,0%,87%)] transition-colors">
                            <td className="p-8 text-center" colSpan={10}>
                              <div className="h-screen flex items-center justify-center">
                                <span className="loading loading-ring loading-lg text-black">
                                  LOADING
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredInventories.length > 0 ? (
                          filteredInventories.map(
                            (inventory: Inventory, index: number) => {
                              const {
                                id,
                                sku,
                                qty_in_stock,
                                company_site :{
                                  title
                                },
                                product: {
                                  title: product_title,
                                  price
                                }
                              } = inventory;
                              return (
                                <tr
                                  key={id}
                                  className={`border-b text-[#000000] border-primary hover:bg-white transition-colors ${
                                    index % 2 === 0
                                      ? "bg-transparent"
                                      : "bg-[#f3f3f3]"
                                  }`}
                                >
                                  <td className="p-4 text-m text-center">
                                    {id}
                                  </td>
                                  <td className="p-4 text-m text-center">
                                    {sku}
                                  </td>
                                  <td className="p-4 text-m text-center">
                                    {qty_in_stock}
                                  </td>
                                  <td className="p-4 text-m text-center">
                                    {title}
                                  </td>
                                  <td className="p-4 text-m text-center">
                                    {product_title}
                                  </td>
                                  <td className="p-4 text-m text-center">
                                    {price}
                                  </td>
                                  <td className={`p-4 text-m`}>
                                    <NavLink to={`/inventories/${id}`}>
                                      <span className="hover:text-primary hover:underline">
                                        View Inventory Info
                                      </span>
                                    </NavLink>
                                  </td>
                                </tr>
                              );
                            }
                          )
                        ) : (
                          <tr className="w-full">
                            <td
                              colSpan={6}
                              className="p-8 w-full text-center text-black text-m bg-transparent"
                            >
                              No inventories found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            }
          </div>
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
      </div>
  )
}

export default Inventories