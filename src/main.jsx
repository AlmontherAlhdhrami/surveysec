import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';

import { SurveyProvider } from './context/SurveyContext'; // <-- import your provider

import App from './App.jsx';
import SignIN from './auth/sign-in';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SurveyBuilder from './pages/SurveyBuilder';
import SurveyPreview from './pages/SurveyPreview';
import About from './pages/About';
import Contact from './pages/Contact';
import ViewSurvey from './pages/ViewSurvey';
import SurveyAnalysisPage from './pages/SurveyAnalysisPage';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const router = createBrowserRouter([
  { index: true, element: <Home /> },

  {
    path: '/',
    element: <App />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
    
      { path: 'preview', element: <SurveyPreview /> },
    

     
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
    ],
  },
  { path: 'builder', element: <SurveyBuilder /> },
  { path: 'builder/:surveyId', element: <SurveyBuilder /> },
  {path:'SurveyAnalysisPage',element:<SurveyAnalysisPage/>},

  { path: 'view', element: <ViewSurvey /> },
  { path: "view/:surveyId", element: <ViewSurvey /> },

  {
    path: '/auth/sign-in',
    element: <SignIN />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      {/* Wrap the entire router in SurveyProvider so every route can access it */}
      <SurveyProvider>
        <RouterProvider router={router} />
      </SurveyProvider>
    </ClerkProvider>
  </StrictMode>
);
