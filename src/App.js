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
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return  <div role="status" className='flex items-center justify-center h-screen'>
                <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
            </div>;
  }

  const ProtectedRoute = ({ element, path }) => {
  if (!user) {
    // If the user is not logged in and tries to access a protected route, redirect to the login page
    return <Navigate replace to="/login" state={{ from: path }} />;
  } else {
    // If the user is logged in and not trying to access the login page, allow access to the route
    return element;
  }
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
