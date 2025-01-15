import React, { useState } from "react";
import UserCard from "./UserCard";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const EditProfile = () => {
  const user = useSelector((state) => state.user);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [gender, setGender] = useState(user.gender);
  const [about, setAbout] = useState(user.about);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [age, setAge] = useState(user.age);
  const [toster, setToster] = useState(false);
  const [error, setError] = useState(false);


  const handleSave = async () => {
    try {
      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          gender,
          about,
          age,
          photoUrl,
        },
        { withCredentials: true }
      );
      if (res.status === 200) {
        setToster(true);
        setTimeout(() => {
            setToster(false);
            setError(false);
        }, 3000);
      }
    } catch (error) {
      setToster(true);
      setError(true);
      setTimeout(() => {
        setToster(false);
        setError(false);
    }, 3000);
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="flex justify-center my-10 mx-10">
        <div className="card bg-base-100 w-96 shadow-xl">
          <div className="card-body gap-0">
            <h2 className="card-title justify-center">Edit Profile</h2>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">First Name</span>
              </div>
              <input
                type="text"
                value={firstName}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Last Name</span>
              </div>
              <input
                type="text"
                value={lastName}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Photo URl:</span>
              </div>
              <input
                type="text"
                value={photoUrl}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </label>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Age:</span>
              </div>
              <input
                type="text"
                value={age}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setAge(e.target.value)}
              />
            </label>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">gender</span>
              </div>
              <input
                type="text"
                value={gender}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setGender(e.target.value)}
              />
            </label>
            <label className="form-control w-full max-w-xs mb-2">
              <div className="label">
                <span className="label-text">About:</span>
              </div>
              <input
                type="text"
                value={about}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setAbout(e.target.value)}
              />
            </label>
            <div className="card-actions justify-center">
              <button className="btn btn-primary" onClick={handleSave}>
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <UserCard
          user={{ firstName, lastName, gender, about, photoUrl, age }}
        />
      </div>
      {toster && (
        <div className="toast toast-top toast-center">
         {!error ? <div className="alert alert-success">
            <span>Profile updated successfully</span>
          </div>:<div className="alert alert-error">
            <span>Error updating profile</span>
          </div>}
        </div>
      )}
    </div>
  );
};

export default EditProfile;
