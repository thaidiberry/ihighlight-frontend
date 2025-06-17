// frontend/src/components/createPostPopup/AddToYourPost.js
import { Photo } from "../../svg";

export default function AddToYourPost({
  setShowPrev,   // open image-upload preview
  setShowBgs,    // toggle backgrounds list
  showBgs,
  setPicker,     // toggle emoji picker
  picker,
}) {
  return (
    <div className="addto_container" style={{ display: "flex", gap: "12px" }}>
      {/* pick background */}
      <img
        src="../../../icons/colorful.png"
        alt="Choose background"
        className="hover1 icon_button"
        onClick={() => setShowBgs(!showBgs)}
        style={{ cursor: "pointer" }}
      />

      {/* upload photo */}
      <div
        className="hover1 icon_button"
        onClick={() => setShowPrev(true)}
        style={{ cursor: "pointer" }}
      >
        <Photo color="#45bd62" />
      </div>

      {/* emoji picker */}
      <i
        className="emoji_icon_large hover1 icon_button"
        onClick={() => setPicker(!picker)}
        style={{ cursor: "pointer" }}
      ></i>
    </div>
  );
}
