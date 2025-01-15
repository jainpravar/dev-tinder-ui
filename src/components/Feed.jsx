import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addFeed } from "../store/feedSlice";
import UserCard from "./UserCard";

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((state) => state.feed);
  const getUserFeed = async () => {
    try {
      if (feed) return;
      const res = await axios.get(BASE_URL + "/user/feed", {
        withCredentials: true,
      });
      const feeds = res.data.data;
      if (feeds) {
        dispatch(addFeed(feeds));
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getUserFeed();
  }, []);

  if (!feed) return;
  if (feed.length < 1) {
    return <h1 className="flex justify-center my-10">No new feed found!</h1>;
  }
  return (
    feed && (
      <div className="flex justify-center ">
        <UserCard user={feed[0]} />
      </div>
    )
  );
};

export default Feed;
