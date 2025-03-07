import { SignIn } from '@clerk/clerk-react';
import React from 'react';

function SignIN() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
        <SignIn
          appearance={{
            layout: {
              socialButtonsVariant: 'auto', // or "inline" | "stacked"
            },
            variables: {
              colorPrimary: '#4F46E5', // لون الزر الرئيسي
              colorBackground: 'white', // خلفية النموذج شفافة
              colorText: '#333333', // لون النص
              colorInputBackground: '#F3F4F6', // خلفية المدخلات
              colorInputText: '#1F2937', // لون نص المدخلات
            },
          }}
        />
       
      </div>
    
  );
}

export default SignIN;