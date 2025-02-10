"use client";

import React, { useState } from "react";
import Image from "next/image";
import icon from "../../icon.jpg";
// import InfoDropdown from "./InfoCard";
// import InfoIcon from "../icons/infoIcon";

const Header = () => {
  const [showInfo, setShowInfo] = useState(false);

  const toggleInfo = () => {
    setShowInfo((prev) => !prev);
  };
  return (
    <div className="flex w-full items-center justify-center p-5 h-1/12 border-b border-border bg-surface relative">
      <Image
        src={icon}
        alt="icon"
        height={60}
        className="rounded-xl mr-4 shadow-xl"
      />
      <div className="bg-primary text-3xl font-extrabold brightness-105 italic p-3 pr-4 rounded-2xl shadow-xl">
        <div>Ask Chef RamsAi!</div>
      </div>
      {/* <div className="absolute right-10">
        <button
          onClick={toggleInfo}
          className="text-eton-blue hover:text-powder-blue transition"
        >
          <InfoIcon />
        </button>
      </div>
      {showInfo && (
        <div className="absolute top-full inset-x-1/5 mt-10">
          <InfoDropdown />
        </div>
      )} */}
    </div>
  );
};

export default Header;
