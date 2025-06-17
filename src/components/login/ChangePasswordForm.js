import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";

const ChangePasswordForm = ({ resetEmail, setVisible, setError, setSuccessMessage }) => {
  return (
    <Formik
      initialValues={{ newPassword: "", confirmPassword: "" }}
      validationSchema={Yup.object({
        newPassword: Yup.string().min(6, "Password must be at least 6 characters").required("New Password is required."),
        confirmPassword: Yup.string().oneOf([Yup.ref("newPassword"), null], "Passwords must match").required("Confirm Password is required."),
      })}
      onSubmit={async (values, { setSubmitting }) => {
        if (!resetEmail) {
          setError("Missing email. Please restart the reset process.");
          return;
        }

        console.log("📩 Sending password reset request:", { email: resetEmail, newPassword: values.newPassword });

        try {
          await axios.post(`${process.env.REACT_APP_BACKEND_URL}/reset-password`, {
            email: resetEmail,
            newPassword: values.newPassword,
          });

          console.log("✅ Password reset successful!");

          // ✅ Show success message and redirect to login
          setSuccessMessage("Password changed successfully! You can now log in.");
          setVisible("login");
        } catch (error) {
          console.error("❌ API Error:", error);
          setError(error.response?.data?.message || "Error resetting password");
        }

        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <h2>Set New Password</h2>
          <Field type="password" name="newPassword" placeholder="New password" />
          <ErrorMessage name="newPassword" component="div" className="error_text" />

          <Field type="password" name="confirmPassword" placeholder="Confirm password" />
          <ErrorMessage name="confirmPassword" component="div" className="error_text" />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Change Password"}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ChangePasswordForm;


