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
import AddManajemenProjek from "./pages/authPages/NavbarMenu/ManajemenProjek/AddManajemenProjek/AddManajemenProjek";
import Personal from "./pages/authPages/NavbarMenu/Personal/Personal";
import AddPersonal from "./pages/authPages/NavbarMenu/Personal/AddPersonal/AddPersonal";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/404" element={<NotFound404 />} />

            {/* Manajemen Projek */}
            <Route path="/manajemen-projek" element={<ManajemenProjek />} />
            <Route path="/manajemen-projek/projek-baru" element={<AddManajemenProjek />} />

            <Route path="/manajemen-user" element={<ManajemenUser />} />
            <Route path="/projek" element={<Projek />} />

            {/* Projek Personal */}
            <Route path="/personal" element={<Personal />} />
            <Route path="/personal/projek-baru" element={<AddPersonal />} />

            <Route path="/laporan" element={<Laporan />} />
            <Route path="/kalkulasi" element={<Kalkulasi />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
