import TopNavbar from "../components/topnav";
import BottomNavbar from "../components/bottomnav";
import SideNavbar from "../components/sidenav";
import { Outlet } from "react-router";


const MainLayout = () => {

  return (
    <div className='min-h-screen transition-colors duration-300 dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 bg-gradient-to-b from-[#E0E7FF] to-[#EAEAFF]'>
      <TopNavbar />
      
      {/* Side navigation - only visible on md screens and up */}
      <div className="hidden md:block">
        <SideNavbar />
      </div>
      
      {/* Main content - with padding based on screen size */}
      <main className="pt-16 pb-24 md:pt-16 md:pb-6 md:pl-24 px-4">
        <Outlet />
      </main>
      
      {/* Bottom navigation - only visible on smaller screens */}
      <div className="block md:hidden">
        <BottomNavbar />
      </div>
    </div>
  );
};

export default MainLayout;