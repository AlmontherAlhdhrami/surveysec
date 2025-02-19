import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.jsx';
import SignIN from './auth/sign-in';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateSurvey from './pages/CreateSurvey';

import About from './pages/About';
import Contact from './pages/Contact';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/Dashboard', element: <Dashboard/> },
      { path: '/create-survey', element: <CreateSurvey /> },
  
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
