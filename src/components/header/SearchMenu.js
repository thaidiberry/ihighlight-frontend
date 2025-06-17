import { useEffect, useRef, useState } from "react";
import { Return, Search } from "../../svg";
import useClickOutside from "../../helpers/clickOutside";
import {
  addToSearchHistory,
  getSearchHistory,
  removeFromSearch,
  search,
} from "../../functions/user";
import { Link } from "react-router-dom";

export default function SearchMenu({ color, setShowSearchMenu, token }) {
  const [iconVisible, setIconVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const menu = useRef(null);
  const input = useRef(null);

  useClickOutside(menu, () => {
    setShowSearchMenu(false);
  });

  useEffect(() => {
    getHistory();
  }, []);

  const getHistory = async () => {
    const res = await getSearchHistory(token);
    setSearchHistory(res);
  };

  useEffect(() => {
    input.current.focus();
  }, []);

  const searchHandler = async () => {
    if (searchTerm === "") {
      setResults("");
    } else {
      const res = await search(searchTerm, token);
      setResults(res);
    }
  };

  const addToSearchHistoryHandler = async (searchUserId) => {
    try {
      await addToSearchHistory(searchUserId, token);
      getHistory();
    } catch (err) {
      console.error("Failed to add to search history:", err);
    }
  };

  const handleRemove = async (searchUserId) => {
    try {
      await removeFromSearch(searchUserId, token);
      getHistory();
    } catch (err) {
      console.error("Failed to remove from search history:", err);
    }
  };

  return (
    <div className="header_left search_area scrollbar" ref={menu}>
      <div className="search_wrap">
        <div className="header_logo">
          <div className="circle hover1" onClick={() => setShowSearchMenu(false)}>
            <Return color={color} />
          </div>
        </div>
        <div className="search" onClick={() => input.current.focus()}>
          {iconVisible && (
            <div>
              <Search color={color} />
            </div>
          )}
          <input
            type="text"
            placeholder="Search iHighlight"
            ref={input}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={searchHandler}
            onFocus={() => setIconVisible(false)}
            onBlur={() => setIconVisible(true)}
          />
        </div>
      </div>

      {results === "" && (
        <div className="search_history_header">
          <span>Recent searches</span>
          <a>Edit</a>
        </div>
      )}

      <div className="search_history scrollbar">
        {searchHistory &&
          results === "" &&
          searchHistory
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((user) => (
              <div className="search_user_item hover1" key={user._id}>
                <Link
                  className="flex"
                  to={`/profile/${user.user.username}`}
                  onClick={() => {
                    setTimeout(() => {
                      setShowSearchMenu(false);
                      addToSearchHistoryHandler(user.user._id);
                    }, 50);
                  }}
                >
                  <img src={user.user.picture} alt="" />
                  <span>
                    {user.user.first_name} {user.user.last_name}
                  </span>
                </Link>
                <i
                  className="exit_icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(user.user._id);
                  }}
                ></i>
              </div>
            ))}
      </div>

      <div className="search_results scrollbar">
        {results &&
          results.map((user) => (
            <Link
              to={`/profile/${user.username}`}
              className="search_user_item hover1"
              key={user._id}
              onClick={() => {
                setTimeout(() => {
                  setShowSearchMenu(false);
                  addToSearchHistoryHandler(user._id);
                }, 50);
              }}
            >
              <img src={user.picture} alt="" />
              <span>
                {user.first_name} {user.last_name}
              </span>
            </Link>
          ))}
      </div>
    </div>
  );
}



