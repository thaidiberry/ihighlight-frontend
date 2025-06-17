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

export default function Home({ setVisible, posts, loading, getAllPosts, openAuthModal }) {
  const { user } = useSelector((state) => ({ ...state }));
  const middle = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (middle.current) {
      setHeight(middle.current.clientHeight);
    }
  }, []);

  useEffect(() => {
    if (typeof getAllPosts === "function") {
      getAllPosts(); // ✅ This will call either getAllPosts or getPublicPosts depending on App.js
    }
  }, [getAllPosts]);

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
