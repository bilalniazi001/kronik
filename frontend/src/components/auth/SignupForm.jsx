import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  IdentificationIcon,
  MapPinIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import authService from '../../services/authService';
import { useAlert } from '../../hooks/useAlert';

// Moved outside the main component so it doesn't re-mount on every re-render (which caused focus loss)
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
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
    </div>
    <input
      type={type}
      name={name}
      id={name}
      value={value || ''}
      onChange={onChange}
      required
      className="block w-full pl-11 pr-10 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 
                 rounded-xl text-gray-900 dark:text-white placeholder-transparent focus:outline-none 
                 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 
                 transition-all duration-300 peer backdrop-blur-sm"
      placeholder={placeholder}
    />
    <label
      htmlFor={name}
      className="absolute left-11 -top-2.5 bg-white dark:bg-gray-900 px-1 text-sm font-medium text-gray-500 dark:text-gray-400 
                 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-500
                 pointer-events-none rounded-md"
    >
      {label}
    </label>

    {togglePassword && (
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-500 transition-colors"
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

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cnic: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.name.length < 3) {
      showError('Name must be at least 3 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Please enter a valid email address');
      return false;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      showError('Password must be at least 8 characters with 1 uppercase letter and 1 number');
      return false;
    }

    const phoneRegex = /^03[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      showError('Phone must be 11 digits starting with 03');
      return false;
    }

    const cnicRegex = /^[0-9]{13}$/;
    if (!cnicRegex.test(formData.cnic)) {
      showError('CNIC must be 13 digits without dashes');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.signup(formData);
      showSuccess('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.message || (error.errors && error.errors[0]?.message) || 'Registration failed';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] ml-auto mr-auto dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
          Create Account
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Join Attendly - Your intelligent attendance partner
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-4">
          {/* Name */}
          <FormInput
            label="Full Name"
            icon={UserIcon}
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
          />

          {/* CNIC */}
          <FormInput
            label="CNIC Number"
            icon={IdentificationIcon}
            name="cnic"
            placeholder="13 digits without dashes"
            value={formData.cnic}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <FormInput
          label="Email Address"
          icon={EnvelopeIcon}
          name="email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange}
        />

        {/* Password */}
        <FormInput
          label="Password"
          icon={LockClosedIcon}
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          value={formData.password}
          onChange={handleChange}
          togglePassword={true}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        {/* Phone */}
        <FormInput
          label="Phone Number"
          icon={PhoneIcon}
          name="phone"
          placeholder="03XXXXXXXXX"
          value={formData.phone}
          onChange={handleChange}
        />

        {/* Address */}
        <div className="relative group">
          <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none">
            <MapPinIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300 mt-1" />
          </div>
          <textarea
            name="address"
            id="address"
            value={formData.address || ''}
            onChange={handleChange}
            required
            rows="3"
            className="block w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 
                       rounded-xl text-gray-900 dark:text-white placeholder-transparent focus:outline-none 
                       focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 
                       transition-all duration-300 peer backdrop-blur-sm resize-none"
            placeholder="Enter your full address"
          />
          <label
            htmlFor="address"
            className="absolute left-11 -top-2.5 bg-white dark:bg-gray-900 px-1 text-sm font-medium text-gray-500 dark:text-gray-400 
                       transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                       peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-indigo-500
                       pointer-events-none rounded-md"
          >
            Residential Address
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="relative w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl 
                     hover:from-indigo-700 hover:to-purple-700 focus:outline-none 
                     disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 
                     shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 mt-6 overflow-hidden
                     group"
        >
          <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>

          {loading ? (
            <span className="flex items-center justify-center relative z-10">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
          ) : (
            <span className="relative z-10 flex items-center justify-center">
              Sign Up
            </span>
          )}
        </button>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors duration-200">
              Sign in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;