import React from "react";
import Image from 'next/image';
import icon from "../../icon.jpg";

const Header = () => {
  return (
    <div className="flex w-full items-center justify-center p-5 h-1/12 border-b-2 border-eton-blue">
        <Image src={icon} alt="icon" height={60} className="rounded-xl mr-4 shadow-xl"/>
        <div className="bg-powder-blue text-3xl font-extrabold brightness-105 italic p-3 pr-4 rounded-2xl shadow-xl">
          <div>Ask Chef RamsAi!</div>
        </div>
        {/* <Image src={icon} alt="icon" height={60} className="rounded-xl ml-4 shadow-xl"/> */}
      </div>
  );
};

export default Header;
