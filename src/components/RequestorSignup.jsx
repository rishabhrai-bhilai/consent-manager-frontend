import { useRef, useState, useEffect } from 'react';
import { faCheck, faTimes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const USERID_REGEX = /^[A-Za-z][A-Za-z0-9-_]{15}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const RequestorSignup = ({ role, setSuccess }) => {
  const userRef = useRef();
  const errRef = useRef();
  const uidRef = useRef();
  const navigate = useNavigate();

  const REGISTER_URL = `/${role}/signup`;

  const [name, setName] = useState('');
  const [type, setType] = useState('Other');
  const [registration_no, setRegistration_no] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [uid, setUid] = useState('');
  const [validUid, setValidUid] = useState(false);
  const [uidFocus, setUidFocus] = useState(false);

  const [user, setUser] = useState('');
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState('');
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState('');
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setValidName(USER_REGEX.test(user));
  }, [user]);

  useEffect(() => {
    setValidUid(USERID_REGEX.test(uid));
  }, [uid]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd, matchPwd, uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);
    const v3 = USERID_REGEX.test(uid);
    if (!v1 || !v2 || !v3) {
      setErrMsg('Invalid Entry');
      return;
    }

    try {
      const response = await axios.post(
        REGISTER_URL,
        JSON.stringify({
          name: name,
          email: email,
          contact_no: phone,
          address: address,
          registration_no: registration_no,
          type: type,
          username: user,
          password: pwd,
          key: uid,
          role: role,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      console.log(response?.data);

      if (response.data.status === 'success') {
        setSuccess(true);
        setUser('');
        setPwd('');
        setMatchPwd('');
        navigate('/registration-pending', {
          state: {
            status: 'pending',
            message: 'Your registration details have been submitted successfully! Waiting for admin approval...',
          },
        });
      } else {
        setErrMsg(response.data.message || 'Registration Failed');
        errRef.current.focus();
      }
    } catch (err) {
      if (!err?.response) {
        setErrMsg('No Server Response');
      } else if (err.response?.status === 409) {
        setErrMsg('Username Taken');
      } else {
        setErrMsg('Registration Failed');
      }
      errRef.current.focus();
    }
  };

  return (
    <>
      {/* Error Message */}
      <p
        ref={errRef}
        className={`text-center text-xs sm:text-sm text-red-500 dark:text-red-400 mb-2 sm:mb-3 ${
          errMsg ? 'block' : 'hidden'
        }`}
        aria-live="assertive"
      >
        {errMsg}
      </p>

      {/* Form */}
      <form className="flex flex-col gap-2 sm:gap-3 w-full" onSubmit={handleSubmit}>
        {/* Name, Email, and Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="relative">
            <label
              htmlFor="name"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Your name"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Your email"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="phone"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Mobile
            </label>
            <input
              type="tel"
              id="phone"
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
              required
              pattern="[0-9]{10}"
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Your phone number"
            />
          </div>
        </div>

        {/* Type, Registration No, and Unique ID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="relative">
            <label
              htmlFor="type"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
            >
              <option value="Bank">Bank</option>
              <option value="Government">Government</option>
              <option value="Private Company">Private Company</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="relative">
            <label
              htmlFor="registration_no"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Registration No
            </label>
            <input
              type="text"
              id="registration_no"
              onChange={(e) => setRegistration_no(e.target.value)}
              value={registration_no}
              required
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Registration number"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="uid"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Unique ID{' '}
              <FontAwesomeIcon
                icon={faCheck}
                className={validUid ? 'text-green-500 dark:text-green-400 ml-1 sm:ml-2' : 'hidden'}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validUid || !uid ? 'hidden' : 'text-red-500 dark:text-red-400 ml-1 sm:ml-2'}
              />
            </label>
            <input
              type="text"
              id="uid"
              ref={uidRef}
              autoComplete="off"
              onChange={(e) => setUid(e.target.value)}
              value={uid}
              required
              onFocus={() => setUidFocus(true)}
              onBlur={() => setUidFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="16 characters"
            />
            <p
              id="uidnote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                uidFocus && uid && !validUid ? 'block' : 'hidden'
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              Exactly 16 characters, starts with a letter.
            </p>
          </div>
        </div>

        {/* Address and Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="relative">
            <label
              htmlFor="address"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Address
            </label>
            <input
              type="text"
              id="address"
              autoComplete="off"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              required
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Your address"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="username"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Username{' '}
              <FontAwesomeIcon
                icon={faCheck}
                className={validName ? 'text-green-500 dark:text-green-400 ml-1 sm:ml-2' : 'hidden'}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validName || !user ? 'hidden' : 'text-red-500 dark:text-red-400 ml-1 sm:ml-2'}
              />
            </label>
            <input
              type="text"
              id="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              value={user}
              required
              aria-invalid={validName ? 'false' : 'true'}
              aria-describedby="uidnote"
              onFocus={() => setUserFocus(true)}
              onBlur={() => setUserFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Username"
            />
            <p
              id="uidnote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                userFocus && user && !validName ? 'block' : 'hidden'
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              4-24 characters, starts with a letter. Allowed: letters, numbers, underscores, hyphens.
            </p>
          </div>
        </div>

        {/* Password and Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password{' '}
              <FontAwesomeIcon
                icon={faCheck}
                className={validPwd ? 'text-green-500 dark:text-green-400 ml-1 sm:ml-2' : 'hidden'}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validPwd || !pwd ? 'hidden' : 'text-red-500 dark:text-red-400 ml-1 sm:ml-2'}
              />
            </label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
              aria-invalid={validPwd ? 'false' : 'true'}
              aria-describedby="pwdnote"
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Password"
            />
            <p
              id="pwdnote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                pwdFocus && !validPwd ? 'block' : 'hidden'
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              8-24 chars, upper/lowercase, number, special (!@#$%).
            </p>
          </div>
          <div className="relative">
            <label
              htmlFor="confirm_pwd"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirm{' '}
              <FontAwesomeIcon
                icon={faCheck}
                className={validMatch && matchPwd ? 'text-green-500 dark:text-green-400 ml-1 sm:ml-2' : 'hidden'}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validMatch || !matchPwd ? 'hidden' : 'text-red-500 dark:text-red-400 ml-1 sm:ml-2'}
              />
            </label>
            <input
              type="password"
              id="confirm_pwd"
              onChange={(e) => setMatchPwd(e.target.value)}
              value={matchPwd}
              required
              aria-invalid={validMatch ? 'false' : 'true'}
              aria-describedby="confirmnote"
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Confirm password"
            />
            <p
              id="confirmnote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                matchFocus && !validMatch ? 'block' : 'hidden'
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              Must match the password above.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          disabled={!validName || !validPwd || !validMatch || !validUid}
          type="submit"
          className="w-full px-4 sm:px-6 py-1 sm:py-2 bg-gradient-to-r from-primary to-accent dark:from-dark-primary dark:to-dark-accent text-white text-xs sm:text-base font-medium rounded-md shadow-sm hover:from-accent hover:to-primary dark:hover:from-dark-accent dark:hover:to-dark-primary disabled:bg-gray-400 dark:disabled:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-dark-primary transition-all duration-200"
        >
          Sign Up
        </button>
      </form>

      {/* Footer Link */}
      <div className="text-center mt-2 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        Already registered?{' '}
        <Link to="/login" className="text-accent dark:text-dark-accent hover:underline">
          Log in here
        </Link>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
};

export default RequestorSignup;