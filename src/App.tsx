import { Link } from "react-router-dom";
import Logo from "@src/assets/logo.svg";
import ellipseBg from "@src/assets/ellipse-bg.svg";

const LandingPage: React.FC = () => {
  return (
    <div className="relative flex flex-col items-start md:items-center justify-center h-screen overflow-hidden bg-white">
      {/* Ellipse Background Top Right */}
      <img
        src={ellipseBg}
        alt="ellipse"
        className="absolute top-0 right-0 w-[50vw] md:w-[30vw] opacity-80"
      />

      {/* Ellipse Background Bottom Left */}
      <img
        src={ellipseBg}
        alt="ellipse"
        className="absolute bottom-0 left-0 w-[50vw] md:w-[30vw] rotate-180 opacity-80"
      />

      <div className="z-10 flex flex-col px-6 md:px-0 md:items-center text-left md:text-center">
        <h3 className="text-3xl md:text-xl text-[#888D27] font-normal">
          Welcome to
        </h3>
        <h2 className="text-[7vw] md:text-4xl font-bold text-[#888D27] leading-tight">
          EduWMe <br className="block md:hidden" /> Project
        </h2>
        <img src={Logo} alt="GoGo Math" className="w-32 mt-10 md:w-40" />
        <Link to="/home">
          <button className="px-6 py-2 mt-10 font-semibold text-white rounded-full shadow-md bg-[#A6B91A]">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
