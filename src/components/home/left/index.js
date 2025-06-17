// frontend/src/components/home/left/index.js
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import LeftLink from "./LeftLink";
import Shortcut from "./Shortcut";
import "./style.css";
import { left } from "../../../data/home";
import { ArrowDown1 } from "../../../svg";

export default function LeftHome({ user }) {
  /* ------------------------------------------------------------------ */
  /* Local state                                                         */
  /* ------------------------------------------------------------------ */
  const DEFAULT_IMG =
    "https://res.cloudinary.com/dx8ht3lz4/image/upload/v1726091507/default_profile_photo.jpg";

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [visible, setVisible] = useState(false);

  /* ------------------------------------------------------------------ */
  /* Fetch most recent "profilePicture" post                             */
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
  /* Determine image priority                                            */
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
    <div className="left_home scrollbar">
      <Link to="/profile" className="left_link hover2">
        <img
          key={imageToShow}
          src={imageToShow}
          alt="profile"
          className="profile-img"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_IMG;
          }}
        />
        <span>
          {user?.first_name} {user.last_name}
        </span>
      </Link>

      <div className="splitter"></div>

      {/* Optional: render links or shortcuts here */}
      {/* {left.map(link => <LeftLink key={link.text} link={link} />)} */}
      {/* {visible && <Shortcut />} */}
    </div>
  );
}

