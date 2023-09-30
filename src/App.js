import {
   BrowserRouter,
   Routes,
   Route, 
} from "react-router-dom";

import Login from './pages/Login';
import Register from "./pages/Register";
import Dashboard from "./pages/halaman/dashboard";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
