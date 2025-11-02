import { customFetch } from '../../utils';
import { toast } from 'react-toastify';
import { NavLink, useLoaderData } from 'react-router-dom';
import type { Pagination } from '../Products/Products';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { SearchBar, PaginationControls } from '../../components';

interface User {
  email: string;
  first_name: string;
  last_name: string;
}

interface Order {
  id: number;
  cart_status: string;
  is_paid: boolean;
  total_cost: number;
  items_count: number;
  total_quantity: string;
}

interface Receipt {
  id: number;
  transaction_type: 'purchase' | 'withdraw' | 'deposit' | 'donation';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  user_cart_order_id: number | null;
  user: User;
  created_at: string;
  order: Order | null;
}

interface ReceiptsResponse {
  data: Receipt[];
  pagination: Pagination;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

  const ReceiptsQuery = {
    queryKey: ['Receipts', id],
    queryFn: async () => {
      const response = await customFetch.get(`/receipts`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const [Receipts] = await Promise.all([
      queryClient.ensureQueryData(ReceiptsQuery)
    ]);
    return { Receipts };
  } catch (error: any) {
    console.error('Failed to load Receipts data:', error);
    toast.error('Failed to load Receipts data');
    return { Receipts: [] };
  }
};

const Receipts = () => {
  const [searchWord, setSearchWord] = useState('');
  const { Receipts } = useLoaderData() as {
    Receipts: ReceiptsResponse
  };
    const [receiptsData, setReceiptsData] = useState(Receipts)
    const user = useSelector((state: RootState) => state.userState.user);
    const [loading, setLoading] = useState(false);
    console.log(`Receipts`, Receipts)

  const handlePagination = async (page: number | null) => {
    if (!page) return;
    setLoading(true)
    
    try {
      const response = await customFetch.get(`/receipts?page=${page}&per_page=${receiptsData.pagination.per_page || 20}`);
      const data = response.data;
      console.log('Receipts handlePagination - Response:', data);
      setReceiptsData(data);
      setLoading(false);
    }
    catch (error: any) {
      console.error('Products handlePagination - Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
    }
  }

  const filteredReceipts = receiptsData.data.filter((receipt: Receipt) => {
    const matchesSearch =
      receipt.id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
      receipt.transaction_type?.toLowerCase().includes(searchWord.toLowerCase()) ||
      receipt.amount?.toString().includes(searchWord.toLowerCase()) ||
      receipt.balance_before.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
      receipt.balance_after.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
      receipt.description.toLowerCase().includes(searchWord.toLowerCase()) ||
      receipt.user?.email?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
      receipt.order?.cart_status?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
      receipt.created_at?.toString().toLowerCase().includes(searchWord.toLowerCase());

    return matchesSearch;
    })
    .sort(
    (a: Receipt, b: Receipt) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || [];

  const { current_page, total_pages } = receiptsData.pagination

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {
          <>
            {/* Search and Filter */}
            <SearchBar
              searchValue={searchWord}
              onSearchChange={(e) => setSearchWord(e.target.value)}
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
                      <th className="text-left p-4 text-s font-normal text-white">
                        Transaction Type
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Balance Before & After
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Description
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        User Email
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Cart Status
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
                    ) : filteredReceipts.length > 0 ? (
                      filteredReceipts.map(
                        (receipt: Receipt, index: number) => {
                          const {
                            id,
                            transaction_type,
                            balance_before,
                            balance_after,
                            description,
                            user,
                            order,
                          } = receipt;
                          console.log(`receipt`, receipt)
                          return (
                            <tr
                              key={id}
                              className={`border-b text-[#000000] border-primary hover:bg-white transition-colors ${
                                index % 2 === 0
                                  ? "bg-transparent"
                                  : "bg-[#f3f3f3]"
                              }`}
                            >
                              <td className="p-4 text-m text-left">{id}</td>
                              <td className="p-4 text-m text-center">
                                {transaction_type}
                              </td>
                              <td className="p-4 text-m text-center">
                                {balance_before === 0 && balance_after === 0
                                  ? "-"
                                  : `${balance_before} - ${balance_after}`}
                              </td>
                              <td className="p-4 text-m text-center">
                                {description}
                              </td>
                              <td className="p-4 text-m text-center">
                                {user?.email || 'Email not found, try refreshing the page'}
                              </td>
                              <td className={`p-4 text-m $`}>
                                {order ? order?.cart_status : "-"}
                              </td>
                              <td className={`p-4 text-m`}>
                                <NavLink to={`/receipts/${id}`}>
                                  <span className="hover:text-primary hover:underline">
                                    View Receipt Info
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
                          No producer found
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
  );
}

export default Receipts