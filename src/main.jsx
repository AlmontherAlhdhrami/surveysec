import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const router= createBrowserRouter([

  {
path:'/',
element:<App/>,
children:[{
path:'/'


}]
  },
{
  path:'/auth/sign-in',
  element:<SignIN/>
}

]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">

    <RouterProvider router={router} />
    </ClerkProvider>

  </StrictMode>,
)
