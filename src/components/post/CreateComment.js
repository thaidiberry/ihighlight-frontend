// frontend/src/components/post/CreateComment.js
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Picker from "emoji-picker-react";
import { comment } from "../../functions/post";
import { uploadImages } from "../../functions/uploadImages";
import dataURItoBlob from "../../helpers/dataURItoBlob";
import { ClipLoader } from "react-spinners";

export default function CreateComment({ user, postId, setComments, setCount }) {
  /* ------------------------------------------------------------------ */
  /* Local state                                                         */
  /* ------------------------------------------------------------------ */
  const DEFAULT_IMG =
    "https://res.cloudinary.com/dx8ht3lz4/image/upload/v1726091507/default_profile_photo.jpg";

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

  const [picker, setPicker] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [commentImage, setCommentImage] = useState("");
  const [cursorPosition, setCursorPosition] = useState();
  const [loading, setLoading] = useState(false);

  const textRef = useRef(null);
  const imgInput = useRef(null);

  /* ------------------------------------------------------------------ */
  /* Fetch latest uploaded profile photo                                 */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const fetchLatestProfilePhoto = async () => {
      try {
        const { data } = await axios.get("/getProfilePicturePost", {
          headers: { Authorization: `Bearer ${user.token}` },
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

    fetchLatestProfilePhoto();
  }, [user.token]);

  /* ------------------------------------------------------------------ */
  /* Existing caret-position logic                                       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    textRef.current.selectionEnd = cursorPosition;
  }, [cursorPosition]);

  const handleEmoji = (e, { emoji }) => {
    const ref = textRef.current;
    ref.focus();
    const start = text.substring(0, ref.selectionStart);
    const end = text.substring(ref.selectionStart);
    const newText = start + emoji + end;
    setText(newText);
    setCursorPosition(start.length + emoji.length);
  };

  /* ------------------------------------------------------------------ */
  /* Image handlers                                                      */
  /* ------------------------------------------------------------------ */
  const handleImage = (e) => {
    let file = e.target.files[0];
    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/webp" &&
      file.type !== "image/gif"
    ) {
      setError(`${file.name} format is not supported.`);
      return;
    } else if (file.size > 1024 * 1024 * 5) {
      setError(`${file.name} is too large; max 5 MB allowed.`);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      setCommentImage(event.target.result);
    };
  };

  const handleComment = async (e) => {
    if (e.key === "Enter") {
      setLoading(true);

      let imgUrl = "";
      if (commentImage) {
        const imgBlob = dataURItoBlob(commentImage);
        const path = `${user.username}/post_images/${postId}`;
        const formData = new FormData();
        formData.append("path", path);
        formData.append("file", imgBlob);
        const uploaded = await uploadImages(formData, path, user.token);
        imgUrl = uploaded[0].url;
      }

      const updatedComments = await comment(postId, text, imgUrl, user.token);
      setComments(updatedComments);
      setCount((prev) => ++prev);
      setLoading(false);
      setText("");
      setCommentImage("");
    }
  };

  /* ------------------------------------------------------------------ */
  /* Decide which avatar to show                                         */
  /* ------------------------------------------------------------------ */
  const imageToShow =
    profilePhotoUrl ||
    (user?.picture && user.picture !== "null" && user.picture !== "")
      ? profilePhotoUrl || user.picture
      : DEFAULT_IMG;

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <div className="create_comment_wrap">
      <div className="create_comment">
        <img
          key={imageToShow}
          src={imageToShow}
          alt="avatar"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_IMG;
          }}
        />

        <div className="comment_input_wrap">
          {picker && (
            <div className="comment_emoji_picker">
              <Picker onEmojiClick={handleEmoji} />
            </div>
          )}

          <input
            type="file"
            hidden
            ref={imgInput}
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImage}
          />

          {error && (
            <div className="postError comment_error">
              <div className="postError_error">{error}</div>
              <button className="black_btn" onClick={() => setError("")}>
                Try again
              </button>
            </div>
          )}

          <input
            type="text"
            ref={textRef}
            value={text}
            placeholder="Write a comment..."
            onChange={(e) => setText(e.target.value)}
            onKeyUp={handleComment}
          />

          <div className="comment_circle" style={{ marginTop: "5px" }}>
            <ClipLoader size={20} color="#1876f2" loading={loading} />
          </div>

          <div
            className="comment_circle_icon hover2"
            onClick={() => setPicker((prev) => !prev)}
          >
            <i className="emoji_icon"></i>
          </div>
          <div
            className="comment_circle_icon hover2"
            onClick={() => imgInput.current.click()}
          >
            <i className="camera_icon"></i>
          </div>
        </div>
      </div>

      {commentImage && (
        <div className="comment_img_preview">
          <img src={commentImage} alt="" />
          <div
            className="small_white_circle"
            onClick={() => setCommentImage("")}
          >
            <i className="exit_icon"></i>
          </div>
        </div>
      )}
    </div>
  );
}
