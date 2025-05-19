import { Outlet } from "react-router";
import RadialGradient from "@src/assets/radial-bg.svg";

const RootLayout = () => {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-white to-[#8FE1FF] -z-10"></div>
      <img
        src={RadialGradient}
        alt="radial gradient"
        className="fixed bottom-0 left-0 w-24"
      />
      <Outlet />
    </>
  );
};

export default RootLayout;
