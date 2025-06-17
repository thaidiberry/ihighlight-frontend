import React, { useRef, useState } from "react";

import LoginForm from "../login/LoginForm";
import RegisterForm from "../login/RegisterForm";
import ResetPasswordForm from "../login/ResetPasswordForm";
import ChangePasswordForm from "../login/ChangePasswordForm";
import "./authModal.css";
import DotLoader from "react-spinners/DotLoader";

function AuthModal({ onClose, activeTab: initialTab = "login" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [resetEmail, setResetEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [unmounting, setUnmounting] = useState(false);
  const modalRef = useRef(null);

  const closeWithDelay = () => {
    setIsVisible(false);
    setUnmounting(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("authModalOverlay")) {
      closeWithDelay();
    }
  };

  return (
    <div className="authModalOverlay" onClick={handleOverlayClick}>
      <div
        className={`authModalContent ${isVisible ? "fade-in" : "fade-out"}`}
        ref={modalRef}
      >
        <div className="auth_modal_content">
          <button className="closeButton" onClick={closeWithDelay}>
            X
          </button>
          <div className="auth-modal-container">
            <div className="modal-left">
              <img
                src={`${process.env.PUBLIC_URL}/icons/ihighlight.svg`}
                alt="Logo"
                className="modal-logo"
              />
              <h1 className="slogan">Discuss Highlights From The Web</h1>
            </div>
            <div className="modal-right">
              <div className="authModalTabs">
                <button
                  className={activeTab === "login" ? "active" : ""}
                  onClick={() => setActiveTab("login")}
                >
                  Login
                </button>
                <button
                  className={activeTab === "register" ? "active" : ""}
                  onClick={() => setActiveTab("register")}
                >
                  Register
                </button>
                <button
                  className={activeTab === "reset" ? "active" : ""}
                  onClick={() => setActiveTab("reset")}
                >
                  Reset Password
                </button>
              </div>

              <div className="authModalBody">
                {activeTab === "login" && !unmounting && (
                  <LoginForm
                    setVisible={setActiveTab}
                    visible={activeTab === "login"}
                    successMessage={successMessage}
                    onClose={closeWithDelay}
                  />
                )}

                {activeTab === "register" && !unmounting && (
                  <RegisterForm
                    setVisible={setActiveTab}
                    visible="register"
                    onClose={closeWithDelay}
                  />
                )}

                {activeTab === "reset" && !unmounting && (
                  <ResetPasswordForm
                    setVisible={setActiveTab}
                    setResetEmail={setResetEmail}
                    setError={setError}
                    setLoading={setLoading}
                  />
                )}

                {activeTab === "changePassword" && !unmounting && (
                  <ChangePasswordForm
                    resetEmail={resetEmail}
                    setVisible={setActiveTab}
                    setError={setError}
                    setSuccessMessage={setSuccessMessage}
                  />
                )}

                {loading && <DotLoader color="#1876f2" loading={loading} size={30} />}
                {error && <div className="error_text">{error}</div>}
                {successMessage && <div className="success_text">{successMessage}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;













