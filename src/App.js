import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./config/firebase/firebase"; // Adjust the path based on your project structure

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
import LoadingNavbar from "./components/Loading/LoadingNavbar/LoadingNavbar";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import RegisterAdmin from "./pages/RegisterAdmin";
import UserProfile from "./pages/authPages/NavbarMenu/ManajemenUser/UserProfile/UserProfile";
import Profile from "./pages/authPages/NavbarMenu/ManajemenUser/Profile/Profile";
import DetailProjek from "./pages/authPages/NavbarMenu/ManajemenProjek/DetailProjek/DetailProjek";
import ProjekKu from "./pages/authPages/NavbarMenu/Personal/ProjekKu/ProjekKu";

function LoadingSpinner() {
  return (
    <>
        <LoadingNavbar />
        <div className="flex items-center justify-center h-screen -mt-8">
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div role="status">
              <svg
                aria-hidden="true"
                className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-200 fill-purple-950"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </div>
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
      return  <div className="">
                <div className="relative">
                  <div className="absolute top-5 right-5">
                  <div role="status">
                        <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-200 fill-purple-950" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                </div>
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
