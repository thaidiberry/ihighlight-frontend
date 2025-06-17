export default function normalizeUser(user) {
  return {
    _id: user._id,
    email: user.email,
    username: user.username || user.email?.split("@")[0],
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    picture:
      user.picture && user.picture.trim() !== ""
        ? user.picture
        : `${process.env.PUBLIC_URL}/images/default_profile.png`,
    token: user.token,
  };
}

  
  