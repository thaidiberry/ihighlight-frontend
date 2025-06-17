import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import useClickOutside from "../../helpers/clickOutside";
import getCroppedImg from "../../helpers/getCroppedImg";
import { uploadImages } from "../../functions/uploadImages";
import { useSelector } from "react-redux";
import { updateCover } from "../../functions/user";
import { createPost } from "../../functions/post";
import PulseLoader from "react-spinners/PulseLoader";
import OldCovers from "./OldCovers";

export default function Cover({ cover, visitor, photos }) {
  /* ------------------------------------------------------------------ */
  /* basic state                                                        */
  /* ------------------------------------------------------------------ */
  const fallbackCover = "/images/default_cover_photo.png";
  const [coverUrl, setCoverUrl] = useState(cover || fallbackCover); // ⬅️ single source
  const [showCoverMneu, setShowCoverMenu] = useState(false);
  const [coverPicture, setCoverPicture] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const { user } = useSelector((state) => ({ ...state }));
  const menuRef = useRef(null);
  const refInput = useRef(null);
  const cRef = useRef(null);
  const coverRef = useRef(null);

  /* ------------------------------------------------------------------ */
  /* click-outside & window size helpers                                */
  /* ------------------------------------------------------------------ */
  useClickOutside(menuRef, () => setShowCoverMenu(false));
  const [width, setWidth] = useState();
  useEffect(() => {
    setWidth(coverRef.current.clientWidth);
  }, [window.innerWidth]);

  /* keep local URL in sync when `cover` prop changes */
  useEffect(() => {
    setCoverUrl(cover || fallbackCover);
  }, [cover]);

  /* ------------------------------------------------------------------ */
  /* file-selection, cropping, upload                                   */
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
      setShowCoverMenu(false);
      return;
    } else if (file.size > 1024 * 1024 * 5) {
      setError(`${file.name} is too large. Max 5 MB allowed.`);
      setShowCoverMenu(false);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      setCoverPicture(event.target.result);
    };
  };

  /* cropper state */
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const getCroppedImage = useCallback(
    async (show) => {
      try {
        const img = await getCroppedImg(coverPicture, croppedAreaPixels);
        if (show) {
          setZoom(1);
          setCrop({ x: 0, y: 0 });
          setCoverPicture(img);
        } else {
          return img;
        }
      } catch (err) {
        console.log(err);
      }
    },
    [croppedAreaPixels, coverPicture]
  );

  /* ------------------------------------------------------------------ */
  /* save new cover                                                     */
  /* ------------------------------------------------------------------ */
  const updateCoverPicture = async () => {
    try {
      setLoading(true);
      const img = await getCroppedImage();
      const blob = await fetch(img).then((b) => b.blob());

      const path = `${user.username}/cover_pictures`;
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("path", path);

      const res = await uploadImages(formData, path, user.token);
      const updated = await updateCover(res[0].url, user.token);

      if (updated === "ok") {
        const newPost = await createPost(
          "coverPicture",
          null,
          null,
          res,
          user.id,
          user.token
        );
        if (newPost.status === "ok") {
          setLoading(false);
          setCoverPicture("");
          setCoverUrl(`${res[0].url}?t=${Date.now()}`); // ⬅️ updates display
        } else {
          setLoading(false);
          setError(newPost);
        }
      } else {
        setLoading(false);
        setError(updated);
      }
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while updating cover photo."
      );
    }
  };

  /* ------------------------------------------------------------------ */
  /* render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="profile_cover" ref={coverRef}>
      {/*--------------------------------------------------*
       * 1. save-changes strip                            *
       *--------------------------------------------------*/}
      {coverPicture && (
        <div className="save_changes_cover">
          <div className="save_changes_left">
            <i className="public_icon" />
            Your cover photo is public
          </div>
          <div className="save_changes_right">
            <button
              className="blue_btn opacity_btn"
              onClick={() => setCoverPicture("")}
            >
              Cancel
            </button>
            <button className="blue_btn" onClick={updateCoverPicture}>
              {loading ? <PulseLoader color="#fff" size={5} /> : "Save changes"}
            </button>
          </div>
        </div>
      )}

      {/* hidden file input */}
      <input
        type="file"
        ref={refInput}
        hidden
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleImage}
      />

      {/* error banner */}
      {error && (
        <div className="postError comment_error cover_error">
          <div className="postError_error">{error}</div>
          <button className="blue_btn" onClick={() => setError("")}>
            Try again
          </button>
        </div>
      )}

      {/* cropper overlay */}
      {coverPicture && (
        <div className="cover_crooper">
          <Cropper
            image={coverPicture}
            crop={crop}
            zoom={zoom}
            aspect={width / 350}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid
            objectFit="horizontal-cover"
          />
        </div>
      )}

      {/* actual cover image (or fallback) */}
      {!coverPicture && (
        <img
          className="cover"
          src={coverUrl}
          alt="cover"
          loading="lazy"
          onError={() => setCoverUrl(fallbackCover)}
        />
      )}

      {/*--------------------------------------------------*
       * owner-only controls                              *
       *--------------------------------------------------*/}
      {!visitor && (
        <div className="udpate_cover_wrapper">
          <div
            className="open_cover_update"
            onClick={() => setShowCoverMenu((prev) => !prev)}
          >
            <i className="camera_filled_icon" />
            Add Cover Photo
          </div>

          {showCoverMneu && (
            <div className="open_cover_menu" ref={menuRef}>
              <div
                className="open_cover_menu_item hover1"
                onClick={() => setShow(true)}
              >
                <i className="photo_icon" />
                Select Photo
              </div>
              <div
                className="open_cover_menu_item hover1"
                onClick={() => refInput.current.click()}
              >
                <i className="upload_icon" />
                Upload Photo
              </div>
            </div>
          )}
        </div>
      )}

      {/* old-covers picker */}
      {show && (
        <OldCovers
          photos={photos}
          setCoverPicture={setCoverPicture}
          setShow={setShow}
        />
      )}
    </div>
  );
}
