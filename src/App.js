import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./config/firebase/firebase";

import Login from './pages/Login';
import Register from "./pages/Register";
import NotFound404 from "./url/NotFound404";
import ManajemenProjek from "./pages/authPages/NavbarMenu/ManajemenProjek/ManajemenProjek";
import AddManajemenProjek from "./pages/authPages/NavbarMenu/ManajemenProjek/AddManajemenProjek/AddManajemenProjek";
import ManajemenUser from "./pages/authPages/NavbarMenu/ManajemenUser/ManajemenUser";
import AddUser from "./pages/authPages/NavbarMenu/ManajemenUser/AddUser/AddUser";
import Projek from "./pages/authPages/NavbarMenu/Projek/Projek";
import Personal from "./pages/authPages/NavbarMenu/Personal/Personal";
import Laporan from "./pages/authPages/NavbarMenu/Laporan/Laporan";
import Kalkulasi from "./pages/authPages/NavbarMenu/Kalkulasi/Kalkulasi";
import Dashboard from "./pages/authPages/NavbarMenu/Dashboard/Dashboard";
import Url from "./url/Url";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import RegisterAdmin from "./pages/RegisterAdmin";
import UserProfile from "./pages/authPages/NavbarMenu/ManajemenUser/UserProfile/UserProfile";
import Profile from "./pages/authPages/NavbarMenu/ManajemenUser/Profile/Profile";
import DetailProjek from "./pages/authPages/NavbarMenu/ManajemenProjek/DetailProjek/DetailProjek";
import ProjekKu from "./pages/authPages/NavbarMenu/Personal/ProjekKu/ProjekKu";
import BaseLoading from "./components/Loading/BaseLoading/BaseLoading";

function LoadingSpinner() {
  return (
    <>
      <BaseLoading/>
    </>
  );
}

function App() {
  const [user, loading] = useAuthState(auth);
  const [ role, setRole ] = useState('');
  

 
  const ProtectedRoute = ({ element, path, allowedRoles }) => {

      useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
              const usersCollection = collection(db, "users");
      
              try {
                const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
                // Field from firestore
                const getRole = querySnapshot.docs[0].data().roleUser;
                setRole(getRole);
    
              } catch (error) {
                console.log("Error: " + error)
              }
            // ...
          
        });
        return () => {
          unsubscribe();
        }
    }, [])

    if (loading) {
      return <LoadingSpinner />
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      // User doesn't have the required role, redirect to an unauthorized page
      return <NotFound404 />
    }
    
    return user ? (
        element
      ) : (
        <Navigate replace to="/login" state={{ from: path }} />
      );
  };

  const ProtectedRouteLogin = ({ element, path }) => {

    useEffect(()=>{
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && loading) {
              // User is signed in, see docs for a list of available properties
              // https://firebase.google.com/docs/reference/js/firebase.User
              // Assuming db is your Firestore instance
              const usersCollection = collection(db, "users");

              // Check if a document with the same idUsers already exists
              const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));

              if (querySnapshot.size === 0) {
                // No existing document found, add a new one
                try {
                  const docRef = await addDoc(usersCollection, {
                    usernameUser: user.displayName,
                    idUser: user.uid, 
                    emailUser: user.email,
                    roleUser: "user",
                    imageUser: user.photoURL,
                    positionUser: "Belum ada jabatan"
                  });
                  console.log("Document written with ID: ", docRef.id);
                } catch (e) {
                  console.error("Error adding document: ", e);
                }
              } else {
                // Document with the same idUsers already exists, handle accordingly
                console.log("Document with the same idUsers already exists");
                // You may choose to update the existing document here
              }
              // ...
            } else {
              return null;
            }
          });
          return () => {
            unsubscribe();
          }
    }, [])

    if (loading) {
      return  <div className="-mt-3">
                <progress className="progress w-full"></progress>
              </div>
    }

    return !user ? (
      element
    ) : (
      <Navigate replace to="/" state={{ from: path }} />
    );
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          
          {/* ProtectedLogin Route */}
          <Route path="/login" element={<ProtectedRouteLogin element={<Login />} path="/login" />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute element={<Dashboard />} path="/" />} />
          <Route path="/manajemen-projek" element={<ProtectedRoute element={<ManajemenProjek />} path="/manajemen-projek" allowedRoles={['admin', 'user']} />} />
          <Route path="/manajemen-projek/projek-baru" element={<ProtectedRoute element={<AddManajemenProjek />} path="/manajemen-projek/projek-baru" allowedRoles={['admin']} />} />
          <Route path="/detail-projek" element={<ProtectedRoute element={<DetailProjek />} path="/user-profile-admin" allowedRoles={['admin', 'user']} />} />
          <Route path="/manajemen-user" element={<ProtectedRoute element={<ManajemenUser />} path="/manajemen-user" allowedRoles={['admin']} />} />
          <Route path="/user-profile-admin" element={<ProtectedRoute element={<UserProfile />} path="/user-profile-admin" allowedRoles={['admin']} />} />
          <Route path="/user-profile" element={<ProtectedRoute element={<Profile />} path="/user-profile" />} />
          <Route path="/manajemen-user/user-baru" element={<ProtectedRoute element={<AddUser />} path="/manajemen-user/user-baru" allowedRoles={['admin']} />} />
          <Route path="/projek" element={<ProtectedRoute element={<Projek />} path="/projek" />} />
          <Route path="/personal" element={<ProtectedRoute element={<Personal />} path="/personal" />} />
          <Route path="/personal/projekku" element={<ProtectedRoute element={<ProjekKu />} path="/personal/projekku" />} />
          <Route path="/laporan" element={<ProtectedRoute element={<Laporan />} path="/laporan" />} />
          <Route path="/kalkulasi" element={<ProtectedRoute element={<Kalkulasi />} path="/kalkulasi" />} />

          {/* Public Routes (Need Authentication) */}
          <Route path="*" element={<NotFound404 />} />
          
          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/register-admin" element={<RegisterAdmin />} />
          <Route path="/url" element={<Url />} />
        
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
