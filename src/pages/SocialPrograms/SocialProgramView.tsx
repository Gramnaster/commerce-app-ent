import { NavLink, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";  
import type { SocialProgram } from "./SocialPrograms";

interface Address {
  id: number,
  unit_no: string;
  street_no: string;
  address_line1: string;
  address_line2: string;
  city: string;
  region: string;
  barangay: string;
  zipcode: string;
  country_id: number;
  country: string;
}

export interface SocialProgramResponse {
  data: SocialProgram;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

  const SocialProgramDetailsQuery = {
    queryKey: ['SocialProgramDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/social_programs/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };
  console.log(`SocialProgramView SocialProgramDetailsQuery`, SocialProgramDetailsQuery)

  try {
    const SocialProgramDetails = await queryClient.ensureQueryData(SocialProgramDetailsQuery);
    return { SocialProgramDetails };
  } catch (error: any) {
    console.error('Failed to load social programs:', error);
    toast.error('Failed to load social programs details');
    return redirect('/social_programs');
  }
};

const SocialProgramView = () => {
  const { SocialProgramDetails } = useLoaderData() as {
    SocialProgramDetails: SocialProgramResponse;
  }
  const navigate = useNavigate();
  const { id, title, description, address: { unit_no, street_no, address_line1, address_line2, city, region, barangay, country }, created_at } = SocialProgramDetails.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#8d8d8d2a] text-white p-6">
      <div className="max-w-7xl mx-auto place-items-center ">
        <div className="mb-6 text-black">
          <button
          onClick={() => navigate(`/social_programs`)}
          className="mb-4 flex items-center gap-2 hover:underline transition-colors text-black">
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Social Programs list
        </button>
        </div>

          <div className="w-[60%] bg-primary rounded-lg p-6 border border-gray-700">
            <div className=" mb-4 pb-2 border-b border-white flex items-center justify-between gap-1">
              <h2 className="text-xl font-bold text-white">
                Social Program Information
              </h2>
              <NavLink to={`/social_programs/edit/${id}`}>
                <button className="btn bg-white border-primary text-l rounded-[8px] text-primary p-2 pt-1 pb-1 m-1 hover:border-[hsl(5,100%,98%)] hover:bg-primary hover:text-white">
                  Edit Social Program Info
                </button>
              </NavLink>
            </div>
            <div>
                <div className="place-items-center text-[black] w-full">
                  <div className=" px-6 py-3 rounded-2xl bg-white w-full">
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Social Program ID:
                      </label>
                      <div>
                        {id}
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Social Program title:
                      </label>
                      <div>
                        {title}
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Description:
                      </label>
                      {description}
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Address:
                      </label>
                      <div>
                        <div>Unit #: {unit_no}</div>
                        <div>Street #: {street_no}</div>
                        <div>Address Line 1: {address_line1 ? address_line1 : '-'}</div>
                        <div>Address Line 2: {address_line2 ? address_line2 : '-'}</div>
                        <div>Barangay: {barangay}</div>
                        <div>City: {city}</div>
                        <div>Region: {region ? region : '-'}</div>
                        <div>Country: {country}</div>
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Creation/Addition Date:
                      </label>
                      {formatDate(created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  )
}

export default SocialProgramView