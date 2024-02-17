import React, { useEffect, useState } from 'react'
import Navbar from '../../../../components/Navbar/Navbar'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { auth, db } from '../../../../config/firebase/firebase'
import Bottom from '../../../../components/BottomBar/Bottom'
import { Link } from 'react-router-dom'

const loadDataBait = [
    {id: "bait"},
    {id: "bait"},
    {id: "bait"},
    {id: "bait"},
    {id: "bait"},
    {id: "bait"},
]

// Item Project

const Personal = () => {

  // Get User Current
  const [ getCurrentId, setCurrentId ] = useState('');
  const [ getCurrentEmail, setCurrentEmail ] = useState('');

  // Check Gabung
  const [checkGabung, setCheckGabung] = useState([]);


  
  const [ data, setData ] = useState([]);
  const [ imageLoaded, setImageLoaded ] = useState(false);
  
  const [ totalProjects, setTotalProjects ] = useState(0)
  
  useEffect(() => {
    localStorage.setItem('navbarClicked', "manajemenPersonalClicked");
    const fetchData = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const usersCollection = collection(db, "users");
        const usersProjectsCollection = collection(db, "usersProjects");
        const userProjectsArray = [];

        try {
            const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
            const getId = querySnapshot.docs[0].data().idUser;
            const getEmail = querySnapshot.docs[0].data().emailUser;
            setCurrentId(getId);
            setCurrentEmail(getEmail);

            const querySnapshotProjects = await getDocs(query(usersProjectsCollection, where("idUser", "==", user.uid)));
            const userProjects = querySnapshotProjects.docs.map(doc => doc.data().idProject);

            userProjects.forEach(getUsersProjectId => {
                userProjectsArray.push(getUsersProjectId);
            });

            setCheckGabung(userProjectsArray);
            

        } catch (error) {
            console.log("Error: " + error);
        }
    };

    fetchData();
}, []); 

useEffect(() => {
    console.log("checkGabung has changed:", checkGabung);
}, [checkGabung]);

// Cek Matkul (Gabung Biasa)
const [ fetchedProjects, setFetchedProjects ] = useState([]);
try {
    useEffect(() => {
        const fetchData = async () => {
            const usersListCollection = collection(db, "usersProjects");
    
            try {
                const userListQuery = query(usersListCollection, where("idUser", "==", getCurrentId));
                const querySnapshot = await getDocs(userListQuery);

                if (querySnapshot.docs.length > 0) {
                    const fetchedListProject = querySnapshot.docs.map(doc => ({
                        idProject: doc.data().idProject,
                    }));
                    // console.log("Projek by User: " + fetchedListProject.map(project => project.idProject))
                            
                    const usersCollection = collection(db, "projects");
    
                    if (fetchedListProject.length > 0) {
                        const usersQuery = query(usersCollection, where("idProject", "in", fetchedListProject.map(project => project.idProject)));
                        const usersSnapshot = await getDocs(usersQuery);

                        const fetchedData = [];
    
                            for (const doc of usersSnapshot.docs) {
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
                        setFetchedProjects(fetchedData);

                    } else {
                        console.log("dataProjectList is empty.");
                    }
                } else {
                    console.log("No documents found for the given query.");
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };
    
        // Invoke the fetch function
        fetchData();
        console.log("Test leak data getCurrentId")
        }, [getCurrentId]);
} catch (error) {
    console.log(error)
}

useEffect(() => {
  const fetchData = async () => {
    const projectsCollection = collection(db, "projects");

    // Only Total
    const queryTotal = query(projectsCollection);
    const snapshotTotal = await getDocs(queryTotal);
    setTotalProjects(snapshotTotal.size);
    console.log("Total: " + totalProjects);
    
      console.log("Tidak melalui search")
      const queryStatusProjects = query(projectsCollection,
        where("picProject", "==", getCurrentEmail),
        orderBy("createdAt", "desc"),
        );
     
      try {
        const snapshot = await getDocs(queryStatusProjects);
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

        setTimeout(() => {
          setImageLoaded(true)
        }, 1400);
        setData(fetchedData);

      } catch (error) {
        console.log("Error fetching data: ", error);
      }

    
  };
    console.log("Leak dataa")
    fetchData();
  }, [totalProjects, getCurrentEmail]);

  // Check Penanggung Jawab
  const [ checkPenanggungJawab, setCheckPenanggungJawab ] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const projectsCollection = collection(db, "projects");

        try {
          // projects table
          const querySnapshotProjects = await getDocs(query(projectsCollection, where("picProject", "==", getCurrentEmail)));
          if (querySnapshotProjects.size > 0) {
            setCheckPenanggungJawab(true)
          }

        } catch (error) {
          console.log("err projects:" + error)
        }
      };
      
      console.log("Test Leak Data checkPJ")
      fetchData();
    }, [getCurrentEmail]);


  return (
    <div className="min-h-full">
      <Navbar />
      <header className="bg-white drop-shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mata Kuliahku</h1>
        </div>
      </header>

      {/* Start - Content */}

      <main>
        <div className="mx-auto max-w-7xl">

            <div className="bg-gray-50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

              <div className="mt-5 lg:mx-0">
                  {/* Header */}

                  {/* End Header */}
              </div>


            {/* PIC Matkul */}
            {checkPenanggungJawab && (
            <div className="bg-white shadow-md rounded-lg">
            <>
                <div className="inline-flex bg-gray-200 w-full rounded-t-md py-2">
                    <div className="bg-gray-200 text-gray-800 items-center ml-2 px-2.5 py-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-600">
                            <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                        </svg>
                    </div>
                    <div className="text-md md:text-xl font-medium ml-2 text-gray-700">PIC Mata Kuliah</div>
                </div>
           

                <section className="text-gray-600 p-4 -mt-2 body-font mb-4">
                <div className="container py-6">
                    {totalProjects && data && imageLoaded ? (
                        <>
                        <div className="flex flex-wrap -m-4">
                        {data.map((project) => 
                            <div key={project.id} className="p-4 md:w-1/3 scale-100 transition-all duration-400 hover:scale-105 w-screen">
                            <div className="h-full rounded-xl shadow-cla-blue bg-gradient-to-tr from-gray-50 to-indigo-50 overflow-hidden hover:shadow-md border-2 border-gray-600/20">
                                {/* <a href="/toProject"> */}
                                <img className="lg:h-44 md:h-32 w-screen object-cover md:object-scale scale-110 transition-all duration-400 hover:opacity-90" src={project.imageUrlProject} alt="blog" />
                                {/* </a> */}
                                <div className="p-6">
                                <div className="flex justify-between">        
                                    {/* <a href=""> */}
                                    <h1 className="title-font text-lg font-medium text-gray-600 mb-3 scale-100">
                                        {project.nameProject} {project.nameProject.includes("-") ? '' : `- ${project.labelProject}`}
                                    </h1>
                                    {/* </a> */}
                                </div>
                                <div className="flex float-right">
                                    <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 m-1 ">{project.createdAt}</h2>
                                </div>
                                {/* <p className="leading-relaxed mb-3 text-gray-500 ">{project.descriptionProject !== "" ? project.descriptionProject : "Belum ada berita..."}</p> */}
                                <p className="leading-relaxed mb-3 text-gray-400 ">dibuat pada tanggal</p>
                                    <div className="relative mt-3 flex items-center bottom-0 gap-x-4">
                                    <img src={project.userData.imageUser} alt="" className="h-10 w-10 rounded-full bg-gray-50" />
                                    <div className="text-sm leading-6">
                                        <p className="font-semibold text-gray-900 inline-flex">
                                        {/* <a href="/user-profile-projek"> */}
                                            <span className="absolute inset-0" />
                                            {project.userData.usernameUser}
                                            {project.userData.roleUser === "admin" && (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-0.5 ml-0.5 text-blue-600">
                                                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        {/* </a> */}
                                        </p>
                                        <p className="text-gray-600">{project.userData.positionUser === "Belum ada jabatan" ? "Mahasiswa" : project.userData.positionUser}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <Link
                                          to="/personal/projekku" state={{projectData: project, clicked: "true"}}
                                          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white transition-all duration-150 hover:scale-110 drop-shadow-md  shadow-cla-blue px-4 py-1 rounded-lg">
                                          Buka
                                        </Link>
                                    </div>
                                </div>
                                </div>
                            </div>
                            </div>
                        )}
                        
                        </div>
                        </>
                    ) : (
                        <>
                        <div className="flex flex-wrap -m-2">
                        {loadDataBait.map(() => 
                            <div className="p-4 md:w-1/3 scale-105">
                            <div className="h-full rounded-xl shadow-cla-blue bg-gradient-to-tr from-gray-50 to-indigo-50 overflow-hidden">
                                {/* <a href="/toProject"> */}
                                <div className="flex items-center justify-center h-48 bg-gray-300 rounded animate-pulse">
                                    <svg className="w-10 h-10 text-gray-200 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                                        <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/>
                                        <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/>
                                    </svg>
                                </div>
                                {/* </a> */}
                                <div className="p-3">
                                <div className="flex justify-between">        
                                    {/* <a href=""> */}
                                    <h1 className="title-font text-lg font-medium text-gray-600 scale-100">
                                    </h1>
                                    {/* </a> */}
                                </div>
                                <div className="flex float-right">
                                </div>
                                <div className="h-2.5 bg-gray-200 rounded-full  w-48 mb-4 "></div>
                                    <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
                                    <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
                                    <div className="relative flex items-center bottom-0 gap-x-4 animate-pulse">
                                        <svg className="w-10 h-10 me-3 text-gray-200 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                                        </svg>
                                    <div className="text-sm leading-6">
                                    <div className="flex items-center mt-4">
                                        
                                        <div>
                                            <div className="h-2.5 bg-gray-200 rounded-full  w-32 mb-2"></div>
                                            <div className="w-48 h-2 bg-gray-200 rounded-full"></div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            </div>
                        )}
                        </div>
                        </>
                    )}
                </div>
                </section>
            </>
            </div>
            )}


            {/* Matkul Ku */}
            <div className="bg-white shadow-md rounded-lg mt-8">
            <div className="inline-flex bg-gray-200 w-full rounded-t-md py-2">
                <div className="bg-gray-200 text-gray-800  items-center px-2.5 py-0.5 ml-2 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                        <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                        <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
                    </svg>
                </div>
                <div className="text-md md:text-xl font-medium ml-2 text-gray-700">Mata Kuliahku</div>
            </div>
            <section className="text-gray-600 body-font p-4 -mt-2">
              <div className="container py-6">
                  {totalProjects && data && imageLoaded ? (
                    <>
                    <div className="flex flex-wrap -m-4">
                      {fetchedProjects.map((project) => 
                        <div key={project.id} className="p-4 md:w-1/3 scale-100 transition-all duration-400 hover:scale-105 w-screen">
                          <div className="h-full rounded-xl shadow-cla-blue bg-gradient-to-tr from-gray-50 to-indigo-50 overflow-hidden hover:shadow-md border-2 border-gray-600/20">
                            {/* <a href="/toProject"> */}
                              <img className="lg:h-44 md:h-32 w-screen object-cover md:object-scale scale-110 transition-all duration-400 hover:opacity-90" src={project.imageUrlProject} alt="blog" />
                            {/* </a> */}
                            <div className="p-6">
                              <div className="flex justify-between">        
                                {/* <a href=""> */}
                                  <h1 className="title-font text-lg font-medium text-gray-600 mb-3 scale-100">
                                    {project.nameProject} {project.nameProject.includes("-") ? '' : `- ${project.labelProject}`}
                                  </h1>
                                {/* </a> */}
                              </div>
                              <div className="flex float-right">
                                <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 m-1 ">{project.createdAt}</h2>
                              </div>
                              {/* <p className="leading-relaxed mb-3 text-gray-500 ">{project.descriptionProject !== "" ? project.descriptionProject : "Belum ada berita..."}</p> */}
                              <p className="leading-relaxed mb-3 text-gray-500 ">dibuat pada tanggal</p>
                                <div className="relative mt-3 flex items-center bottom-0 gap-x-4">
                                  <img src={project.userData.imageUser} alt="" className="h-10 w-10 rounded-full bg-gray-50" />
                                  <div className="text-sm leading-6">
                                    <p className="font-semibold text-gray-900 inline-flex">
                                      {/* <a href="/user-profile-projek"> */}
                                        <span className="absolute inset-0" />
                                        {project.userData.usernameUser}
                                        {project.userData.roleUser === "admin" && (
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mt-0.5 ml-0.5 text-blue-600">
                                            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      {/* </a> */}
                                    </p>
                                    <p className="text-gray-600">{project.userData.positionUser === "Belum ada jabatan" ? "Mahasiswa" : project.userData.positionUser}</p>
                                  </div>
                                  <div className="ml-auto">
                                     <Link
                                        to="/personal/projekku" state={{projectData: project, clicked: "true"}}
                                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white transition-all duration-150 hover:scale-110 drop-shadow-md  shadow-cla-blue px-4 py-1 rounded-lg">
                                        Buka
                                     </Link>
                                  </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                    </div>
                    </>
                  ) : (
                    <>
                       <div className="flex flex-wrap -m-2">
                      {loadDataBait.map(() => 
                        <div className="p-4 md:w-1/3 scale-105">
                          <div className="h-full rounded-xl shadow-cla-blue bg-gradient-to-tr from-gray-50 to-indigo-50 overflow-hidden">
                            {/* <a href="/toProject"> */}
                            <div className="flex items-center justify-center h-48 bg-gray-300 rounded animate-pulse">
                                <svg className="w-10 h-10 text-gray-200 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                                    <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/>
                                    <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/>
                                </svg>
                            </div>
                            {/* </a> */}
                            <div className="p-3">
                              <div className="flex justify-between">        
                                {/* <a href=""> */}
                                  <h1 className="title-font text-lg font-medium text-gray-600 scale-100">
                                  </h1>
                                {/* </a> */}
                              </div>
                              <div className="flex float-right">
                              </div>
                              <div className="h-2.5 bg-gray-200 rounded-full  w-48 mb-4 "></div>
                                <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
                                <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
                                <div className="relative flex items-center bottom-0 gap-x-4 animate-pulse">
                                    <svg className="w-10 h-10 me-3 text-gray-200 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                                    </svg>
                                  <div className="text-sm leading-6">
                                  <div className="flex items-center mt-4">
                                    
                                      <div>
                                          <div className="h-2.5 bg-gray-200 rounded-full  w-32 mb-2"></div>
                                          <div className="w-48 h-2 bg-gray-200 rounded-full"></div>
                                      </div>
                                  </div>
                                  </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      </div>
                    </>
                  )}
                {fetchedProjects.length < 1 && imageLoaded && (
                    <div className="flex-shrink-0 mt-6 ml-1.5 -mb-4">
                        <a href='/projek' className={`font-medium text-indigo-500 hover:text-indigo-400`}>
                            Daftar Mata Kuliah Baru
                        </a>
                    </div>
                )}
              </div>
            </section>
            </div>

          </div>
        </div>

        </div>
      </main>
      {/* End - Content */}
      
      <Bottom />
    </div>

  )
}

export default Personal