import { customFetch } from '../../utils';
import { toast } from 'react-toastify';
import { NavLink, useLoaderData } from 'react-router-dom';
import type { Pagination } from '../Products/Products';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { Address } from '../Admin/AdminEdit';

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
  const user = useSelector((state: RootState) => state.userState.user);
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

  const { current_page, total_pages, next_page, previous_page } = socialProgramsData.pagination
 
  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <NavLink to={`/social_programs/create`} className={'btn bg-primary border-primary rounded-[8px] text-white p-2 pt-1 pb-1 m-1 hover:bg-white hover:text-primary hover:border-primary'}>
          Create Social Program
        </NavLink>
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
                    onChange={(e) => setSearchWord(e.target.value)}
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

export default SocialPrograms