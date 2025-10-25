import { NavLink, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";

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

  const CategoryViewQuery = {
    queryKey: ['CategoryDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/product_categories/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const CategoryDetails = await queryClient.ensureQueryData(CategoryViewQuery);
    return { CategoryDetails };
  } catch (error: any) {
    console.error('Failed to load category details:', error);
    toast.error('Failed to load category details');
    return redirect('/products');
  }
};

const CategoryView = () => {
  const { CategoryDetails } = useLoaderData() as {
    CategoryDetails: ProductCategory;
  }
  const navigate = useNavigate();
  const { id, title, products_count, created_at } = CategoryDetails.data;

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
          onClick={() => navigate(`/categories`)}
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
          Back to Categories list
        </button>
        </div>

          <div className="w-[60%] bg-[#BE493D] rounded-lg p-6 border border-gray-700">
            <div className=" mb-4 pb-2 border-b border-white flex items-center justify-between gap-1">
              <h2 className="text-xl font-bold text-white">
                Category Information
              </h2>
              <NavLink to={`/categories/edit/${id}`}>
                <button className="btn bg-[hsl(5,100%,98%)] border-[#BE493D] text-l rounded-[8px] text-[#BE493D] p-2 pt-1 pb-1 m-1 hover:border-[hsl(5,100%,98%)] hover:bg-[#BE493D] hover:text-white">
                  Edit Category Info
                </button>
              </NavLink>
            </div>
            <div>
                <div className="place-items-center text-[black] w-full">
                  <div className=" px-6 py-3 rounded-2xl bg-[hsl(5,100%,98%)] w-full">
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Category Name:
                      </label>
                      <div>
                        {title}
                      </div>
                    </div>
                    <div className="m-1">
                      <label className="block text-l font-bold mb-2">
                        Products Count:
                      </label>
                      {products_count}
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

export default CategoryView