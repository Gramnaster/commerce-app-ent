import { NavLink, redirect, useLoaderData, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import type { Product, User } from '../Products/Products';
import type { Address } from '../Admin/AdminEdit';
import type { CompanySite } from '../WarehouseOrders/WarehouseOrders';
import { BackButton } from '../../components';


export interface Inventory {
  id: number;
  sku: string;
  qty_in_stock: number;
  company_site: CompanySite;
  company_site_id: number;
  product: Product;
  created_at: string;
}

export interface InventoryViewResponse {
  data: Inventory;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;
  const id = params.id;

  const InventoryViewQuery = {
    queryKey: ["InventoryView", id],
    queryFn: async () => {
      const response = await customFetch.get(`/inventories/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const InventoryViewDetails = await queryClient.ensureQueryData(InventoryViewQuery);
    return { InventoryViewDetails };
  } catch (error: any) {
    console.error('Failed to load inventory:', error);
    toast.error('Failed to load inventory details');
    return redirect('/inventories');
  }
};

const InventoriesView = () => {
  const { InventoryViewDetails } = useLoaderData() as {
    InventoryViewDetails: InventoryViewResponse;
  }
  const {
    id,
    sku,
    qty_in_stock,
    company_site: { title, site_type },
    product: { title: product_title, price },
    created_at
  } = InventoryViewDetails.data;

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
            <BackButton text="Back to Inventories list" />
          </div>
  
            <div className="w-[60%] bg-primary rounded-lg p-6 border border-gray-700">
              <div className=" mb-4 pb-2 border-b border-white flex items-center justify-between gap-1">
                <h2 className="text-xl font-bold text-white">
                  Inventory Information
                </h2>
              <NavLink to={`/inventories/edit/${id}`}><button className="btn bg-white border-primary text-l rounded-[8px] text-primary p-2 pt-1 pb-1 m-1 hover:border-white hover:bg-primary hover:text-white">Edit Inventory details</button></NavLink>
              </div>
              <div>
                  <div className="place-items-center text-[black] w-full">
                    <div className=" px-6 py-3 rounded-2xl bg-white w-full">
                      <div className="m-1">
                        <label className="block text-l font-bold mb-2">
                          Inventory ID:
                        </label>
                        <div>
                          {id}
                        </div>
                      </div>
                      <div className="m-1">
                        <label className="block text-l font-bold mb-2">
                          SKU:
                        </label>
                        {sku}
                      </div>
                      <div className="m-1">
                        <label className="block text-l font-bold mb-2">
                          Quantity in Stock:
                        </label>
                        {qty_in_stock}
                      </div>
                      <div className="m-1">
                        <label className="block text-l font-bold mb-2">
                          Creation date:
                        </label>
                        {formatDate(created_at)}
                      </div>
                      <div className="m-1">
                        <label className="block text-l font-bold mb-2">
                          Company Site:
                        </label>
                        <div>
                          <div>Site name: {title}</div>
                          <div>{site_type}</div>
                        </div>
                      </div>
                      <div className="m-1">
                        <label className="block text-l font-bold mb-2">
                          Product:
                        </label>
                        <div>
                          <div>Product name: {product_title}</div>
                          <div>Price: {price}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  )
}

export default InventoriesView