import {
   BrowserRouter,
   Routes,
   Route, 
} from "react-router-dom";

import Login from './pages/Login';
import Register from "./pages/Register";
import Dashboard from "./pages/authPages/NavbarMenu/Dashboard/dashboard";
import NotFound404 from "./url/NotFound404";
import ManajemenProjek from "./pages/authPages/NavbarMenu/ManajemenProjek/ManajemenProjek";
import ManajemenUser from "./pages/authPages/NavbarMenu/ManajemenUser/ManajemenUser";
import Projek from "./pages/authPages/NavbarMenu/Projek/Projek";
import Laporan from "./pages/authPages/NavbarMenu/Laporan/Laporan";
import Kalkulasi from "./pages/authPages/NavbarMenu/Kalkulasi/Kalkulasi";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/404" element={<NotFound404 />} />
            <Route path="/manajemen-projek" element={<ManajemenProjek />} />
            <Route path="/manajemen-user" element={<ManajemenUser />} />
            <Route path="/projek" element={<Projek />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/kalkulasi" element={<Kalkulasi />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
