import React from "react";

const UserCard = ({user}) => {
  return (
    <div className=" flex justify-center my-5">
      <div className="card bg-base-300 w-96 shadow-xl">
        <figure className="px-10 pt-20">
          <img src={user.photoUrl} alt="user-photo" className="rounded-xl" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{`${user.firstName} ${user.lastName}`}</h2>
          <h3>{user.gender}, {user.age}</h3>
          <p>{user.about}</p>
          <div className="card-actions  justify-center my-4">
            <button className="btn btn-error">Reject</button>
            <button className="btn btn-secondary">Intrested</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
