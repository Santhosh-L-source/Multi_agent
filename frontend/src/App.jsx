import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
function App() {
  let token = localStorage.getItem("access_token");

    if (token) {
        return <Dashboard />;
    }
    return (
        <Login />
    );
}

export default App;