import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./config/firebase/firebase"; // Adjust the path based on your project structure

import Login from './pages/Login';
import Register from "./pages/Register";
import NotFound404 from "./url/NotFound404";
import ManajemenProjek from "./pages/authPages/NavbarMenu/ManajemenProjek/ManajemenProjek";
import AddManajemenProjek from "./pages/authPages/NavbarMenu/ManajemenProjek/AddManajemenProjek/AddManajemenProjek";
import ManajemenUser from "./pages/authPages/NavbarMenu/ManajemenUser/ManajemenUser";
import AddUser from "./pages/authPages/NavbarMenu/ManajemenUser/AddUser/AddUser";
import Projek from "./pages/authPages/NavbarMenu/Projek/Projek";
import Personal from "./pages/authPages/NavbarMenu/Personal/Personal";
import AddPersonal from "./pages/authPages/NavbarMenu/Personal/AddPersonal/AddPersonal";
import Laporan from "./pages/authPages/NavbarMenu/Laporan/Laporan";
import Kalkulasi from "./pages/authPages/NavbarMenu/Kalkulasi/Kalkulasi";
import Dashboard from "./pages/authPages/NavbarMenu/Dashboard/Dashboard";
import Url from "./url/Url";

function App() {
  const [user] = useAuthState(auth);


  const ProtectedRoute = ({ element, path }) => {
    return user ? (
      element
    ) : (
      <Navigate replace to="/login" state={{ from: path }} />
    );
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute element={<Dashboard />} path="/" />} />
          <Route path="/manajemen-projek" element={<ProtectedRoute element={<ManajemenProjek />} path="/manajemen-projek" />} />
          <Route path="/manajemen-projek/projek-baru" element={<ProtectedRoute element={<AddManajemenProjek />} path="/manajemen-projek/projek-baru" />} />
          <Route path="/manajemen-user" element={<ProtectedRoute element={<ManajemenUser />} path="/manajemen-user" />} />
          <Route path="/manajemen-user/user-baru" element={<ProtectedRoute element={<AddUser />} path="/manajemen-user/user-baru" />} />
          <Route path="/projek" element={<ProtectedRoute element={<Projek />} path="/projek" />} />
          <Route path="/personal" element={<ProtectedRoute element={<Personal />} path="/personal" />} />
          <Route path="/personal/projek-baru" element={<ProtectedRoute element={<AddPersonal />} path="/personal/projek-baru" />} />
          <Route path="/laporan" element={<ProtectedRoute element={<Laporan />} path="/laporan" />} />
          <Route path="/kalkulasi" element={<ProtectedRoute element={<Kalkulasi />} path="/kalkulasi" />} />

          {/* Public Routes */}
          <Route path="/404" element={<NotFound404 />} />
          <Route path="*" element={<NotFound404 />} />
          <Route path="/url" element={<Url />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
