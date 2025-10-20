import { NavLink, redirect, useLoaderData } from "react-router-dom";
import { toast } from "react-toastify";
import { customFetch } from "../../utils";

interface ProductCategory {
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
  products_count: number
  address: Address
}

interface Product {
  id: number;
  title: string;
  product_category: ProductCategory;
  producer: Producer;
  description: string;
  price: number;
  promotion_id: boolean;
  product_image_url: string;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const admin_user = storeState.userState?.user;

  const id = params.id;

  const ProducersQuery = {
    queryKey: ['ProducersDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/producers`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      console.log(`ProductEdit producers`, response.data)
      return response.data;
    },
  };

  const ProducerViewQuery = {
    queryKey: ['ProductDetails', id],
    queryFn: async () => {
      const response = await customFetch.get(`/producers/${id}`, {
        headers: {
          Authorization: admin_user.token,
        },
      });
      return response.data;
    },
  };
  console.log(`ProducerView ProducerViewQuery`, ProducerViewQuery)

  try {
    const AllProducersDetails = await queryClient.ensureQueryData(ProducersQuery);
    const ProducerDetails = await queryClient.ensureQueryData(ProducerViewQuery);
    return { ProducerDetails };
  } catch (error: any) {
    console.error('Failed to load product:', error);
    toast.error('Failed to load product details');
    return redirect('/products');
  }
};

const ProducerView = () => {
  const { ProducerDetails } = useLoaderData() as {
    ProducerDetails: Producer;
  }

  const { id, title, products_count, address: { unit_no, street_no, address_line1, address_line2, city, region, zipcode, country } } = ProducerDetails.data;

  console.log(`ProducerView ProducerDetails`, ProducerDetails.data)
  return (
    <div>
      <div>
        <div>Producer Name: {title}</div>
        <div>Products Count: {products_count}</div>
        <div>
          <div>Address:</div>
          <div>Unit #: {unit_no}</div>
          <div>Street #: {street_no}</div>
          <div>Address line 1: {address_line1}</div>
          <div>Address line 2: {address_line2}</div>
          <div>City: {city}</div>
          <div>Region: {region}</div>
          <div>Zipcode:{zipcode}</div>
          <div>Country: {country}</div>
        </div>
      </div>
      <NavLink to={`/producers/edit/${id}`}>Edit Producer</NavLink>
    </div>
  )
}

export default ProducerView