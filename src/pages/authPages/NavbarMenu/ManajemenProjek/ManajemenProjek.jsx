import React, { useEffect, useState } from 'react'
import Navbar from '../../../../components/Navbar/Navbar'
import Bottom from '../../../../components/BottomBar/Bottom';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '../../../../config/firebase/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import NotFound404WNavbar from '../../../../url/NotFound404WNavbar';

const ManajemenProjek = () => {
  const [ data, setData ] = useState([]);

  // Get Role & Check PIC 
  const [ email, setEmail ] = useState('');
  const [ role, setRole ] = useState('');
  
  const [ checkPenanggungJawab, setCheckPenanggungJawab ] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
  const fetchData = async () => {
    const projectsCollection = collection(db, "projects");
    if(checkPenanggungJawab && role === 'user') {
      const orderByStatus = query(projectsCollection, where("picProject", "==", email), orderBy("statusProject", "desc"));
      try {
        const snapshot = await getDocs(orderByStatus);
        const fetchedData = [];
    
        for (const doc of snapshot.docs) {
          const projectData = doc.data();
          const emailUser = projectData.picProject;
    
          const usersCollection = collection(db, "users");
          const userQuery = query(usersCollection, where("emailUser", "==", emailUser));
          const userSnapshot = await getDocs(userQuery);
    
          if (!userSnapshot.empty) {
            fetchedData.push({
              id: doc.id,
              ...projectData,
              userData: userSnapshot.docs[0].data(),
            });
          }
        }
    
        setData(fetchedData);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
    } else if (role === "admin"){
      const orderByStatus = query(projectsCollection, orderBy("statusProject", "desc"));
      try {
        const snapshot = await getDocs(orderByStatus);
        const fetchedData = [];
    
        for (const doc of snapshot.docs) {
          const projectData = doc.data();
          const emailUser = projectData.picProject;
    
          const usersCollection = collection(db, "users");
          const userQuery = query(usersCollection, where("emailUser", "==", emailUser));
          const userSnapshot = await getDocs(userQuery);
    
          if (!userSnapshot.empty) {
            fetchedData.push({
              id: doc.id,
              ...projectData,
              userData: userSnapshot.docs[0].data(),
            });
          }
        }
    
        setData(fetchedData);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
    }
  
    
  };
  
    fetchData();
  }, [email, checkPenanggungJawab, role]);
      
  useEffect(()=>{
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const usersCollection = collection(db, "users");
      
              try {
              const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
              // Field from firestore
              const getEmail = querySnapshot.docs[0].data().emailUser;
              const getRole = querySnapshot.docs[0].data().roleUser;
              setEmail(getEmail);
              setRole(getRole);

              } catch (error) {
              console.log("Error: " + error)
              navigate('/login')
              }
          
          // ...
          
      });
      return () => {
          unsubscribe();
      }
  }, [navigate])

  useEffect(() => {
      const fetchData = async () => {
        const projectsCollection = collection(db, "projects");
  
          try {
            // projects table
            const querySnapshotProjects = await getDocs(query(projectsCollection, where("picProject", "==", email)));
            if (querySnapshotProjects.size > 0) {
              setCheckPenanggungJawab(true)
            }
  
          } catch (error) {
            console.log("err projects:" + error)
          }
      };
  
        fetchData();
      }, [email]);

  return (
    <div className="min-h-full">
      <Navbar />
      {(role === "admin" || checkPenanggungJawab) ? (
        <>
      <header className="bg-white drop-shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manajemen Mata Kuliah</h1>
        </div>
      </header>

      {/* Start - Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          
        <div className="flex flex-col ml-1 mr-1">

            <div className="flex justify-between">
              <div className="order-last">
              {role === "admin" && (
                  <a href="/manajemen-projek/projek-baru" className=" hover:text-white group block max-w-sm rounded-lg p-2.5 bg-gray-50 ring-1 ring-slate-900/5 shadow-sm space-y-3 hover:bg-indigo-500 hover:ring-indigo-300">
                    <div className="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                      </svg>
                      <h3 className="text-slate-900 text-sm font-semibold group-hover:text-white">Matkul Baru</h3>
                    </div>
                  </a>
              )}
              </div>
              
              <div>       
              <div className="relative max-w-xs mb-3">
                <label htmlFor="hs-table-search" className="sr-only">
                  Search
                </label>
                <input
                  type="text"
                  nama_projek="hs-table-search"
                  id="hs-table-search"
                  className="block w-full p-3 pl-10 text-sm border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Cari..."
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg
                    className="h-3.5 w-3.5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
                       
                        
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 mt-1">
        
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="drop-shadow-md overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 ">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mata Kuliah
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Penanggung Jawab
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((project, index) => (
                  <tr key={project.id} className={`${project.userData.emailUser === email && role === "admin" ? "bg-yellow-100 hover:bg-yellow-50" : "hover:bg-gray-100"}`}>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-5">
                          <div className="text-sm font-medium text-gray-900">{index+1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                          {project.nameProject} {project.nameProject.includes("-") ? '' : `- ${project.labelProject}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={project.userData.imageUser} alt="load" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{project.userData.usernameUser}</div>
                          <div className="text-sm text-gray-500">{project.userData.positionUser !== "" ? project.userData.positionUser : "Belum ada Jabatan"}</div>
                        </div>
                      </div>
                     
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          project.statusProject === "Public" ? "bg-teal-100 text-teal-800" : (project.statusProject === "Deactive" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800")
                        }`}
                      >
                        {project.statusProject}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to="/detail-projek" state={{projectData: project, clicked: "true"}} className="text-indigo-600 hover:text-indigo-900">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>


        </div>
      </main>
      {/* End - Content */}
        </>
      ) : (
        <>
        {(role === "user" && checkPenanggungJawab === false) && (
          <NotFound404WNavbar />
        )}
        </>
        
      )}
      
      
      <Bottom />
    </div>
  )
}

export default ManajemenProjek