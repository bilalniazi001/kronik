import React from 'react';
import SignupForm from '../components/auth/SignupForm';
import AuthLayout from '../layouts/AuthLayout';

const SignupPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-3xl opacity-50 animate-blob mix-blend-multiply filter pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-3xl opacity-50 mix-blend-multiply filter pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-pink-500/20 rounded-full blur-3xl opacity-50 mix-blend-multiply filter pointer-events-none"></div>

      {/* Content Container */}
      <div className="w-full relative z-10">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;