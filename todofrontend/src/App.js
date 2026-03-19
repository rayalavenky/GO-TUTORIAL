import "./App.scss";

import TodoBody from "./components/TodoBody";

export const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";
function App() {
  return (
    <>
      <TodoBody />
    </>
  );
}

export default App;
