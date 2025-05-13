import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';


// Corrected import path for SurveyProvider
import { SurveyProvider } from './context/surveycontexts'; 

import App from './App.jsx';
import SignIN from './auth/sign-in'; // Assuming this is a .jsx or .js file, ensure extension if needed by your setup
import Home from './pages/Home'; // Ensure extension if needed
import Dashboard from './pages/Dashboard'; // Ensure extension if needed
import SurveyBuilder from './pages/SurveyBuilder'; // Ensure extension if needed
import SurveyPreview from './pages/SurveyPreview'; // Ensure extension if needed
import About from './pages/About'; // Ensure extension if needed
import Contact from './pages/Contact'; // Ensure extension if needed
import ViewSurvey from './pages/ViewSurvey'; // Ensure extension if needed
import SurveyAnalysisPage from './pages/SurveyAnalysisPage'; // Ensure extension if needed

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const router = createBrowserRouter([
  { index: true, element: <Home /> },
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'builder', element: <SurveyBuilder /> },
      { path: 'builder/:surveyId', element: <SurveyBuilder /> },
      { path: 'preview', element: <SurveyPreview /> },
      { path: 'SurveyAnalysisPage', element: <SurveyAnalysisPage /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
    ],
  },
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
