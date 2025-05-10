const HamburgerStyle: string =
  "mb-[5px] w-[28px] h-[8px] block bg-[#3A603B] rounded-r-xs";
const TopNavBar = () => {
  return (
    <div className="flex">
      <div className="flex flex-col">
        {Array(3)
          .fill(null)
          .map((_, index) => (
            <div key={index} className={HamburgerStyle}></div>
          ))}
      </div>
    </div>
  );
};

export default TopNavBar;
