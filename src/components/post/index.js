// frontend/src/components/post/index.js
import { Link } from "react-router-dom";
import "./style.css";
import Moment from "react-moment";
import { Dots, Public } from "../../svg";
import ReactsPopup from "./ReactsPopup";
import { useEffect, useRef, useState } from "react";
import CreateComment from "./CreateComment";
import PostMenu from "./PostMenu";
import { comment, getReacts, reactPost } from "../../functions/post";
import Comment from "./Comment";
import axios from "axios";

export default function Post({
  post,
  user,
  showComments = false,
  profile,
  openAuthModal,
}) {
  const [visible, setVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [reacts, setReacts] = useState();
  const [check, setCheck] = useState();
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(1);
  const [checkSaved, setCheckSaved] = useState();
  const [comments, setComments] = useState([]);

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const DEFAULT_IMG =
    "https://res.cloudinary.com/dx8ht3lz4/image/upload/v1726091507/default_profile_photo.jpg";

  const postRef = useRef(null);

  useEffect(() => {
    if (window.__sharethis__) {
      window.__sharethis__.initialize();
    }
  }, []);

  useEffect(() => {
    if (post && user) getPostReacts();
  }, [post, user]);

  useEffect(() => {
    setComments(post?.comments || []);
  }, [post]);

  useEffect(() => {
    const fetchLatestProfilePhoto = async () => {
      try {
        const { data } = await axios.get("/getProfilePicturePost", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (data?.images?.length > 0 && data.images[0]?.url) {
          setProfilePhotoUrl(data.images[0].url);
        } else {
          setProfilePhotoUrl(null);
        }
      } catch {
        setProfilePhotoUrl(null);
      }
    };

    if (user?.token) {
      fetchLatestProfilePhoto();
    }
  }, [user?.token]);

  const getPostReacts = async () => {
    if (!user) return;
    const res = await getReacts(post._id, user.token);
    setReacts(res.reacts);
    setCheck(res.check);
    setTotal(res.total);
    setCheckSaved(res.checkSaved);
  };

  const reactHandler = async (type) => {
    if (!user) return;
    reactPost(post._id, type, user.token);
    if (check === type) {
      setCheck();
      let index = reacts.findIndex((x) => x.react === check);
      if (index !== -1) {
        setReacts([...reacts, (reacts[index].count = --reacts[index].count)]);
        setTotal((prev) => --prev);
      }
    } else {
      setCheck(type);
      let index = reacts.findIndex((x) => x.react === type);
      let index1 = reacts.findIndex((x) => x.react === check);
      if (index !== -1) {
        setReacts([...reacts, (reacts[index].count = ++reacts[index].count)]);
        setTotal((prev) => ++prev);
      }
      if (index1 !== -1) {
        setReacts([...reacts, (reacts[index1].count = --reacts[index1].count)]);
        setTotal((prev) => --prev);
      }
    }
  };

  const showMore = () => {
    setCount((prev) => prev + 3);
  };

  if (!post || !post.user) return null;

  const imageToShow =
    profilePhotoUrl ||
    (post.user.picture && post.user.picture !== "null" && post.user.picture !== "")
      ? profilePhotoUrl || post.user.picture
      : DEFAULT_IMG;

  return (
    <div className="post" style={{ width: `${profile && "100%"}` }} ref={postRef}>
      <div className="post_header">
        <Link
          to={user ? `/profile/${post.user.username}` : `/`}
          className="post_header_left"
        >
          <img
            src={imageToShow}
            alt=""
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_IMG;
            }}
          />
          <div className="header_col">
            <div className="post_profile_name">
              {post.user.first_name} {post.user.last_name}
              <div className="updated_p">
                {post.type === "profilePicture" &&
                  `updated ${post.user.gender === "male" ? "his" : "her"} profile picture`}
                {post.type === "coverPicture" &&
                  `updated ${post.user.gender === "male" ? "his" : "her"} cover picture`}
              </div>
            </div>
            <div className="post_profile_privacy_date">
              <Moment fromNow interval={30}>{post.createdAt}</Moment>. <Public color="#828387" />
            </div>
          </div>
        </Link>
        {user && (
          <div
            className="post_header_right hover1"
            onClick={() => setShowMenu((prev) => !prev)}
          >
          </div>
        )}
      </div>

      {post.background ? (
        <div className="post_bg" style={{ backgroundImage: `url(${post.background})` }}>
          <div className="post_bg_text">{post.text}</div>
        </div>
      ) : post.type === null ? (
        <>
          <div className="post_text">{post.text}</div>
          {post.images && post.images.length > 0 && (
            <div
              className={
                post.images.length === 1
                  ? "grid_1"
                  : post.images.length === 2
                  ? "grid_2"
                  : post.images.length === 3
                  ? "grid_3"
                  : post.images.length === 4
                  ? "grid_4"
                  : post.images.length >= 5 && "grid_5"
              }
            >
              {post.images.slice(0, 5).map((image, i) => (
                <img src={image.url} key={i} alt="" className={`img-${i}`} />
              ))}
              {post.images.length > 5 && (
                <div className="more-pics-shadow">+{post.images.length - 5}</div>
              )}
            </div>
          )}
        </>
      ) : post.type === "profilePicture" ? (
        <div className="post_profile_wrap">
          <div className="post_updated_bg">
            <img src={post.user.cover} alt="" />
          </div>
          <img src={post.images[0].url} alt="" className="post_updated_picture" />
        </div>
      ) : (
        <div className="post_cover_wrap">
          <img src={post.images[0].url} alt="" />
        </div>
      )}

      <div className="post_infos">
        <div className="reacts_count">
          <div className="reacts_count_imgs">
            {reacts &&
              reacts
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map(
                  (react, i) =>
                    react.count > 0 && (
                      <img
                        src={`../../../reacts/${react.react}.svg`}
                        alt=""
                        key={i}
                      />
                    )
                )}
          </div>
          <div className="reacts_count_num">{total > 0 && total}</div>
        </div>
        {user && (
          <div className="to_right">
            <div className="comments_count">{comments.length} comments</div>
          </div>
        )}
      </div>

      <div className="post_actions_row">
        {!user ? (
          <>
            <div className="post_action hover1" onClick={() => openAuthModal?.("login")}>
              <i className="like_icon"></i>
              <span>Like</span>
            </div>
            <div className="post_action hover1" onClick={() => openAuthModal?.("login")}>
              <i className="comment_icon"></i>
              <span>Comment</span>
            </div>
            <div className="post_action sharethis_action">
              <div className="sharethis-inline-share-buttons"></div>
            </div>
          </>
        ) : (
          <>
            <ReactsPopup visible={visible} setVisible={setVisible} reactHandler={reactHandler} />
            <div
              className="post_action hover1"
              onMouseOver={() => {
                setTimeout(() => setVisible(true), 500);
              }}
              onMouseLeave={() => {
                setTimeout(() => setVisible(false), 500);
              }}
              onClick={() => reactHandler(check || "like")}
            >
              {check ? (
                <img
                  src={`../../../reacts/${check}.svg`}
                  alt=""
                  className="small_react"
                  style={{ width: "18px" }}
                />
              ) : (
                <i className="like_icon"></i>
              )}
              <span
                style={{
                  color:
                    check === "like"
                      ? "#4267b2"
                      : check === "love"
                      ? "#f63459"
                      : ["haha", "sad", "wow"].includes(check)
                      ? "#f7b125"
                      : check === "angry"
                      ? "#e4605a"
                      : "",
                }}
              >
                {check || "Like"}
              </span>
            </div>
            <div className="post_action sharethis_action">
              <div className="sharethis-inline-share-buttons"></div>
            </div>
          </>
        )}
      </div>

      {user && (
        <div className="comments_wrap">
          <CreateComment
            user={user}
            postId={post._id}
            setComments={setComments}
            setCount={setCount}
          />
          {comments.slice(0, count).map((comment, i) => (
            <Comment comment={comment} key={i} />
          ))}
          {count < comments.length && (
            <div className="view_comments" onClick={showMore}>
              View more comments
            </div>
          )}
        </div>
      )}
      {!user && showComments && post.comments?.length > 0 && (
        <div className="post_comments">
          {post.comments.slice(0, 2).map((comment, index) => (
            <div className="comment" key={index}>
              <img
                src={comment.commentBy?.picture || DEFAULT_IMG}
                alt="avatar"
                className="comment_img"
              />
              <div className="comment_col">
                <div className="comment_wrap">
                  <div className="comment_text">
                    <strong>
                      {comment.commentBy?.first_name} {comment.commentBy?.last_name}
                    </strong>{" "}
                    {comment.comment}
                  </div>
                </div>
                <div className="comment_actions">
                  <Moment fromNow interval={30}>{comment.commentAt}</Moment>
                </div>
              </div>
            </div>
          ))}
          {post.comments.length > 2 && (
            <div className="view_comments_note">
              Log in to view all {post.comments.length} comments
            </div>
          )}
        </div>
      )}
    </div>
  );
}
