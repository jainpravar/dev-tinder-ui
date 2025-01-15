import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../store/requestsSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((state) => state.requests);
  const getRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/request/recived", {
        withCredentials: true,
      });
      if (res.status === 200) {
        dispatch(addRequests(res.data.data));
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getRequests();
  }, []);

  const reviewRequest = async (status, id) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/review/${status}/${id}`,
        {},
        { withCredentials: true }
      );
      if (res.status === 200) {
        dispatch(removeRequest(id));
      }
    } catch (error) {
        console.log(error)
    }
  };
  if (!requests) return;
  if (requests.length < 1) return  <h1 className="text-center text-bold text-2xl">No Request found!!</h1>
  return (
    <div className="text-center my-10">
      <h1 className="text-bold text-3xl">Requests</h1>

      {requests.map((request) => {
        const { _id, firstName, lastName, photoUrl, age, gender, about } =
          request.fromUserId;

        return (
          <div
            key={_id}
            className="flex m-4 p-4 rounded-lg bg-base-300 w-1/2 mx-auto"
          >
            <div>
              <img
                alt="photo"
                className="w-20 h-20 rounded-full object-cover"
                src={photoUrl}
              />
            </div>
            <div className="text-left mx-4 ">
              <h2 className="font-bold text-xl">
                {firstName + " " + lastName}
              </h2>
              {age && gender && <p>{age + ", " + gender}</p>}
              <p>{about}</p>
            </div>
            <div>
              <button
                className="btn btn-primary mx-2"
                onClick={() => reviewRequest("rejected", request._id)}
              >
                Reject
              </button>
              <button
                className="btn btn-secondary mx-2"
                onClick={() => reviewRequest("accepted", request._id)}
              >
                Accept
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Requests;
