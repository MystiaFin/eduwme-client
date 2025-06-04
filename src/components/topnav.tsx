import NavbarLogo from "@src/assets/nav-logo.svg";
import ExitButton from "./exitbutton";
const HamburgerStyle: string =
  "mb-[5px] w-[28px] h-[8px] block bg-[#273B4A] rounded-r-xs";
const TopNavBar = () => {
  return (
    <div className="flex items-center mt-6">
      <div className="flex flex-col">
        {Array(3)
          .fill(null)
          .map((_, index) => (
            <div key={index} className={HamburgerStyle}></div>
          ))}
      </div>
      <img src={NavbarLogo} alt="Logo" className="w-[100px] h-[40px]" />
      <ExitButton />
    </div>
  );
};

export default TopNavBar;
