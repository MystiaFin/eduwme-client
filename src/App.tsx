import { Link } from "react-router";
import Logo from "@src/assets/logo.svg";

const LandingPage: React.FC = () => {
  return (
    <main className="pl-4 relative flex flex-col items-start md:items-center justify-center h-screen overflow-hidden">
      <div className="z-10 flex flex-col px-6 md:px-0 md:items-center text-left md:text-center">
        <h3 className="text-3xl md:text-4xl text-header-blue font-bold text-stroke">
          Welcome to
        </h3>
        <h2 className="text-4xl md:text-6xl font-black text-header-blue text-stroke">
          EduWMe <br className="block md:hidden" /> Project
        </h2>
        <img src={Logo} alt="GoGo Math" className="mb-10 w-40 mt-10 md:w-64" />
        <Link to="/register">
          <button className="w-36 py-2 bg-confirm-blue text-white rounded-full text-lg">
            Get Started
          </button>
        </Link>
      </div>
    </main>
  );
};

export default LandingPage;
