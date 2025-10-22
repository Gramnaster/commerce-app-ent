import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Error, Home, Login, Signup, ProductsHome, Products, ProductView, ProductEdit, ProductCreate, ProducersHome, Producers, ProducerView, ProducerEdit, ProducerCreate, CategoriesHome, Categories, CategoryView, CategoryCreate, CategoryEdit, Admins, AdminView, AdminCreate, AdminEdit, AdminsHome, PromotionsHome, Promotions, PromotionCreate, PromotionEdit, PromotionView } from './pages/index.ts';
import { store } from './store.ts';


import {action as loginAction} from './pages/Login/Login';
import {action as registerAction} from './pages/Signup/Signup';

import {loader as productsHomeLoader} from './pages/Products/ProductsHome.tsx';
import {loader as productsLoader} from './pages/Products/Products.tsx';
import {loader as productViewAction} from './pages/Products/ProductView.tsx';
import {loader as productEditAction} from './pages/Products/ProductEdit.tsx';
import {loader as productCreateAction} from './pages/Products/ProductCreate.tsx';

import {loader as producersHomeLoader} from './pages/Producers/ProducersHome.tsx';
import {loader as producersLoader} from './pages/Producers/Producers.tsx';
import {loader as producerViewLoader} from './pages/Producers/ProducerView.tsx';
import {loader as producerCreateLoader} from './pages/Producers/ProducerCreate.tsx';
import {loader as producerEditLoader} from './pages/Producers/ProducerEdit.tsx';

import {loader as categoriesHomeLoader} from './pages/Categories/CategoriesHome.tsx';
import {loader as categoriesLoader} from './pages/Categories/Categories.tsx';
import {loader as categoryViewLoader} from './pages/Categories/CategoryView.tsx';
import {loader as categoryCreateLoader} from './pages/Categories/CategoryCreate.tsx';
import {loader as categoryEditLoader} from './pages/Categories/CategoryEdit.tsx';

import {loader as adminsHomeLoader} from './pages/Admin/AdminsHome.tsx';
import {loader as adminsLoader} from './pages/Admin/Admins.tsx';
import {action as adminsCreateAction} from './pages/Admin/AdminCreate.tsx';
import {loader as adminViewLoader} from './pages/Admin/AdminView.tsx';
import {loader as adminEditLoader} from './pages/Admin/AdminEdit.tsx';

import {loader as promotionsHomeLoader} from './pages/Promotions/PromotionsHome.tsx';
import {loader as promotionsLoader} from './pages/Promotions/Promotions.tsx';
import {loader as promotionViewLoader} from './pages/Promotions/PromotionView.tsx';
import {action as promotionCreateAction} from './pages/Promotions/PromotionCreate.tsx';
import {loader as promotionEditLoader} from './pages/Promotions/PromotionEdit.tsx';
// import {loader as adminsLoader} from './pages/Admin/Admins.tsx';
// import {action as adminsCreateAction} from './pages/Admin/AdminCreate.tsx';
// import {loader as adminViewLoader} from './pages/Admin/AdminView.tsx';
// import {loader as adminEditLoader} from './pages/Admin/AdminEdit.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

// Routes that need authentication before you can access it
const router = createBrowserRouter([
  {
    // localhost:3000/
    path: '/',
    element: <Home />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        // element: <FeaturedProducts />
      },
      {
        path: 'products',
        element: <ProductsHome />,
        loader: productsHomeLoader(queryClient, store),
        children: [
          {
            // index
            index: true,
            element: <Products />,
            loader: productsLoader(queryClient, store)
          },
          {
            // create
            path: 'create',
            element: <ProductCreate  />,
            loader: productCreateAction(queryClient, store)
          },  
          {
            // show
            path: ':id',
            element: <ProductView />,
            loader: productViewAction(queryClient, store),
          },        
          {
            // edit / update / delete
            path: 'edit/:id',
            element: <ProductEdit  />,
            loader: productEditAction(queryClient, store)
          },        
        ]
      },
      {
        path: 'producers',
        element: <ProducersHome />,
        loader: producersHomeLoader(queryClient, store),
        children: [
          {
            // index
            index: true,
            element: <Producers  />,
            loader: producersLoader(queryClient, store)
          },        
          {
            // show
            path: ':id',
            element: <ProducerView  />,
            loader: producerViewLoader(queryClient, store)
          },
          {
            // create
            path: 'create',
            element: <ProducerCreate  />,
            loader: producerCreateLoader(queryClient, store)
          },
          {
            // edit / update / delete
            path: 'edit/:id',
            element: <ProducerEdit  />,
            loader: producerEditLoader(queryClient, store)
          },
        ]
      },
      {
        // index
        path: 'categories',
        element: <CategoriesHome  />,
        loader: categoriesHomeLoader(queryClient, store),
        children: [
          {
            // index
            index: true,
            element: <Categories  />,
            loader: categoriesLoader(queryClient, store)
          },        
          {
            // show
            path: ':id',
            element: <CategoryView  />,
            loader: categoryViewLoader(queryClient, store)
          },
          {
            // create
            path: 'create',
            element: <CategoryCreate  />,
            loader: categoryCreateLoader(queryClient, store)
          },
          {
            // edit / update / delete
            path: 'edit/:id',
            element: <CategoryEdit  />,
            loader: categoryEditLoader(queryClient, store)
          },
        ]
      },
      {
        path: 'admins',
        element: <AdminsHome />,
        loader: adminsHomeLoader(queryClient, store),
        children: [
          {
            // index
            index: true,
            element: <Admins />,
            loader: adminsLoader(queryClient, store),
          },
          {
            // show
            path: ':id',
            element: <AdminView />,
            loader: adminViewLoader(queryClient, store)
          },
          {
            // create
            path: 'create',
            element: <AdminCreate />,
            action: adminsCreateAction
          },
          {
            // edit / update / delete
            path: 'edit/:id',
            element: <AdminEdit />,
            loader: adminEditLoader(queryClient, store)
          },
        ]
      },      
      {
        path: 'promotions',
        element: <PromotionsHome />,
        loader: promotionsHomeLoader(queryClient, store),
        children: [
          {
            // index
            index: true,
            element: <Promotions />,
            loader: promotionsLoader(queryClient, store),
          },
          {
            // show
            path: ':id',
            element: <PromotionView />,
            loader: promotionViewLoader(queryClient, store)
          },
          {
            // create
            path: 'create',
            element: <PromotionCreate />,
            action: promotionCreateAction
          },
          {
            // edit / update / delete
            path: 'edit/:id',
            element: <PromotionEdit />,
            loader: promotionEditLoader(queryClient, store)
          },
        ]
      },
      {
        path: 'dashboard',
        // element: <Dashboard />,
        children: [
          {
            // localhost:3000/profile
            index: true,
            // element: <MainPage />,
          },
          {
            // localhost:3000/profile
            path: 'profile',
            // element: <Profile />,
            // loader: profileLoader(queryClient, store),
            children: [
              {
                path: 'view/:id',
                // element: <ProfileView />,
                // loader: profileViewAction(queryClient, store)
              },
              {
                path: 'edit/:id',
                // element: <ProfileEdit />,
                // loader: profileEditAction(queryClient, store)
              },
              {
                path: 'transactions',
                // element: <ProfileReceipts />
              },
            ]
          },
          {
            path: 'cart',
            // element: <Cart />
          },
        ]
      }

    ]
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <Error />,
    action: loginAction(store),
  },
  {
    path: '/signup',
    element: <Signup />,
    errorElement: <Error />,
    action: registerAction,
  },
  {
    path: '*',
    element: <Error />
  },

])

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
export default App
