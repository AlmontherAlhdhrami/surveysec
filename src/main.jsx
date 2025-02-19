import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.jsx';
import SignIN from './auth/sign-in';
import Home from './pages/Home';
import Services from './pages/Services';
import CreateSurvey from './pages/CreateSurvey';
import MySurveys from './pages/MySurveys';
import UserDashboard from './pages/UserDashboard';
import About from './pages/About';
import Contact from './pages/Contact';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const router = createBrowserRouter([
  {
    path:'/',
    element:<Home/>
  },
  {
    

    path: '/',
    element: <App />,
    children: [
      
      { path: '/services', element: <Services /> },
      { path: '/create-survey', element: <CreateSurvey /> },
      { path: '/my-surveys', element: <MySurveys /> },
      { path: '/user-dashboard', element: <UserDashboard /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
    ],
  },
  {
    path: '/auth/sign-in',
    element: <SignIN />,
  },
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <RouterProvider router={router} />
    </ClerkProvider>
  </React.StrictMode>
);
