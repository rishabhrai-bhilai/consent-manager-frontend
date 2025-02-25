import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import axios from '../api/axios';
import loginSvg from '../asset/logins.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [role, setRole] = useState('individual');
  const LOGIN_URL = `/${role}/login`;

  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ username: user, password: pwd, role }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      const { token, userId } = response.data;

      login(user, role, token, userId);

      if (role === 'individual') {
        navigate('/individual/dashboard', { replace: true });
      } else if (role === 'requestor') {
        navigate('/requestor/dashboard', { replace: true });
      } else if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/unauthorized', { replace: true });
      }
    } catch (err) {
      if (!err.response) {
        setErrMsg('No Server Response');
      } else if (err.response.status === 400) {
        setErrMsg('Missing Username or Password');
      } else if (err.response.status === 401) {
        setErrMsg('Unauthorized');
      } else if (err.response.status === 450) {
        console.log(err.response.data);
        const { message, status } = err.response.data;
        navigate('/registration-pending', { state: { status, message } });
        return;
      } else {
        setErrMsg('Login Failed');
      }
      errRef.current.focus();
    }
  };

  return (
    <div className="flex w-screen h-screen bg-background dark:bg-dark-background">
      {/* Left Decorative Section (Visible on lg and above) */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary to-accent dark:from-dark-primary dark:to-dark-accent"
          style={{ opacity: 0.9 }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundImage: `url(${loginSvg})`, backgroundSize: 'cover', opacity: 0.2 }}
        />
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 bg-opacity-10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-3xl font-bold text-white dark:text-dark-text opacity-90 animate-pulse">
            Welcome Back
          </h2>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-white dark:bg-dark-background-black rounded-lg shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl">
          {/* Header with Icon */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-dark-background-grey flex items-center justify-center mb-4 animate-pulse">
              <FontAwesomeIcon
                icon={faUser}
                className="text-3xl sm:text-4xl text-accent dark:text-dark-accent"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text dark:text-dark-text text-center">
              Login to <span className="text-primary dark:text-dark-primary">App</span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              Welcome back! Log in to your account.
            </p>
          </div>

          {/* Error Message */}
          <p
            ref={errRef}
            className={`text-center text-sm text-red-500 dark:text-red-400 mb-4 ${
              errMsg ? 'block' : 'hidden'
            }`}
            aria-live="assertive"
          >
            {errMsg}
          </p>

          {/* Role Selection */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-6">
            {['individual', 'requestor', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium rounded-md shadow-sm transition-all duration-200 ${
                  role === r
                    ? 'bg-gradient-to-r from-primary to-accent dark:from-dark-primary dark:to-dark-accent text-white'
                    : 'bg-secondary dark:bg-dark-secondary text-text dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-background-grey'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="relative">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                ref={userRef}
                autoComplete="off"
                onChange={(e) => setUser(e.target.value)}
                value={user}
                required
                className="w-full p-3 text-sm text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
                placeholder="Enter your username"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                onChange={(e) => setPwd(e.target.value)}
                value={pwd}
                required
                className="w-full p-3 text-sm text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-2 bg-gradient-to-r from-primary to-accent dark:from-dark-primary dark:to-dark-accent text-white text-sm sm:text-base font-medium rounded-md shadow-sm hover:from-accent hover:to-primary dark:hover:from-dark-accent dark:hover:to-dark-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-dark-primary transition-all duration-200"
            >
              Submit
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Forgot your password?{' '}
            <a href="/forgot" className="text-accent dark:text-dark-accent hover:underline">
              Reset it here
            </a>
          </div>
          <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
            Don’t have an account?{' '}
            <a href="/signup" className="text-accent dark:text-dark-accent hover:underline">
              Sign up for free!
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;