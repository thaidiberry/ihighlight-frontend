// App.js
import React, { useState, useEffect, useReducer, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";

import Header from "./components/header";
import AuthModal from "./components/modals/AuthModal";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Home from "./pages/home";
import LoggedInRoutes from "./routes/LoggedInRoutes";
import NotLoggedInRoutes from "./routes/NotLoggedInRoutes";
import Activate from "./pages/home/activate";
import Reset from "./pages/reset";
import CreatePostPopup from "./components/createPostPopup";
import Friends from "./pages/friends";
import { postsReducer } from "./functions/reducers";
import normalizeUser from "./helpers/normalizeUser";

function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [visible, setVisible] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  const { user: reduxUser, darkTheme } = useSelector((state) => ({ ...state }));
  const user = reduxUser || localUser;

  const [{ loading, posts }, dispatch] = useReducer(postsReducer, {
    loading: false,
    posts: [],
    error: "",
  });

  useEffect(() => {
    const raw = Cookies.get("user");
    if (raw) {
      try {
        const parsed = normalizeUser(JSON.parse(raw));
        setLocalUser(parsed);
      } catch (err) {
        console.error("❌ Cookie parse error:", err);
      }
    }
  }, []);

  const getAllPosts = useCallback(async () => {
    if (!user?.token) return;
    try {
      dispatch({ type: "POSTS_REQUEST" });
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/getAllPosts`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      dispatch({ type: "POSTS_SUCCESS", payload: data });
    } catch (error) {
      dispatch({
        type: "POSTS_ERROR",
        payload: error.response?.data?.message || "Error fetching posts",
      });
    }
  }, [user]);

  const getPublicPosts = useCallback(async () => {
    try {
      dispatch({ type: "POSTS_REQUEST" });
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/getPublicPosts`
      );
      dispatch({ type: "POSTS_SUCCESS", payload: data });
    } catch (error) {
      dispatch({
        type: "POSTS_ERROR",
        payload: error.response?.data?.message || "Error fetching public posts",
      });
    }
  }, []);

  useEffect(() => {
    if (user?.token) {
      getAllPosts();
    } else {
      getPublicPosts();
    }
  }, [user?.token, getAllPosts, getPublicPosts]);

  const openAuthModal = (tab = "login") => {
    console.log(`openAuthModal called with tab: ${tab}`);
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <div className={darkTheme ? "dark" : ""}>
      <Header
        page="home"
        user={user}
        getAllPosts={getAllPosts}
        openAuthModal={openAuthModal}
      />

      {authModalOpen && (
        <AuthModal onClose={closeAuthModal} activeTab={authTab} />
      )}

      <Routes>
        <Route element={<LoggedInRoutes user={user} />}>
          <Route
            path="/profile"
            element={<Profile setVisible={setVisible} getAllPosts={getAllPosts} />}
          />
          <Route
            path="/profile/:username"
            element={
              <Profile
                key={window.location.pathname}
                setVisible={setVisible}
                getAllPosts={getAllPosts}
              />
            }
          />
          <Route
            path="/friends"
            element={<Friends setVisible={setVisible} getAllPosts={getAllPosts} />}
          />
          <Route
            path="/friends/:type"
            element={<Friends setVisible={setVisible} getAllPosts={getAllPosts} />}
          />
          <Route
            path="/"
            element={
              <Home
                setVisible={setVisible}
                posts={posts}
                loading={loading}
                getAllPosts={user?.token ? getAllPosts : getPublicPosts} // ✅ conditional logic
                openAuthModal={openAuthModal}
              />
            }
          />
          <Route path="/activate/:token" element={<Activate />} />
          <Route
            path="*"
            element={
              <Home
                setVisible={setVisible}
                posts={posts}
                loading={loading}
                getAllPosts={user?.token ? getAllPosts : getPublicPosts} // ✅ fallback
                openAuthModal={openAuthModal}
              />
            }
          />
        </Route>

        <Route element={<NotLoggedInRoutes user={user} />}>
          <Route path="/login" element={<Login openAuthModal={openAuthModal} />} />
        </Route>

        <Route path="/reset" element={<Reset />} />
      </Routes>

      {visible && (
        <CreatePostPopup
          user={user}
          setVisible={setVisible}
          posts={posts}
          dispatch={dispatch}
        />
      )}
    </div>
  );
}

export default App;


