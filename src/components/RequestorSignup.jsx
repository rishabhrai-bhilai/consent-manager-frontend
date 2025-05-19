import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { generateRSAKeyPair } from "../utils/cryptoUtils";

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const NAME_REGEX = /^[A-Za-z\s]{2,100}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;
const REGNO_REGEX = /^[A-Za-z0-9]{5,50}$/;
const ADDRESS_REGEX = /^.{5,200}$/;

const RequestorSignup = ({ role, setSuccess }) => {
  const userRef = useRef();
  const errRef = useRef();
  const navigate = useNavigate();

  const REGISTER_URL = "/api/auth/signup";

  const [name, setName] = useState("");
  const [validName, setValidName] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);

  const [type, setType] = useState("Other");
  const [validType, setValidType] = useState(true);
  const [typeFocus, setTypeFocus] = useState(false);

  const [registration_no, setRegistration_no] = useState("");
  const [validRegNo, setValidRegNo] = useState(false);
  const [regNoFocus, setRegNoFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [phone, setPhone] = useState("");
  const [validPhone, setValidPhone] = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);

  const [address, setAddress] = useState("");
  const [validAddress, setValidAddress] = useState(false);
  const [addressFocus, setAddressFocus] = useState(false);

  const [user, setUser] = useState("");
  const [validUsername, setValidUsername] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState([]);

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setValidUsername(USER_REGEX.test(user));
  }, [user]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd && pwd !== "");
  }, [pwd, matchPwd]);

  useEffect(() => {
    setValidName(NAME_REGEX.test(name));
  }, [name]);

  useEffect(() => {
    setValidType(["Bank", "Government", "Private Company", "Other"].includes(type));
  }, [type]);

  useEffect(() => {
    setValidRegNo(REGNO_REGEX.test(registration_no));
  }, [registration_no]);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPhone(PHONE_REGEX.test(phone));
  }, [phone]);

  useEffect(() => {
    setValidAddress(ADDRESS_REGEX.test(address));
  }, [address]);

  useEffect(() => {
    setErrMsg([]);
  }, [name, type, registration_no, email, phone, address, user, pwd, matchPwd]);

  const downloadPrivateKey = (privateKeyPem, username) => {
    const blob = new Blob([privateKeyPem], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${username}_private_key.pem`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Map backend error messages to user-friendly versions
  const errorMessages = {
    "Username already exists": "This username is already taken.",
    "Email already exists": "This email is already registered.",
    "Username must be 4-24 characters, start with a letter, and contain only letters, numbers, underscores, or hyphens":
      "Username must be 4-24 characters, start with a letter, and only include letters, numbers, underscores, or hyphens.",
    "Password must be 8-24 characters, with uppercase, lowercase, number, and special character (!@#$%)":
      "Password must be 8-24 characters, including uppercase, lowercase, a number, and a special character (!@#$%).",
    "Name must be 2-100 characters, letters and spaces only": "Name must be 2-100 characters, letters and spaces only.",
    "Must be a valid email address": "Please enter a valid email address.",
    "Contact number must be exactly 10 digits": "Contact number must be exactly 10 digits.",
    "Address must be 5-200 characters": "Address must be 5-200 characters.",
    "Registration number must be 5-50 alphanumeric characters": "Registration number must be 5-50 alphanumeric characters.",
    "Type must be Bank, Government, Private Company, or Other": "Please select a valid type.",
    "Role must be provider, seeker, or admin": "Invalid role selected.",
    "Public key is required for provider and seeker": "Public key is missing.",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validations = [
      { field: "Name", valid: validName },
      { field: "Type", valid: validType },
      { field: "Registration No", valid: validRegNo },
      { field: "Email", valid: validEmail },
      { field: "Phone", valid: validPhone },
      { field: "Address", valid: validAddress },
      { field: "Username", valid: validUsername },
      { field: "Password", valid: validPwd },
      { field: "Confirm Password", valid: validMatch },
    ];
    const invalidField = validations.find((v) => !v.valid);
    if (invalidField) {
      setErrMsg([`Invalid ${invalidField.field}`]);
      errRef.current.focus();
      return;
    }

    try {
      const { publicKeyPem, privateKeyPem } = await generateRSAKeyPair();
      downloadPrivateKey(privateKeyPem, user);

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
          publicKey: publicKeyPem,
          role: "seeker",
        }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        setSuccess(true);
        toast.success("Registration successful! Save your private key securely.");
        setName("");
        setType("Other");
        setRegistration_no("");
        setEmail("");
        setPhone("");
        setAddress("");
        setUser("");
        setPwd("");
        setMatchPwd("");
        navigate("/registration-pending", {
          state: {
            status: "pending",
            message: "Your registration details have been submitted successfully! Waiting for admin approval.",
          },
        });
      }
    } catch (err) {
      let errors = [];
      if (!err?.response) {
        errors = ["No server response. Please try again later."];
      } else if (err.response?.status === 400) {
        if (err.response.data.errors) {
          errors = err.response.data.errors.map((e) => errorMessages[e] || e);
        } else {
          errors = [errorMessages[err.response.data.message] || err.response.data.message || "Registration failed"];
        }
      } else {
        errors = ["Registration failed. Please try again."];
      }
      setErrMsg(errors);
      errRef.current.focus();
    }
  };

  return (
    <>
      <div
        ref={errRef}
        className={`text-center text-xs sm:text-sm text-red-500 dark:text-red-400 mb-2 sm:mb-3 ${
          errMsg.length ? "block" : "hidden"
        }`}
      >
        {errMsg.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <form className="flex flex-col gap-2 sm:gap-3 w-full" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="relative">
            <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name{" "}
              <FontAwesomeIcon icon={faCheck} className={validName ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
              <FontAwesomeIcon icon={faTimes} className={validName || !name ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
            </label>
            <input
              type="text"
              id="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
              onFocus={() => setNameFocus(true)}
              onBlur={() => setNameFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Your name"
            />
            <p
              id="namenote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                nameFocus && name && !validName ? "block" : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              2-100 characters, letters and spaces only.
            </p>
          </div>
          <div className="relative">
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email{" "}
              <FontAwesomeIcon icon={faCheck} className={validEmail ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
              <FontAwesomeIcon icon={faTimes} className={validEmail || !email ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
            </label>
            <input
              type="email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Your email"
            />
            <p
              id="emailnote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                emailFocus && email && !validEmail ? "block" : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              Must be a valid email address.
            </p>
          </div>
          <div className="relative">
            <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mobile{" "}
              <FontAwesomeIcon icon={faCheck} className={validPhone ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
              <FontAwesomeIcon icon={faTimes} className={validPhone || !phone ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
            </label>
            <input
              type="tel"
              id="phone"
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
              required
              onFocus={() => setPhoneFocus(true)}
              onBlur={() => setPhoneFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Your phone number"
            />
            <p
              id="phonenote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                phoneFocus && phone && !validPhone ? "block" : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              Must be exactly 10 digits.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="relative">
            <label htmlFor="type" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type{" "}
              <FontAwesomeIcon icon={faCheck} className={validType ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
              <FontAwesomeIcon icon={faTimes} className={validType ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              onFocus={() => setTypeFocus(true)}
              onBlur={() => setTypeFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
            >
              <option value="Bank">Bank</option>
              <option value="Government">Government</option>
              <option value="Private Company">Private Company</option>
              <option value="Other">Other</option>
            </select>
            <p
              id="typenote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                typeFocus && !validType ? "block" : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              Please select a valid type.
            </p>
          </div>
          <div className="relative">
            <label htmlFor="registration_no" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Registration No{" "}
              <FontAwesomeIcon icon={faCheck} className={validRegNo ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
              <FontAwesomeIcon icon={faTimes} className={validRegNo || !registration_no ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
            </label>
            <input
              type="text"
              id="registration_no"
              onChange={(e) => setRegistration_no(e.target.value)}
              value={registration_no}
              required
              onFocus={() => setRegNoFocus(true)}
              onBlur={() => setRegNoFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Registration number"
            />
            <p
              id="regnonote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                regNoFocus && registration_no && !validRegNo ? "block" : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              5-50 alphanumeric characters.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="relative">
            <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address{" "}
              <FontAwesomeIcon icon={faCheck} className={validAddress ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
              <FontAwesomeIcon icon={faTimes} className={validAddress || !address ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
            </label>
            <input
              type="text"
              id="address"
              autoComplete="off"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              required
              onFocus={() => setAddressFocus(true)}
              onBlur={() => setAddressFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Your address"
            />
            <p
              id="addressnote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                addressFocus && address && !validAddress ? "block" : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              5-200 characters.
            </p>
          </div>
          <div className="relative">
            <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username{" "}
              <FontAwesomeIcon icon={faCheck} className={validUsername ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
              <FontAwesomeIcon icon={faTimes} className={validUsername || !user ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
            </label>
            <input
              type="text"
              id="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              value={user}
              required
              onFocus={() => setUserFocus(true)}
              onBlur={() => setUserFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Username"
            />
            <p
              id="uidnote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                userFocus && user && !validUsername ? "block" : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              4-24 characters, starts with a letter. Allowed: letters, numbers, underscores, hyphens.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="relative">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password{" "}
              <FontAwesomeIcon icon={faCheck} className={validPwd ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
              <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
            </label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Password"
            />
            <p
              id="pwdnote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                pwdFocus && !validPwd ? "block" : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              8-24 chars, upper/lowercase, number, special (!@#$%).
            </p>
          </div>
          <div className="relative">
            <label htmlFor="confirm_pwd" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm{" "}
              <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
              <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
            </label>
            <input
              type="password"
              id="confirm_pwd"
              onChange={(e) => setMatchPwd(e.target.value)}
              value={matchPwd}
              required
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Confirm password"
            />
            <p
              id="confirmnote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                matchFocus && !validMatch ? "block" : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              Must match the password above.
            </p>
          </div>
        </div>
        <button
          disabled={!validName || !validType || !validRegNo || !validEmail || !validPhone || !validAddress || !validUsername || !validPwd || !validMatch}
          type="submit"
          className="w-full px-4 sm:px-6 py-1 sm:py-2 bg-gradient-to-r from-primary to-accent dark:from-dark-primary dark:to-dark-accent text-white text-xs sm:text-base font-medium rounded-md shadow-sm hover:from-accent hover:to-primary dark:hover:from-dark-accent dark:hover:to-dark-primary disabled:bg-gray-400 dark:disabled:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-dark-primary transition-all duration-200"
        >
          Sign Up
        </button>
      </form>
      <div className="text-center mt-2 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        Already registered?{" "}
        <Link to="/login" className="text-accent dark:text-dark-accent hover:underline">
          Log in here
        </Link>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
};

export default RequestorSignup;