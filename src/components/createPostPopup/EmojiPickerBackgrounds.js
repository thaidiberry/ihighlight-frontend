import { useEffect, useRef, useState } from "react";
import Picker from "emoji-picker-react";
import { useMediaQuery } from "react-responsive";
import AddToYourPost from "./AddToYourPost";   // <–  the ONE place we show the 3 icons

export default function EmojiPickerBackgrounds({
  text,
  user,
  setText,
  type2,
  background,
  setBackground,
  setShowPrev,        // ← already supplied from CreatePostPopup
}) {
  /* ──────────────────── local state ──────────────────── */
  const [picker,   setPicker]   = useState(false);
  const [showBgs,  setShowBgs]  = useState(false);
  const [cursorPosition, setCursorPosition] = useState(null);

  const textRef = useRef(null);
  const bgRef   = useRef(null);

  /* keep caret position when inserting emoji */
  useEffect(() => {
    if (cursorPosition !== null) textRef.current.selectionEnd = cursorPosition;
  }, [cursorPosition]);

  /* ---------- emoji handler ---------- */
  const handleEmoji = (_e, { emoji }) => {
    const ref   = textRef.current;
    const start = text.slice(0, ref.selectionStart);
    const end   = text.slice(ref.selectionStart);
    setText(start + emoji + end);
    setCursorPosition(start.length + emoji.length);
    ref.focus();
  };

  /* ---------- background picker ---------- */
  const postBackgrounds = Array.from({ length: 9 }, (_, i) =>
    `../../../images/postbackgrounds/${i + 1}.jpg`
  );

  const backgroundHandler = (i) => {
    bgRef.current.style.backgroundImage = `url(${postBackgrounds[i]})`;
    setBackground(postBackgrounds[i]);
    bgRef.current.classList.add("bgHandler");
  };

  const removeBackground = () => {
    bgRef.current.style.backgroundImage = "";
    setBackground("");
    bgRef.current.classList.remove("bgHandler");
  };

  /* ---------- responsive tweak ---------- */
  const sm = useMediaQuery({ query: "(max-width:550px)" });

  /* ======================= render ====================== */
  return (
    <div className={type2 ? "images_input" : ""}>
      {/* TEXT AREA & optional background */}
      <div className={!type2 ? "flex_center" : ""} ref={bgRef}>
        <textarea
          ref={textRef}
          maxLength="250"
          value={text}
          placeholder={`What's on your mind, ${user.first_name}?`}
          className={`post_input ${type2 ? "input2" : ""} ${
            sm && !background ? "l0" : ""
          }`}
          onChange={(e) => setText(e.target.value)}
          style={{
            paddingTop: background
              ? Math.abs(textRef.current?.value.length * 0.1 - 32) + "%"
              : "0",
          }}
        />
      </div>

      {/* ONE — and only one — icon row */}
      {!type2 && (
        <AddToYourPost
          /* photo modal    */ setShowPrev={setShowPrev}
          /* bg picker      */ setShowBgs={setShowBgs}
          showBgs={showBgs}
          /* emoji dropdown */ setPicker={setPicker}
          picker={picker}
        />
      )}

      {/* background thumbnails dropdown */}
      {showBgs && !type2 && (
        <div className="post_backgrounds">
          <div className="no_bg" onClick={removeBackground}></div>
          {postBackgrounds.map((bg, i) => (
            <img
              src={bg}
              alt=""
              key={i}
              onClick={() => backgroundHandler(i)}
            />
          ))}
        </div>
      )}

      {/* emoji-picker popup */}
      {picker && (
        <div className={`comment_emoji_picker ${type2 ? "movepicker2" : "rlmove"}`}>
          <Picker onEmojiClick={handleEmoji} />
        </div>
      )}
    </div>
  );
}
