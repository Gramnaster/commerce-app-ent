import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Error, Home, Login, Signup, Products, ProductView, ProductEdit, ProductCreate } from './pages/index.ts';
import { store } from './store.ts';


import {action as loginAction} from './pages/Login/Login';
import {action as registerAction} from './pages/Signup/Signup';

import {loader as productsLoader} from './pages/Products/Products.tsx';
import {loader as productViewAction} from './pages/Products/ProductView.tsx';
import {loader as productEditAction} from './pages/Products/ProductEdit.tsx';
import {loader as productCreateAction} from './pages/Products/ProductCreate.tsx';

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
        // index
        path: 'products',
        element: <Products />,
        loader: productsLoader(queryClient, store),
      },          
      {
        // show / destroy
        path: 'products/:id',
        element: <ProductView />,
        loader: productViewAction(queryClient, store),
      },        
      {
        // edit / update
        path: 'products/edit/:id',
        element: <ProductEdit  />,
        // loader: productViewAction(queryClient, store),
        loader: productEditAction(queryClient, store)
      },        
      {
        // edit / update
        path: 'products/create',
        element: <ProductCreate  />,
        // loader: productViewAction(queryClient, store),
        loader: productCreateAction(queryClient, store)
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
