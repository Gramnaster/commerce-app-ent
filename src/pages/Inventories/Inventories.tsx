import { customFetch } from '../../utils';
import { toast } from 'react-toastify';
import { NavLink, useLoaderData } from 'react-router-dom';
import type { Pagination, Product } from '../Products/Products';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { Address } from '../Admin/AdminEdit';
import type { CompanySite, CompanySiteResponse } from '../WarehouseOrders/WarehouseOrders';
import { SearchBar, PaginationControls } from '../../components';

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
  
    const { current_page, total_pages } = inventoriesData.pagination


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
            <NavLink to={`/inventories/create`} className={'btn bg-primary border-primary rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-white hover:text-primary hover:border-primary'}>
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
                <SearchBar
                  searchValue={searchWord}
                  onSearchChange={handleSearchChange}
                  placeholder="Search here"
                />

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
          <PaginationControls
            currentPage={current_page || 1}
            totalPages={total_pages || 1}
            onPageChange={(page) => handlePagination(page)}
          />
        </div>
      </div>
  )
}

export default Inventories