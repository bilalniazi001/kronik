import React from 'react';
import AdminLoginForm from '../components/auth/AdminLoginForm';
import AuthLayout from '../layouts/AuthLayout';

const AdminLoginPage = () => {
  return (
    <AuthLayout>
      <AdminLoginForm />
    </AuthLayout>
  );
};

export default AdminLoginPage;