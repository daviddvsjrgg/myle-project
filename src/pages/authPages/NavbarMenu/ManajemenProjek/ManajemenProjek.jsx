import React, { useEffect, useState } from 'react'
import Navbar from '../../../../components/Navbar/Navbar'
import Bottom from '../../../../components/BottomBar/Bottom';
import { collection, endBefore, getDocs, limit, limitToLast, orderBy, query, startAfter, where } from 'firebase/firestore';
import { auth, db } from '../../../../config/firebase/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import NotFound404WNavbar from '../../../../url/NotFound404WNavbar';

const loadBait = [
  {id : 1},
  {id : 2},
  {id : 3},
  {id : 4},
  {id : 5}
]

const limitData = 5;
let firstDocument = null;
let lastDocument = null;

const ManajemenProjek = () => {
  const [ data, setData ] = useState([]);

  // Get Role & Check PIC 
  const [ email, setEmail ] = useState('');
  const [ role, setRole ] = useState('');
  
  const [ checkPenanggungJawab, setCheckPenanggungJawab ] = useState(false);

  // Search
  const [ searchQuery, setSearchQuery ] = useState('');

  // Total Projek
  const [ totalProjects, setTotalProjects ] = useState(0);
  const [ totalProjectsLoading, setTotalProjectsLoading ] = useState(0);

  // Loading
  const navigate = useNavigate();

  // disabled Pagination 
  const  [disabledPagination, setDisabledPagination ] = useState(false)

  const [ addFive, setAddFive ] = useState(0)
  const [ disabledSebelumnya, setDisabledSebelumnya ] = useState(true)
  const [ disabledSelanjutnya, setDisabledSelanjutnya ] = useState(true)


  useEffect(() => {
  const fetchData = async () => {
    localStorage.setItem('navbarClicked', "manajemenProjekClicked");
    setDisabledPagination(true);
    if(role === "admin") {
      setDisabledPagination(false);
    } else if (role === "user") {
      setDisabledPagination(true);
    }

    if (totalProjects < 6) {
      setDisabledSelanjutnya(false)
    } else {
      setDisabledSelanjutnya(true)
    }
    setDisabledSebelumnya(false);
    setDisabledSelanjutnya(false)
    const projectsCollection = collection(db, "projects");
    const queryTotal = query(projectsCollection);

    const snapshotTotalLoading = await getDocs(queryTotal);
    setTotalProjectsLoading(snapshotTotalLoading.size)

    setTimeout(async () => {
      const snapshotTotal = await getDocs(queryTotal);
      setTotalProjects(snapshotTotal.size)
      if (totalProjects >= 6 ) {
        setDisabledSelanjutnya(true)
      }
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
        setDisabledPagination(true);
        setAddFive(0);
        
        setTimeout(() => {
          setDariAwal(1);
          setDariAkhir(5);
          setDisabledSebelumnya(false);
          setDisabledSelanjutnya(true);
        }, 500);
        const capitalFirstWord = searchQuery.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        const searchVariations = [`${searchQuery.toUpperCase()}`, `${searchQuery.toLowerCase()}`, `${capitalFirstWord}`, `${searchQuery}`]

        const searchLabel = query(projectsCollection,
          where("labelProject", "in", searchVariations),
         );

        const searchName = query(projectsCollection,
          where("nameProject", "in", searchVariations),
        );

        const searchId = query(projectsCollection,
          where("idProject", "in", searchVariations),
        );

        const searchStatus = query(projectsCollection,
          where("statusProject", "in", searchVariations),
        );

        const searchEmail = query(projectsCollection,
          where("picProject", "in", searchVariations),
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
        
        if (!snapshotLabel.empty) {
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
      }

      if (!snapshotName.empty) {
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
        }

        if (!snapshotId.empty) {
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
        }

        if (!snapshotStatus.empty) {
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
        }

        if (!snapshotEmail.empty) {
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
        }
        
        setData(fetchedData);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
      } else if (!searchQuery) {
        setDisabledPagination(false)
        const orderByStatus = query(projectsCollection,
          orderBy("statusProject", "desc"),
          limit(limitData),
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

 const [ dariAwal, setDariAwal ] = useState(1)
 const [ dariAkhir, setDariAkhir ] = useState(5)

 
  const fetchNextData = async () => {
    if (role === "admin" ) {
      try {
        const projectsCollection = collection(db, "projects");
    
        // If lastDocument exists, use it as the starting point for the next query
        const orderByStatus = lastDocument
          ? query(projectsCollection, orderBy("statusProject", "desc"), startAfter(lastDocument), limit(limitData))
          : query(projectsCollection, orderBy("statusProject", "desc"), limit(limitData));
    
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
    
        // Update firstDocument and lastDocument for the next iteration
        firstDocument = snapshot.docs[0];
        lastDocument = snapshot.docs[snapshot.docs.length - 1];
        setData(fetchedData);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
    }
  };
  
  const fetchPreviousData = async () => {
    
      try {
        const projectsCollection = collection(db, "projects");
    
        // If firstDocument exists, use it as the starting point for the previous query
        const orderByStatus = firstDocument
          ? query(projectsCollection, orderBy("statusProject", "desc"), endBefore(firstDocument), limitToLast(limitData))
          : query(projectsCollection, orderBy("statusProject", "desc"), limit(limitData));
    
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
    
        // Update firstDocument and lastDocument for the next iteration
        firstDocument = snapshot.docs[0];
        lastDocument = snapshot.docs[snapshot.docs.length - 1];
    
        setData(fetchedData);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
   
  };

  const handleSelanjutnya = async () => {
      setDisabledSebelumnya(false)
      setDisabledSelanjutnya(false)
      setTimeout(() => {
        setDisabledSelanjutnya(false);
        if (totalProjects === dariAkhir) {
          setDisabledSelanjutnya(false);
        }
        setAddFive((prev) => prev + 5)
        
        if (dariAwal + 5 > totalProjects) {
          setDariAwal(totalProjects)
          setDisabledSelanjutnya(false);
        } else {
          setDisabledSebelumnya(true);
          setDariAwal((prev) => prev + 5)
        }

        if (dariAkhir + 5 > totalProjects || dariAkhir + 5 === totalProjects) {
          setDariAkhir(totalProjects)
        } else {
          setDisabledSelanjutnya(true);
          setDariAkhir((prev) => prev + 5)
        }
      }, 1200);
      
      fetchNextData();
  };
  
  const handleSebelumnya = () => {
      setDisabledSebelumnya(false)
      setDisabledSelanjutnya(false)
      setTimeout(() => {
        setDisabledSelanjutnya(true)
        setDisabledSebelumnya(true)
        setAddFive((prev) => prev - 5)
    
        if (dariAwal - 5 < 5) {
          setDisabledSebelumnya(false);
        }
        
        setDariAwal((prev) => prev - 5)
    
        if (dariAkhir - 5 < 5) {
          setDisabledSebelumnya(false);
          setDariAkhir(5)
        } else {
          setDariAkhir((prev) => prev - 5)
        }
      }, 1200);
      
      fetchPreviousData();
  };
  
  useEffect(() => {
    // Call fetchNextData initially to load the first set of data
    // fetchNextData();
  }, []);

  useEffect(() => {
    // Call fetchNextData initially to load the first set of data
    fetchPreviousData();
  }, []);

      
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

            <div className="flex justify-between -mt-2">
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
                      className="block w-full p-3 pl-10 text-sm border-gray-300/75 rounded-md focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Cari... (ex:label, email)"
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
                       
                        
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 -mt-2">
        
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
                  <tr key={project.idProject} className={`${project.userData.emailUser !== email && role === "user" ? "hidden" : 'visible'}  ${project.userData.emailUser === email && role === "admin" ? "bg-indigo-100 hover:bg-indigo-50" : "hover:bg-gray-100"}`}>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-5">
                          <div className="text-sm font-medium text-gray-900">{index+ 1 + addFive}</div>
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
                          <div className="text-sm font-medium text-gray-900 inline-flex">{project.userData.usernameUser}
                          {project.userData.roleUser === "admin" && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mt-0.5 ml-0.5 text-blue-600">
                              <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                            </svg>
                          )}
                          </div>
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
                      {loadBait.map((p) => (
                      <tr key={p.id} className={`${totalProjectsLoading === 0 ? "hidden" : ""} bg-white`}>
                        <td className="px-2 py-4 whitespace-nowrap animate-pulse ">
                          <div className="flex items-center">
                            <div className="ml-5">
                              <div className="text-sm font-medium text-gray-900">
                              <div className="h-2 bg-gray-200 rounded-full w-8"></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap animate-pulse ">
                          <div className="flex items-center">
                            <div className="ml-4">
                            <div className="h-2.5 bg-gray-200 rounded-full w-48"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap animate-pulse ">
                        <div className="flex items-center mt-4 animate-pulse ">
                          <svg className="w-8 h-8 me-3 text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                            </svg>
                            <div>
                                <div className="h-2 bg-gray-200 rounded-full w-32 mb-2"></div>
                                <div className="w-48 h-1.5 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap animate-pulse ">
                        <div className="h-2.5 bg-gray-200 rounded-full w-48"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium animate-pulse ">
                        <div className="h-2 bg-gray-200 rounded-full w-10"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  )}
                  {totalProjectsLoading === 0  && (
                    <tbody>
                      <tr className="animate-pulse">
                        <td className="px-2 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-5">
                              <div className="text-sm font-medium text-gray-900">Belum ada projek
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                            <div className="h-2.5 bg-gray-200 rounded-full w-48"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div>
                            <div className="h-2.5 bg-gray-200 rounded-full w-48"></div>

                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                         <div className="h-2.5 bg-gray-200 rounded-full w-48"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        </td>
                      </tr>
                  </tbody>
                  )}
                </>
              )}
              
            </table>
                        


          </div>


        </div>
      </div>
    </div>

            <div className={`flex flex-col items-center float-right mt-2 p-2 ${disabledPagination ? "hidden" : ""}`}>
              <span className="text-sm text-gray-700 ">
                  Menampilkan data ke
                  <span className="font-semibold text-gray-900 ml-1">{dariAwal}</span> dari total,
                  <span className="font-semibold text-gray-900 ml-1">{totalProjects ? totalProjects : '...'}</span> data
              </span>
              
              <div className="flex mt-2">
                {disabledSebelumnya ? (
                  <button
                  onClick={handleSebelumnya}
                  className="flex items-center justify-center px-3 h-8 me-3 text-sm font-medium text-gray-100 bg-gray-700 border border-gray-300 rounded-lg hover:bg-gray-800 hover:text-gray-100 ">
                    <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                    </svg>
                    Sebelumnya
                  </button>
                ) : (
                  <button
                  disabled
                  onClick={handleSebelumnya}
                  className="flex items-center justify-center px-3 h-8 me-3 text-sm font-medium text-gray-100 bg-gray-400 border border-gray-300 rounded-lg ">
                    <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                    </svg>
                    Sebelumnya
                  </button>
                )}
                {disabledSelanjutnya ? (
                  <button 
                  onClick={handleSelanjutnya}
                  className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-100 bg-gray-700 border border-gray-300 rounded-lg hover:bg-gray-800 hover:text-white">
                    Selanjutnya
                    <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                  </button>
                ) : (
                  <button 
                  disabled
                  onClick={handleSelanjutnya}
                  className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-100 bg-gray-400 border border-gray-300 rounded-lg">
                    Selanjutnya
                    <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                  </button>
                )}
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
                    <div className="ps-4 text-sm text-gray-700">Copied to clipboard</div>
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