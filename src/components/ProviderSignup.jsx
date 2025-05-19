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
const NAME_REGEX = /^[A-Za-z]{2,50}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Calculate age and validate date of birth
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  if (birthDate > today) {
    return false; // Future date is invalid
  }
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0; // Ensure age is non-negative
};

export const ProviderSignup = ({ role, setSuccess }) => {
  const userRef = useRef();
  const errRef = useRef();
  const navigate = useNavigate();

  const REGISTER_URL = "/api/auth/signup";

  const [fname, setFname] = useState("");
  const [validFname, setValidFname] = useState(false);
  const [fnameFocus, setFnameFocus] = useState(false);

  const [lname, setLname] = useState("");
  const [validLname, setValidLname] = useState(false);
  const [lnameFocus, setLnameFocus] = useState(false);

  const [mname, setMname] = useState("");
  const [validMname, setValidMname] = useState(true);
  const [mnameFocus, setMnameFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [phone, setPhone] = useState("");
  const [validPhone, setValidPhone] = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);

  const [dob, setDob] = useState("");
  const [validDob, setValidDob] = useState(false);
  const [dobFocus, setDobFocus] = useState(false);

  const [gender, setGender] = useState("");
  const [validGender, setValidGender] = useState(false);
  const [genderFocus, setGenderFocus] = useState(false);

  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyPair, setKeyPair] = useState(null);

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setValidName(USER_REGEX.test(user));
  }, [user]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd && pwd !== "");
  }, [pwd, matchPwd]);

  useEffect(() => {
    setValidFname(NAME_REGEX.test(fname));
  }, [fname]);

  useEffect(() => {
    setValidLname(NAME_REGEX.test(lname));
  }, [lname]);

  useEffect(() => {
    setValidMname(!mname || NAME_REGEX.test(mname));
  }, [mname]);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPhone(PHONE_REGEX.test(phone));
  }, [phone]);

  useEffect(() => {
    const isValidFormat = DATE_REGEX.test(dob);
    const isValidAge = isValidFormat ? calculateAge(dob) : false;
    setValidDob(isValidFormat && isValidAge);
  }, [dob]);

  useEffect(() => {
    setValidGender(gender === "Male" || gender === "Female");
  }, [gender]);

  useEffect(() => {
    setErrMsg("");
  }, [fname, lname, mname, email, phone, dob, gender, user, pwd, matchPwd]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const validations = [
      { field: "First Name", valid: validFname },
      { field: "Last Name", valid: validLname },
      { field: "Middle Name", valid: validMname },
      { field: "Email", valid: validEmail },
      { field: "Phone", valid: validPhone },
      { field: "Date of Birth", valid: validDob },
      { field: "Gender", valid: validGender },
      { field: "Username", valid: validName },
      { field: "Password", valid: validPwd },
      { field: "Confirm Password", valid: validMatch },
    ];
    const invalidField = validations.find((v) => !v.valid);
    if (invalidField) {
      setErrMsg(`Invalid ${invalidField.field}`);
      errRef.current.focus();
      return;
    }

    setIsLoading(true);
    try {
      // Generate and store key pair temporarily
      const generatedKeyPair = await generateRSAKeyPair();
      setKeyPair(generatedKeyPair);

      const response = await axios.post(
        REGISTER_URL,
        JSON.stringify({
          first_name: fname,
          middle_name: mname,
          last_name: lname,
          email: email,
          mobile_no: phone,
          date_of_birth: dob,
          gender: gender,
          username: user,
          password: pwd,
          publicKey: generatedKeyPair.publicKeyPem,
          role: "provider",
        }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        // Download private key on success
        downloadPrivateKey(generatedKeyPair.privateKeyPem, user);

        setSuccess(true);
        toast.success("Registration successful! Save your private key securely.");
        setFname("");
        setLname("");
        setMname("");
        setEmail("");
        setPhone("");
        setDob("");
        setGender("");
        setUser("");
        setPwd("");
        setMatchPwd("");
        setKeyPair(null); // Clear key pair
        navigate("/registration-pending", {
          state: {
            status: "pending",
            message: "Your registration details have been submitted successfully! Waiting for admin approval.",
          },
        });
      } else {
        setErrMsg(response.data.message || "Registration Failed");
        setKeyPair(null); // Clear key pair on failure
        errRef.current.focus();
      }
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (errorData.errors) {
          setErrMsg(errorData.errors.join("; "));
        } else {
          setErrMsg(errorData.message || "Username or Email Taken");
        }
      } else {
        setErrMsg("Registration Failed");
      }
      setKeyPair(null); // Clear key pair on error
      errRef.current.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <p
        ref={errRef}
        className={`text-center text-xs sm:text-sm text-red-500 dark:text-red-400 mb-2 sm:mb-3 ${
          errMsg ? "block" : "hidden"
        }`}
      >
        {errMsg}
      </p>
      <form className="flex flex-col gap-2 sm:gap-3 w-full" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="relative">
            <label htmlFor="fname" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name{" "}
              <FontAwesomeIcon icon={faCheck} className={validFname ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
              <FontAwesomeIcon icon={faTimes} className={validFname || !fname ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
            </label>
            <input
              type="text"
              id="fname"
              onChange={(e) => setFname(e.target.value)}
              value={fname}
              required
              onFocus={() => setFnameFocus(true)}
              onBlur={() => setFnameFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="First name"
            />
            <p
              id="fnamenote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                fnameFocus && fname && !validFname ? "block" : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              2-50 letters only.
            </p>
          </div>
          <div className="relative">
            <label htmlFor="mname" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Middle Name{" "}
              <FontAwesomeIcon icon={faCheck} className={validMname ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
              <FontAwesomeIcon icon={faTimes} className={validMname || !mname ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
            </label>
            <input
              type="text"
              id="mname"
              onChange={(e) => setMname(e.target.value)}
              value={mname}
              onFocus={() => setMnameFocus(true)}
              onBlur={() => setMnameFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Middle name (optional)"
            />
            <p
              id="mnamenote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                mnameFocus && mname && !validMname ? "block" : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              2-50 letters only if provided.
            </p>
          </div>
          <div className="relative">
            <label htmlFor="lname" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name{" "}
              <FontAwesomeIcon icon={faCheck} className={validLname ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
              <FontAwesomeIcon icon={faTimes} className={validLname || !lname ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
            </label>
            <input
              type="text"
              id="lname"
              onChange={(e) => setLname(e.target.value)}
              value={lname}
              required
              onFocus={() => setLnameFocus(true)}
              onBlur={() => setLnameFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
              placeholder="Last name"
            />
            <p
              id="lnamenote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                lnameFocus && lname && !validLname ? "block" : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              2-50 letters only.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
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
          <div className="relative">
            <label htmlFor="dob" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date of Birth{" "}
              <FontAwesomeIcon icon={faCheck} className={validDob ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
              <FontAwesomeIcon icon={faTimes} className={validDob || !dob ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
            </label>
            <input
              type="date"
              id="dob"
              autoComplete="off"
              onChange={(e) => setDob(e.target.value)}
              value={dob}
              required
              onFocus={() => setDobFocus(true)}
              onBlur={() => setDobFocus(false)}
              className="w-full p-1 sm:p-2 text-[10px] sm:text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-background-grey border border-outlines dark:border-dark-background-grey rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-dark-accent outline-none transition-all duration-200"
            />
            <p
              id="dobnote"
              className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
                dobFocus && dob && !validDob ? "block" : "hidden"
              }`}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              {DATE_REGEX.test(dob) ? "Date of birth cannot be in the future." : "Must be a valid date (YYYY-MM-DD)."}
            </p>
          </div>
        </div>
        <div className="relative">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gender{" "}
            <FontAwesomeIcon icon={faCheck} className={validGender ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
            <FontAwesomeIcon icon={faTimes} className={validGender || !gender ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
          </label>
          <div
            className="flex items-center gap-2 sm:gap-4"
            onFocus={() => setGenderFocus(true)}
            onBlur={() => setGenderFocus(false)}
          >
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="Male"
                onChange={(e) => setGender(e.target.value)}
                className="form-radio h-3 w-3 sm:h-4 sm:w-4 text-primary dark:text-dark-primary focus:ring-accent dark:focus:ring-dark-accent"
              />
              <span className="ml-1 text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">Male</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="gender"
                value="Female"
                onChange={(e) => setGender(e.target.value)}
                className="form-radio h-3 w-3 sm:h-4 sm:w-4 text-primary dark:text-dark-primary focus:ring-accent dark:focus:ring-dark-accent"
              />
              <span className="ml-1 text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">Female</span>
            </label>
          </div>
          <p
            id="gendernote"
            className={`text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-400 mt-1 ${
              genderFocus && !validGender ? "block" : "hidden"
            }`}
          >
            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
            Please select a gender.
          </p>
        </div>
        <div className="relative">
          <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Username{" "}
            <FontAwesomeIcon icon={faCheck} className={validName ? "text-green-500 dark:text-green-400 ml-1 sm:ml-2" : "hidden"} />
            <FontAwesomeIcon icon={faTimes} className={validName || !user ? "hidden" : "text-red-500 dark:text-red-400 ml-1 sm:ml-2"} />
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
              userFocus && user && !validName ? "block" : "hidden"
            }`}
          >
            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
            4-24 characters, starts with a letter. Allowed: letters, numbers, underscores, hyphens.
          </p>
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
          disabled={isLoading || !validFname || !validLname || !validMname || !validEmail || !validPhone || !validDob || !validGender || !validName || !validPwd || !validMatch}
          type="submit"
          className="w-full px-4 sm:px-6 py-1 sm:py-2 bg-gradient-to-r from-primary to-accent dark:from-dark-primary dark:to-dark-accent text-white text-xs sm:text-base font-medium rounded-md shadow-sm hover:from-accent hover:to-primary dark:hover:from-dark-accent dark:hover:to-dark-primary disabled:bg-gray-400 dark:disabled:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-dark-primary transition-all duration-200"
        >
          {isLoading ? "Submitting..." : "Sign Up"}
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

export default ProviderSignup;