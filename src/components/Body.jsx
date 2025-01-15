import React, { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../store/UserSlice";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  useEffect(() => {
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    try {
      if (user) return;
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });
      if (res.status === 200) {
        dispatch(addUser(res.data));
      }
    } catch (error) {
      console.log(error);
      if (error.status === 400) {
        navigate("/login");
      }
    }
  };
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default Body;
