import TopNavbar from "../components/topnav";
import BottomNavbar from "../components/bottomnav";
import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div className="h-screen">
      <TopNavbar />
      <Outlet />
      <BottomNavbar />
    </div>
  );
};

export default MainLayout;
