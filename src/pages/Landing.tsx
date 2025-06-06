import { Link } from "react-router-dom";
import Icon from "./../assets/Icon.svg";
import ellipseBg from "../assets/ellipse-bg.svg";

const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-start md:items-center justify-center bg-gradient-to-b from-white to-[#8FE1FF] font-poppins overflow-hidden">
      {/* Ellipse Background Top Right */}
      <img
        src={ellipseBg}
        alt="ellipse"
        className="absolute top-[-30vw] right-[-30vw] w-[80vw] md:w-[30vw] opacity-80 z-10"
      />

      {/* Ellipse Background Bottom Left */}
      <img
        src={ellipseBg}
        alt="ellipse"
        className="absolute bottom-[-20vw] left-[-30vw] w-[50vw] md:w-[30vw] rotate-180 opacity-100"
      />

      <div className="relative z-50 flex flex-col px-10 md:px-0 md:items-center text-left md:text-center -mt-20">
        <h3
          className="text-20 md:text-xl font-bold text-[#444444]"
          style={{
            WebkitTextStroke: "1px white",
          }}
        >
          Welcome to
        </h3>
        <h2
          className="text-[25px] md:text-4xl font-extrabold text-[#444444] leading-tight"
          style={{
            WebkitTextStroke: "1px white",
          }}
        >
          EduWMe <br className="block md:hidden" /> Project
        </h2>
        <img src={Icon} alt="GoGo Math" className="w-28 mt-10 md:w-40" />
        <Link to="/home">
          <button
            className="p-2 mt-10 font-extrabold text-white rounded-full shadow-md bg-[#303442] text-20 md:text-lg"
            style={{
              WebkitTextStroke: ".5px black",
            }}
          >
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
