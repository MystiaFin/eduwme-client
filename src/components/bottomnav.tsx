import { NavLink } from "react-router";
const BottomNavBar = () => {
  return (
    <nav>
      <div className="bottom-0">
        <ul className="flex flex-row justify-around">
          <li>
            <NavLink to="/home">Home</NavLink>
          </li>
          <li>
            <NavLink to="leaderboard">Leaderboard </NavLink>
          </li>
          <li>
            <NavLink to="profile">Profile</NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default BottomNavBar;
