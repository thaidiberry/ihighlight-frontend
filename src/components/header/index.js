// frontend/src/components/header/index.js
import "./style.css";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  Friends,
  FriendsActive,
  Home,
  HomeActive,
  Logo,
  Search, // (still imported for future use)
} from "../../svg";
import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import axios from "axios";

import SearchMenu from "./SearchMenu";
import AllMenu from "./AllMenu";
import useClickOutside from "../../helpers/clickOutside";
import UserMenu from "./userMenu";

export default function Header({ page, getAllPosts, openAuthModal = () => {} }) {
  /* ------------------------------------------------------------------ */
  /* Redux user                                                         */
  /* ------------------------------------------------------------------ */
  const { user } = useSelector((state) => ({ ...state }));
  console.log("Header rendered, user:", user);

  /* ------------------------------------------------------------------ */
  /* Profile-photo handling                                             */
  /* ------------------------------------------------------------------ */
  const DEFAULT_IMG =
    "https://res.cloudinary.com/dx8ht3lz4/image/upload/v1726091507/default_profile_photo.jpg";

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

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

    if (user?.token) {
      fetchLatestProfilePhoto();
    }
  }, [user?.token]);

  const imageToShow =
    profilePhotoUrl ||
    (user?.picture && user.picture !== "null" && user.picture !== "")
      ? profilePhotoUrl || user.picture
      : DEFAULT_IMG;

  /* ------------------------------------------------------------------ */
  /* Other header state & refs                                          */
  /* ------------------------------------------------------------------ */
  const color = "#65676b";
  const [showSearchMenu, setShowSearchMenu] = useState(false);
  const [showAllMenu, setShowAllMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const allmenu = useRef(null);
  const usermenu = useRef(null);

  useClickOutside(allmenu, () => setShowAllMenu(false));
  useClickOutside(usermenu, () => setShowUserMenu(false));

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <header>
      <div className="header_left">
        <Link to="/" className="header_logo">
          <div className="circle">
            <Logo />
          </div>
        </Link>
      </div>

      {user && (
        <div className="header_middle">
          <Link
            to="/"
            className={`middle_icon ${page === "home" ? "active" : "hover1"}`}
            onClick={getAllPosts}
          >
            {page === "home" ? <HomeActive /> : <Home color={color} />}
          </Link>
          <Link
            to="/friends"
            className={`middle_icon ${
              page === "friends" ? "active" : "hover1"
            }`}
          >
            {page === "friends" ? (
              <FriendsActive />
            ) : (
              <Friends color={color} />
            )}
          </Link>
        </div>
      )}

      <div className="header_right">
        {user ? (
          <>
            <Link
              to="/profile"
              className={`profile_link hover1 ${
                page === "profile" ? "active_link" : ""
              }`}
            >
              <img
                key={imageToShow} /* forces re-render on URL change */
                src={imageToShow}
                alt="profile"
                className="profile-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_IMG;
                }}
              />
              <span>{user?.first_name}</span>
            </Link>

            <div
              className={`circle_icon hover1 ${
                showUserMenu && "active_header"
              }`}
              ref={usermenu}
            >
              <div onClick={() => setShowUserMenu((prev) => !prev)}>
                <div style={{ transform: "translateY(2px)" }}>
                  <ArrowDown />
                </div>
              </div>
              {showUserMenu && <UserMenu user={user} />}
            </div>
          </>
        ) : (
          /* Logged-out users: show Login button that opens AuthModal */
          <div
            className="login_rect_button hover1"
            onClick={() => openAuthModal("login")}
          >
            <span>Login</span>
          </div>
        )}
      </div>
    </header>
  );
}
