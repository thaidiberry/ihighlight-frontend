import { Form, Formik } from "formik";
import { useState } from "react";

import RegisterInput from "../inputs/registerInput";
import * as Yup from "yup";
import DateOfBirthSelect from "./DateOfBirthSelect";
import DotLoader from "react-spinners/DotLoader";
import axios from "axios";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import GoogleSignInButton from "../auth/GoogleSignInButton";
import normalizeUser from "../../helpers/normalizeUser";

export default function RegisterForm({ setVisible, visible, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userInfos = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    bYear: new Date().getFullYear(),
    bMonth: new Date().getMonth() + 1,
    bDay: new Date().getDate(),
  };

  const [user, setUser] = useState(userInfos);
  const { first_name, last_name, email, password, bYear, bMonth, bDay } = user;
  const yearTemp = new Date().getFullYear();

  const [dateError, setDateError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const years = Array.from(new Array(108), (_, i) => yearTemp - i);
  const months = Array.from(new Array(12), (_, i) => 1 + i);
  const getDays = () => new Date(bYear, bMonth, 0).getDate();
  const days = Array.from(new Array(getDays()), (_, i) => 1 + i);

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const registerValidation = Yup.object({
    first_name: Yup.string()
      .required("What's Your First Name?")
      .min(2, "First name must be at least 2 characters.")
      .max(16, "First name can't be more than 16 characters.")
      .matches(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed."),
    last_name: Yup.string()
      .required("What's Your Last Name?")
      .min(2, "Last name must be at least 2 characters.")
      .max(16, "Last name can't be more than 16 characters.")
      .matches(/^[aA-zZ]+$/, "No numbers or special characters."),
    email: Yup.string().required("Email is required.")
    .email("Please enter a valid email address."),
    password: Yup.string().required("Password is required.")
    .min(6, "Password must be at least 6 characters.")
    .max(36, "Password can't be more than 36 characters.")      ,
  });

  const registerSubmit = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/register`,
        { first_name, last_name, email, password, bYear, bMonth, bDay }
      );

      setError("");
      setSuccess(data.message);
      const { message, ...rest } = data;

      const normalized = normalizeUser(rest);
      setTimeout(() => {
        dispatch({ type: "LOGIN", payload: normalized });
        Cookies.set("user", JSON.stringify(normalized));
        if (onClose) onClose();
        navigate("/");
      }, 1500);
    } catch (err) {
      setLoading(false);
      setSuccess("");
      setError(err.response?.data?.message || "There has been a registration error.");
    }
  };

  const handleGoogleRegister = async (googleToken) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/google-auth`,
        { token: googleToken }
      );

      const normalized = normalizeUser({
        ...data.user,
        token: data.token, // ✅ Your app's internal JWT
      });

      dispatch({ type: "LOGIN", payload: normalized });
      Cookies.set("user", JSON.stringify(normalized));

      setTimeout(() => {
        if (onClose) onClose();
        navigate("/");
      }, 300);
    } catch (err) {
      setLoading(false);
      setError("Google Sign-In failed. Please try again.");
    }
  };

  return (
    <div className="login_wrap">
      <div className="login_2">
        <div className="login_2_wrap">
          <div className="register_header">
            <span>Sign Up</span>
            <span>It's Quick and Easy</span>
          </div>

          <Formik
            enableReinitialize
            initialValues={user}
            validationSchema={registerValidation}
            onSubmit={() => {
              const current = new Date();
              const picked = new Date(bYear, bMonth - 1, bDay);
              const minAge = new Date(1970 + 12, 0, 1);
              const maxAge = new Date(1970 + 110, 0, 1);

              if (current - picked < minAge || current - picked > maxAge) {
                setDateError("Please enter a valid date of birth.");
              } else {
                setDateError("");
                registerSubmit();
              }
            }}
          >
            {() => (
              <Form className="register_form">
                <div className="reg_line">
                  <RegisterInput
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    onChange={handleRegisterChange}
                  />
                  <RegisterInput
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    onChange={handleRegisterChange}
                  />
                </div>
                <div className="reg_line">
                  <RegisterInput
                    type="text"
                    name="email"
                    placeholder="Email Address"
                    onChange={handleRegisterChange}
                  />
                </div>
                <div className="reg_line">
                  <RegisterInput
                    type="password"
                    name="password"
                    placeholder="New Password"
                    onChange={handleRegisterChange}
                  />
                </div>

                <div className="reg_col">
                  <div className="reg_line_header">
                   When is Your Birthday?
                  </div>
                  <DateOfBirthSelect
                    bMonth={bMonth}
                    bDay={bDay}
                    bYear={bYear}
                    months={months}
                    days={days}
                    years={years}
                    handleRegisterChange={handleRegisterChange}
                    dateError={dateError}
                  />
                </div>

                <button type="submit" className="black_btn open_signup">
                  Sign Up
                </button>

                <div className="divider">OR</div>

                <div className="google_button_wrapper">
                  <GoogleSignInButton
                    onSuccess={handleGoogleRegister}
                    onError={() => setError("Google Sign-In was canceled or failed.")}
                  />
                </div>

                <DotLoader color="#1876f2" loading={loading} size={30} />
                {error && <div className="error_text">{error}</div>}
                {success && <div className="success_text">{success}</div>}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}


