import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';

const FormInput = ({
  label,
  icon: Icon,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  togglePassword,
  showPassword,
  onTogglePassword
}) => (
  <div className="relative group w-full">
    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-300" />
    </div>
    <input
      type={type}
      name={name}
      id={name}
      value={value || ''}
      onChange={onChange}
      required
      className="block w-full pl-11 pr-10 py-3.5 bg-white border-2 border-gray-100 
                 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none 
                 focus:border-indigo-600 focus:bg-white 
                 transition-all hover:border-gray-200 duration-300 peer"
      placeholder=" "
    />
    <label
      htmlFor={name}
      className="absolute left-11 -top-2.5 bg-white px-1 text-sm font-medium text-gray-400 
                 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-600
                 pointer-events-none rounded-md"
    >
      {label}
    </label>

    {togglePassword && (
      <button
        type="button"
        padding="0"
        onClick={onTogglePassword}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 transition-colors bg-transparent border-none"
      >
        {showPassword ? (
          <EyeSlashIcon className="h-5 w-5" />
        ) : (
          <EyeIcon className="h-5 w-5" />
        )}
      </button>
    )}
  </div>
);

const AdminLoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { adminLogin } = useAuth();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminLogin(formData);
      showSuccess('Admin login successful!');
      navigate('/admin');
    } catch (error) {
      showError(error.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-100/50">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-indigo-500/10 rounded-2xl shadow-sm border border-indigo-500/20">
              <ShieldCheckIcon className="w-10 h-10 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
            Admin Portal
          </h2>
          <p className="text-gray-500 text-sm font-medium">Restricted access - Admin credentials required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Admin Email"
            icon={EnvelopeIcon}
            name="email"
            type="email"
            placeholder="admin@attendly.com"
            value={formData.email}
            onChange={handleChange}
          />

          <FormInput
            label="Admin Password"
            icon={LockClosedIcon}
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter admin password"
            value={formData.password}
            onChange={handleChange}
            togglePassword={true}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl 
                        hover:from-indigo-700 hover:to-purple-700 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 
                        shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 overflow-hidden
                        group"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>

              {loading ? (
                <span className="flex items-center justify-center relative z-10">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center">
                  Admin Login
                </span>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-gray-100">
            <p className="text-center text-gray-500 text-sm font-medium">
              Not an admin?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-200">
                Back to user login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginForm;
