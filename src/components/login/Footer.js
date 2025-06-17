import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="login_footer">
      <div className="login_footer_wrap"></div>
      <div className="footer_splitter"></div>
      <div className="login_footer_wrap"></div>
      <div className="login_footer_wrap">
        <Link to="/" style={{ fontSize: "12px", marginTop: "10px" }}>
          iHighlight © 2024
        </Link>
      </div>
    </footer>
  );
}
