import React, { useState, useEffect } from "react";
// import { useRouter } from "next/router";

const Header = () => {
  //   const router = useRouter();

  //   const handleclick = () => {
  //     if (isLoggedIn) {
  //       if (router.pathname === "/home") {
  //         window.location.reload(); // Reload the page if the user is on the "/home" page
  //       } else {
  //         router.push("/home");
  //       }
  //     } else {
  //       if (router.pathname === "/") {
  //         window.location.reload(); // Reload the page if the user is on the "/home" page
  //       } else {
  //         router.push("/");
  //       }
  //     }
  //   };

  return (
    <div className="flex space-x-3 w-full items-center p-5 h-16 border-r border-b border-borders">
      <div className="flex flex-row justify-between w-full items-center">
        <div
          className="flex flex-row items-center space-x-2 cursor-pointer ml-1"
          //   onClick={handleclick}
        >
          <div className="flex flex-row text-xl">
            <div className="text-headerBlack font-semibold">Gordon</div>
            <div className="text-crimsonDefault font-semibold">RamsAI</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
