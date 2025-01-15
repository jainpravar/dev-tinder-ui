import axios from "axios";
import React from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeFeed } from "../store/feedSlice";
import { useLocation, useParams } from "react-router-dom";

const UserCard = ({ user }) => {
  const location = useLocation();
  const pathName = location.pathname;
  const dispatch = useDispatch();
  const { _id } = user;
  const handleRequest = async (status, id) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/request/${status}/${id}`,
        {},
        { withCredentials: true }
      );
      if (res.status === 200) {
        dispatch(removeFeed(id));
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className=" flex justify-center my-5">
      <div className="card bg-base-300 w-96 shadow-xl">
        <figure className="px-10 pt-20">
          <img src={user.photoUrl} alt="user-photo" className="rounded-xl" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{`${user.firstName} ${user.lastName}`}</h2>
          {user.age && user.gender && (
            <h3>
              {user.gender}, {user.age}
            </h3>
          )}
          <p>{user.about}</p>
          {pathName !== "/profile" && (
            <div className="card-actions  justify-center my-4">
              <button
                className="btn btn-error"
                onClick={() => handleRequest("ignored", _id)}
              >
                Reject
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleRequest("interested", _id)}
              >
                Intrested
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
