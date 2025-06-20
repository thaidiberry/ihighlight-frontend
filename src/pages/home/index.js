// frontend/src/pages/home/index.js
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { HashLoader } from "react-spinners";
import CreatePost from "../../components/createPost";
import Header from "../../components/header";
import LeftHome from "../../components/home/left";
import RightHome from "../../components/home/right";
import SendVerification from "../../components/home/sendVerification";
import Post from "../../components/post";
import "./style.css";
import axios from "axios";

// ✅ Adjust this if you store the backend URL elsewhere
const BASE_URL = "https://ihighlight-backend.onrender.com";

export default function Home({ setVisible, posts, loading, getAllPosts, openAuthModal }) {
  const { user } = useSelector((state) => ({ ...state }));
  const middle = useRef(null);
  const [height, setHeight] = useState(0);

  // Set container height
  useEffect(() => {
    if (middle.current) {
      setHeight(middle.current.clientHeight);
    }
  }, []);

  // ✅ Wake backend, then delay post load by 2s
  useEffect(() => {
    if (typeof getAllPosts === "function") {
      // Ping backend to wake it up (non-blocking)
      axios.get(`${BASE_URL}/ping`).catch(() => {});
      // Delay real fetch to give backend time to spin up
      const timeout = setTimeout(() => {
        getAllPosts();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [getAllPosts]);

  // Debug: log posts to console
  useEffect(() => {
    console.log("Loaded posts:", posts);
  }, [posts]);

  return (
    <div className="home" style={{ height: `${height + 150}px` }}>
      {user && <LeftHome user={user} />}
      <div className="home_middle" ref={middle}>
        {user?.verified === false && <SendVerification user={user} />}
        {user && <CreatePost user={user} setVisible={setVisible} />}
        {loading ? (
          <div className="sekelton_loader">
            <HashLoader color="#1876f2" />
          </div>
        ) : (
          <div className="posts">
            {posts && posts.length > 0 ? (
              posts.map((post, i) => (
                <Post
                  key={i}
                  post={post}
                  user={user}
                  showComments={true}
                  openAuthModal={openAuthModal}
                />
              ))
            ) : (
              <div className="no_posts">Sorry there are no posts available today.</div>
            )}
          </div>
        )}
      </div>
      {user && <RightHome user={user} />}
    </div>
  );
}
