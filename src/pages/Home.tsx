import { NavLink } from "react-router";
import AdditionIcon from "@src/assets/additionIcon.svg";
import SubtractionIcon from "@src/assets/subtractionIcon.svg";
import MultiplicationIcon from "@src/assets/multiplicationIcon.svg";
import DivisionIcon from "@src/assets/divisionIcon.svg";

const ButtonStyle: string =
  "w-34 h-34 p-2 bg-[#CFB6FF] flex flex-col justify-center items-center rounded-2xl border-4 border-[#374DB0] text-white font-bold text-lg gap-1";

const Home = () => {
  return (
    <div className="gap-5 flex flex-col mt-20">
      <section className="flex items-center justify-center gap-5">
        <NavLink className={ButtonStyle}>
          <img src={AdditionIcon} />
          <p>Addition</p>
        </NavLink>
        <NavLink className={ButtonStyle}>
          <img src={SubtractionIcon} />
          <p>Subtraction</p>
        </NavLink>
      </section>
      <section className="flex items-center justify-center gap-5">
        <NavLink className={ButtonStyle}>
          <img src={MultiplicationIcon} />
          <p className="text-md">Multiplication</p>
        </NavLink>
        <NavLink className={ButtonStyle}>
          <img src={DivisionIcon} />
          <p>Division</p>
        </NavLink>
      </section>
    </div>
  );
};

export default Home;
