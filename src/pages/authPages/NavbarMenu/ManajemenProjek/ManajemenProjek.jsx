import React, { useEffect, useState } from 'react'
import Navbar from '../../../../components/Navbar/Navbar'
import Bottom from '../../../../components/BottomBar/Bottom';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '../../../../config/firebase/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import NotFound404WNavbar from '../../../../url/NotFound404WNavbar';

const loadBait = [
  {id : "bait"},
  {id : "bait"},
  {id : "bait"},
  {id : "bait"},
  {id : "bait"}
]

const ManajemenProjek = () => {
  const [ data, setData ] = useState([]);

  // Get Role & Check PIC 
  const [ email, setEmail ] = useState('');
  const [ role, setRole ] = useState('');
  
  const [ checkPenanggungJawab, setCheckPenanggungJawab ] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Total Projek
  const [ totalProjects, setTotalProjects ] = useState(0);

  // Loading

  const navigate = useNavigate();

  useEffect(() => {
  const fetchData = async () => {
    const projectsCollection = collection(db, "projects");
    const queryTotal = query(projectsCollection);

    setTimeout(async () => {
      const snapshotTotal = await getDocs(queryTotal);
      setTotalProjects(snapshotTotal.size)
    }, 1400);
   

    console.log("jumlah projek: " + totalProjects);
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
      console.log("Langsung fetch")
      
      console.log("aku cari: " + searchQuery)
      if (searchQuery) {

        const capitalFirstWord = searchQuery.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        const searchVariations = [`${searchQuery.toUpperCase()}`, `${searchQuery.toLowerCase()}`, `${capitalFirstWord}`, `${searchQuery}`]

        const searchLabel = query(projectsCollection,
          where("labelProject", "in", searchVariations),
          limit(5)
         );

        const searchName = query(projectsCollection,
          where("nameProject", "in", searchVariations),
          limit(5)
        );

        const searchId = query(projectsCollection,
          where("idProject", "in", searchVariations),
          limit(5)
        );

        const searchStatus = query(projectsCollection,
          where("statusProject", "in", searchVariations),
          limit(5)
        );

        const searchEmail = query(projectsCollection,
          where("picProject", "in", searchVariations),
          limit(5)
        );

      try {
        const [snapshotLabel, snapshotName, snapshotId, snapshotStatus, snapshotEmail] = await Promise.all([
          getDocs(searchLabel),
          getDocs(searchName),
          getDocs(searchId),
          getDocs(searchStatus),
          getDocs(searchEmail)
        ]);
      
        const fetchedData = [];
        
        // first query
        for (const doc of snapshotLabel.docs) {
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
        // second query
          for (const doc of snapshotName.docs) {
            const projectData = doc.data();
            // Add any additional processing for the second query if needed
            const emailUser = projectData.picProject;
    
            const usersCollection = collection(db, "users");
            const userQuery = query(usersCollection, where("emailUser", "==", emailUser));
            const userSnapshot = await getDocs(userQuery);
            fetchedData.push({
              id: doc.id,
              ...projectData,
              userData: userSnapshot.docs[0].data(),
            });
          }
        // third query
          for (const doc of snapshotId.docs) {
            const projectData = doc.data();
            // Add any additional processing for the second query if needed
            const emailUser = projectData.picProject;
    
            const usersCollection = collection(db, "users");
            const userQuery = query(usersCollection, where("emailUser", "==", emailUser));
            const userSnapshot = await getDocs(userQuery);
            fetchedData.push({
              id: doc.id,
              ...projectData,
              userData: userSnapshot.docs[0].data(),
            });
          }
        // fourth query
          for (const doc of snapshotStatus.docs) {
            const projectData = doc.data();
            // Add any additional processing for the second query if needed
            const emailUser = projectData.picProject;
    
            const usersCollection = collection(db, "users");
            const userQuery = query(usersCollection, where("emailUser", "==", emailUser));
            const userSnapshot = await getDocs(userQuery);
            fetchedData.push({
              id: doc.id,
              ...projectData,
              userData: userSnapshot.docs[0].data(),
            });
          }
        // fifth query
          for (const doc of snapshotEmail.docs) {
            const projectData = doc.data();
            // Add any additional processing for the second query if needed
            const emailUser = projectData.picProject;
    
            const usersCollection = collection(db, "users");
            const userQuery = query(usersCollection, where("emailUser", "==", emailUser));
            const userSnapshot = await getDocs(userQuery);
            fetchedData.push({
              id: doc.id,
              ...projectData,
              userData: userSnapshot.docs[0].data(),
            });
          }
        
        setData(fetchedData);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
      } else if (!searchQuery) {
       
        const orderByStatus = query(projectsCollection,
          orderBy("statusProject", "desc"),
          limit(5),
          );
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
      
    }
  
    
  };
  
    fetchData();
  }, [email, checkPenanggungJawab, role, searchQuery, totalProjects]);
      
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

  // Copy to clipboard
  const [ clickedCopy, setClickedCopy ] = useState(false)
  const [ startAnimation, setStartAnimation ] = useState(false)

  const handleCopy = (valueId) => {
    try {
      // Get the text field
      console.log(valueId)
      const copyText = valueId;

      // Copy the text inside the text field
      navigator.clipboard.writeText(copyText);

      setTimeout(() => {
        setClickedCopy(true);
      }, 100);
      setTimeout(() => {
        setStartAnimation(true);
      }, 120);

      setTimeout(() => {
        setStartAnimation(false);
      }, 3000);
      
      setTimeout(() => {
        setClickedCopy(false);
      }, 3500);

    } catch (error) {
      console.log(error);
    }
    
  };

  return (
    <div className="min-h-full">
      <Navbar />
      {(role === "admin" || checkPenanggungJawab) ? (
        <>
      <header className="bg-white drop-shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manajemen Projek</h1>
        </div>
      </header>

      {/* Start - Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          
        <div className="flex flex-col ml-1 mr-1">

            <div className="flex justify-between">
              {role === "admin" && (
                  <>
                <div className="order-last">
                    <a href="/manajemen-projek/projek-baru" className=" hover:text-white group block max-w-sm rounded-lg p-2.5 bg-gray-50 ring-1 ring-slate-900/5 shadow-sm space-y-3 hover:bg-indigo-500 hover:ring-indigo-300">
                      <div className="flex items-center space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                        </svg>
                        <h3 className="text-slate-900 text-sm font-semibold group-hover:text-white">Projek Baru</h3>
                      </div>
                    </a>
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full p-3 pl-10 text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
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
                </>
              
              )}
              
             

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
              {totalProjects !== 0 ? (
                <tbody className="bg-white divide-y divide-gray-200">
                {data.map((project, index) => (
                  <tr key={project.id} className={`${project.userData.emailUser === email && role === "admin" ? "bg-indigo-100 hover:bg-indigo-50" : "hover:bg-gray-100"}`}>
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
                          <div className="text-sm font-medium text-gray-900 inline-flex">
                          {project.nameProject} {project.nameProject.includes("-") ? '' : `- ${project.labelProject}`}
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                              onClick={() => handleCopy(project.idProject)}
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4 ml-2 scale-125 transition-all duration-300 hover:scale-150 text-indigo-600/75 hover:text-indigo-600 cursor-pointer -mb-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
                          </svg>
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
              ) : (
                <>
                  {totalProjects === 0 && (
                    <tbody>
                    {loadBait.map((bait, index) => (
                    <tr className="animate-pulse">
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
                           <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center mt-4">
                        <svg className="w-8 h-8 me-3 text-gray-200 dark:text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                          </svg>
                          <div>
                              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                              <div className="w-48 h-1.5 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                          </div>
                      </div>
                       
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                       <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-10"></div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                  )}
                </>
                
              )}
              
            </table>

          </div>


        </div>
      </div>
    </div>

        </div>


              {clickedCopy && (
                <div id="toast-simple" 
                  className={`mr-3 flex items-center w-full fixed bottom-0 right-4 bg-white max-w-xs p-4 space-x-2 rtl:space-x-reverse text-gray-500 rounded-lg
                   border-2 shadow border-indigo-700/20
                  ${startAnimation ? 'ease-in duration-500 transition -translate-y-7' : 'ease-out duration-700 transition -translate-y-0'}`} role="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                  </svg>
                    <div className="ps-4 text-sm text-gray-700">Copied di clipboard</div>
                </div>
              )}

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