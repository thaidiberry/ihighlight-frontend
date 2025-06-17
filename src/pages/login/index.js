import "./style.css";
import LoginForm from "../../components/login/LoginForm";
import Footer from "../../components/login/Footer";
import AuthModal from "../../components/modals/AuthModal";
import { useState } from "react";

export default function Login() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // Default to login tab

  return (
    <div className="login-page">
      <div className="auth-container">
        <div className="auth-left">
          <img src={`${process.env.PUBLIC_URL}/icons/ihighlight.svg`} alt="Icon" />
          <h1>Discuss Highlights From The Web </h1>
        </div>
        <div className="auth-right">
          <div className="login_wrapper">
            {/* Login Form */}
            <LoginForm
              setVisible={(tab) => {
                setAuthTab(tab); // Set the correct tab (login/register/reset)
                setAuthModalOpen(true); // Open AuthModal
              }}
            />
            <Footer />
          </div>
        </div>
      </div>

      {/* Show AuthModal with correct tab */}
      {authModalOpen && (
        <AuthModal 
          onClose={() => setAuthModalOpen(false)}
          activeTab={authTab} // Pass the correct tab state!
        />
      )}
    </div>
  );
}

