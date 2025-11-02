import { customFetch } from '../../utils';
import { toast } from 'react-toastify';
import { NavLink, useLoaderData } from 'react-router-dom';
import type { Pagination } from '../Products/Products';
import { useState } from 'react';
import type { Address } from '../Admin/AdminEdit';
import { SearchBar, PaginationControls } from '../../components';

export interface SocialProgram {
  id: number;
  title: string;
  description: string;
  address: Address
  created_at: string;
}

interface SocialProgramsResponse {
  data: SocialProgram[];
  pagination: Pagination;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

  const SocialProgramsQuery = {
    queryKey: ['SocialPrograms', id],
    queryFn: async () => {
      const response = await customFetch.get(`/social_programs`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const [SocialPrograms] = await Promise.all([
      queryClient.ensureQueryData(SocialProgramsQuery)
    ]);
    return { SocialPrograms };
  } catch (error: any) {
    console.error('Failed to load Social Programs data:', error);
    toast.error('Failed to load Social Programs data');
    return { SocialPrograms: [] };
  }
};

const SocialPrograms = () => {
  const {SocialPrograms} = useLoaderData() as {
    SocialPrograms: SocialProgramsResponse
  };
  const [socialProgramsData, setSocialProgramsData] = useState(SocialPrograms)
  console.log(`socialProgramsData`, socialProgramsData)
  const [searchWord, setSearchWord] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePagination = async (page: number | null) => {
    if (!page) return;
    setLoading(true)
    
    try {
      const response = await customFetch.get(`/social_programs?page=${page}&per_page=${socialProgramsData.pagination.per_page || 20}`);
      const data = response.data;
      console.log('SocialPrograms handlePagination - Response:', data);
      setSocialProgramsData(data);
      setLoading(false);
    }
    catch (error: any) {
      console.error('Products handlePagination - Failed to load pagination data:', error);
      toast.error('Failed to load pagination data');
    }
  }
 
  const filteredSocialPrograms = socialProgramsData.data.filter((program: SocialProgram) => {
    const matchesSearch =
      program.id?.toString().toLowerCase().includes(searchWord.toLowerCase()) ||
      program.title.toLowerCase().includes(searchWord.toLowerCase()) ||
      program.created_at?.toString().toLowerCase().includes(searchWord.toLowerCase());

    return matchesSearch;
    })
    .sort(
    (a: SocialProgram, b: SocialProgram) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || [];

  const { current_page, total_pages } = socialProgramsData.pagination
 
  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <NavLink to={`/social_programs/create`} className={'btn bg-primary border-primary rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-white hover:text-primary hover:border-primary'}>
          Create Social Program
        </NavLink>
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
                        Title
                      </th>
                      <th className="text-center p-4 text-s font-normal text-white">
                        Description
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
                    ) : filteredSocialPrograms.length > 0 ? (
                      filteredSocialPrograms.map(
                        (program: SocialProgram, index: number) => {
                          const {
                            id,
                            title,
                            description
                          } = program;
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
                                {title}
                              </td>
                              <td className="p-4 text-m text-center">
                                {description}
                              </td>
                              <td className={`p-4 text-m`}>
                                <NavLink to={`/social_programs/${id}`}>
                                  <span className="hover:text-primary hover:underline">
                                    View Program Info
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
  )
}

export default SocialPrograms