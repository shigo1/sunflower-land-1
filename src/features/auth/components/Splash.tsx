import React from "react";

import logo from "assets/brand/logo.png";
import clouds from "assets/brand/clouds.png";
import sunflowers from "assets/brand/sunflower_border.png";
import pumpkin from "assets/crops/pumpkin/crop.png";

export const Splash: React.FC = () => {
  return (
    <div className="bg-blue-600 w-full h-full flex relative items-center justify-center">
      <div
        className="absolute 
      z-50 
      top-0 
      left-0
      flex
      w-full
      align-items-center
      justify-center
      text-center
      bg-brown-300
      p-6
      text-xs
      sm:text-sm 
      h-8
      text-white"
      >
        SFL is not tradable until May 9th. Beware of scams
      </div>
      <div className="relative mb-96 animate-float z-10">
        <img
          src={pumpkin}
          className="absolute w-8 -rotate-[20deg] z-10 -top-5 sm:-left-3 sm:-rotate-[30deg] sm:w-12 sm:-top-7"
        />
        <img src={logo} />
      </div>
      <div
        className="bg-repeat w-full h-full absolute inset-0"
        style={{ backgroundImage: `url(${clouds})` }}
      />
      <img src={sunflowers} className="absolute w-full bottom-0" />
    </div>
  );
};
