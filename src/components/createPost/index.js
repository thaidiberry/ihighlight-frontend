// import { Feeling, LiveVideo, Photo } from "../../svg";
// import UserMenu from "../header/userMenu";
import { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";

export default function CreatePost({ user, setVisible, profile }) {
  /* ------------------------------------------------------------------ */
  /* Constants & local state                                            */
  /* ------------------------------------------------------------------ */
  const DEFAULT_IMG =
    "https://res.cloudinary.com/dx8ht3lz4/image/upload/v1726091507/default_profile_photo.jpg";

  // Holds the URL of the most recent uploaded profile picture, if any
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

  /* ------------------------------------------------------------------ */
  /* Fetch latest uploaded profile photo (if it exists)                 */
  /* ------------------------------------------------------------------ */
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
      } catch (_) {
        setProfilePhotoUrl(null); // fallback if request fails
      }
    };

    fetchLatestProfilePhoto();
  }, [user.token]);

  /* ------------------------------------------------------------------ */
  /* Determine which image to render                                    */
  /* Priority: Uploaded photo → user.picture → default image            */
  /* ------------------------------------------------------------------ */
  const imageToShow =
    profilePhotoUrl ||
    (user?.picture && user.picture !== "null" && user.picture !== "")
      ? profilePhotoUrl || user.picture
      : DEFAULT_IMG;

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="createPost">
      <div className="createPost_header">
        <img
          key={imageToShow}          /* forces React to re-render if URL changes */
          src={imageToShow}
          alt="avatar"
          className="profile-img"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_IMG; /* final safety fallback */
          }}
        />

        <div
          className="open_post hover2"
          onClick={() => {
            setVisible(true);
          }}
        >
          {`What's on your mind, ${user?.first_name}?`}
        </div>
      </div>

      <div className="create_splitter"></div>
      <div className="createPost_body"></div>
    </div>
  );
}

