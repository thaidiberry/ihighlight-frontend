import { Formik, Form } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import LoginInput from "../../components/inputs/loginInput";
import { useState } from "react";
import DotLoader from "react-spinners/DotLoader";
import axios from "axios";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import GoogleSignInButton from "../auth/GoogleSignInButton";
import normalizeUser from "../../helpers/normalizeUser";

// 🔽 Custom component to close modal + redirect
function ForgotPasswordLink({ onClose }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClose) onClose(); // ✅ Close AuthModal
    navigate("/reset");     // ✅ Navigate to reset page
  };

  return (
    <span className="forgot_password" onClick={handleClick}>
      Forgotten password?
    </span>
  );
}

const loginInfos = {
  email: "",
  password: "",
};

export default function LoginForm({
  setVisible,
  successMessage,
  visible = true,
  onClose = () => {},
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, setLogin] = useState(loginInfos);
  const { email, password } = login;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLogin({ ...login, [name]: value });
  };

  const loginValidation = Yup.object({
    email: Yup.string()
      .required("Email Address is required.")
      .email("Must be a valid Email Address.")
      .max(100),
    password: Yup.string().required("Password is required."),
  });

  const loginSubmit = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/login`,
        { email, password }
      );
      dispatch({ type: "LOGIN", payload: data });
      Cookies.set("user", JSON.stringify(data));
      onClose();
      navigate("/");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const handleGoogleSignIn = async (credential) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/google-auth`,
        { token: credential }
      );

      const normalized = normalizeUser({
        ...data.user,
        token: data.token,
      });

      Cookies.set("user", JSON.stringify(normalized));
      dispatch({ type: "LOGIN", payload: normalized });

      setTimeout(() => {
        onClose();
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
          {successMessage && <div className="success_text">{successMessage}</div>}

          <Formik
            enableReinitialize
            initialValues={{ email, password }}
            validationSchema={loginValidation}
            onSubmit={loginSubmit}
          >
            {() => (
              <Form>
                <LoginInput
                  type="text"
                  name="email"
                  placeholder="Email Address"
                  onChange={handleLoginChange}
                />
                <LoginInput
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleLoginChange}
                  bottom
                />
                <button type="submit" className="black_btn">
                  Log In
                </button>
              </Form>
            )}
          </Formik>

          <ForgotPasswordLink onClose={onClose} />


          <div className="divider">OR</div>

          <div className="google_button_wrapper">
            <GoogleSignInButton
              onSuccess={handleGoogleSignIn} // ✅ fixed
              onError={() => setError("Google Sign-In was canceled or failed.")}
            />
          </div>


          <DotLoader color="#1876f2" loading={loading} size={30} />
          {error && <div className="error_text">{error}</div>}

          <div className="sign_splitter"></div>
          <button
            className="black_btn open_signup"
            onClick={(e) => {
              e.preventDefault();
              setVisible("register");
            }}
          >
            Create Account
          </button>
        </div>

        <Link to="/" className="sign_extra">
          <b>Create a Community</b> for any topic.
        </Link>
      </div>
    </div>
  );
}





