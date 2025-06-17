import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

const ResetPasswordForm = ({ setVisible, setResetEmail, setError }) => { 
  const [step, setStep] = useState(1); // 1: Email input, 2: Code input
  const [email, setEmail] = useState("");
  const [guidanceMessage, setGuidanceMessage] = useState(""); // ✅ Stores the guidance message
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      setError(""); // Cleanup: Prevent state update on unmounted components
    };
  }, []);

  // Step 1: Handle Send Code
  const handleSendCode = async (values, { setSubmitting }) => {
    setError("");
    setLoading(true);
    setGuidanceMessage(""); // Reset guidance message

    console.log("📨 Sending request to backend with email:", values.email);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/sendResetPasswordCode`,
        { email: values.email }
      );

      console.log("✅ API Response:", response);
      setEmail(values.email);
      setResetEmail(values.email);

      // ✅ Show user a confirmation message
      setGuidanceMessage(`A verification code has been sent to ${values.email}. Please check your inbox.`);

      setStep(2);
    } catch (error) {
      console.error("❌ API Error:", error);
      setError(error.response?.data?.message || "Error sending code");
    }

    setLoading(false);
    setSubmitting(false);
  };

  // Step 2: Handle Verify Code
  const handleVerifyCode = async (values, { setSubmitting }) => {
    setError("");
    setLoading(true);

    console.log(`🔍 Verifying code: ${values.code} for email: ${email}`);

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/validateResetCode`, {
        email: email,
        code: values.code,
      });

      console.log("✅ Code verified successfully!");

      setVisible("changePassword"); // ✅ Move to the password reset step
    } catch (error) {
      console.error("❌ API Error:", error);
      setError(error.response?.data?.message || "Invalid code");
    }

    setLoading(false);
    setSubmitting(false);
  };

  return (
    <div className="reset-password-container">
      {step === 1 && (
        <Formik
          initialValues={{ email: "" }}
          validationSchema={Yup.object({ email: Yup.string().required("Email is required").email("Invalid email format") })}
          onSubmit={handleSendCode}
        >
          {({ isSubmitting }) => (
            <Form className="reset-password-form">
              <h2>Reset Password</h2>
              <Field type="email" name="email" placeholder="Enter your email" />
              <ErrorMessage name="email" component="div" className="error_text" />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Code"}
              </button>
              {guidanceMessage && <div className="success_text">{guidanceMessage}</div>} {/* ✅ Show guidance message */}
            </Form>
          )}
        </Formik>
      )}

      {step === 2 && (
        <Formik
          initialValues={{ code: "" }}
          validationSchema={Yup.object({ code: Yup.string().required("Code is required").length(5, "Code must be 5 digits") })}
          onSubmit={handleVerifyCode}
        >
          {({ isSubmitting }) => (
            <Form className="reset-password-form">
              <h2>Enter Verification Code</h2>
              <Field type="text" name="code" placeholder="Enter the code" />
              <ErrorMessage name="code" component="div" className="error_text" />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify Code"}
              </button>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default ResetPasswordForm;

