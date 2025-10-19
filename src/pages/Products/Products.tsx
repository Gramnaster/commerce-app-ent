import { useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface ProductCategory {
  id: number;
  title: string;
}

interface Producer {
  id: number;
  title: string;
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
  const user = storeState.userState?.user;
  const id = params.id;

  const allProductsQuery = {
    queryKey: ['allProducts'],
    queryFn: async () => {
      const response = await customFetch.get('/products');
      console.log('Products response.data:', response.data)
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
      console.log(`ProductEdit product_categories`, response.data)
      return response.data;
    },
  };

  try {
    const [allProducts, ProductCategories] = await Promise.all([
      queryClient.ensureQueryData(allProductsQuery),
      queryClient.ensureQueryData(ProductCategoriesQuery)
    ]);

    console.log('Products allProducts :', allProducts)
    console.log('Products ProductCategories :', ProductCategories)
    return { allProducts, ProductCategories };
  } catch (error: any) {
    console.error('Failed to load Product data:', error);
    toast.error('Failed to load Product data');
    return { allStocks: [] };
  }
};

const Products = () => {
  const { allProducts, ProductCategories } = useLoaderData() as {
    allProducts: Product[],
    ProductCategories: ProductCategory[]
  };
  const [products, setProducts] = useState(allProducts.data)
  const [ productCategories, SetProductCategories] = useState(ProductCategories.data)
  console.log('Products products :', products)
  console.log('Products ProductCategoriesDetails :', productCategories)

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = products.filter((product: Product) => selectedCategory ? product.product_category.title === selectedCategory : true );

  return (
    <div>
      <button onClick={() => setSelectedCategory(null)} className='m-1'>All</button>
      {productCategories.map((category: ProductCategory) => {
        const { id, title } = category;
        return (
          <button onClick={() => setSelectedCategory(`${title}`)} className='m-1' key={id}>{title}</button>
        )
      })}
       <NavLink to={`/products/create`}>Create Product</NavLink>
      <div className='m-1 text-red-50'> Products </div>
      {filteredProducts.map((product: Product) => {
        const { id, title, product_category, producer, description, price, promotion_id, product_image_url } = product;
        return(
          <div key={id}>
            <div>Product Name: {title}</div>
            <NavLink to={`/products/${id}`}><img src={product_image_url} className="w-[100px]" /></NavLink>
            <div>Category: {product_category.title}</div>
            <div>Producer: {producer.title}</div>
            <div>Product Description:{description}</div>
            <div>Price: {price}</div>
            <div>{!promotion_id ? "No active promotions": "WHAATTT"}</div>
          </div>
        )
      })}

    </div>
  )
}

export default Products