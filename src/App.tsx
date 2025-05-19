import "./App.css";
import MainLogo from "@src/assets/logo.svg";

const buttonStyle: string = "bg-confirm-blue text-white p-2 rounded-full";

function App() {
  return (
    <main>
      <h2>Welcome to</h2>
      <h1>
        EduWMe <br /> Project
      </h1>
      <img src={MainLogo} alt="EduWMe Logo" />
      <button className={buttonStyle}>Get Started</button>
    </main>
  );
}

export default App;
