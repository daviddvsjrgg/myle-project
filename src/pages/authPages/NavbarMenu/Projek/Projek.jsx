import React, { Fragment, useEffect, useRef, useState } from 'react'
import Navbar from '../../../../components/Navbar/Navbar'
import { addDoc, collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { auth, db } from '../../../../config/firebase/firebase'
import { Dialog, Transition } from '@headlessui/react'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { v4 as uuidv4 } from 'uuid';
import LoadingSpinnerMid from '../../../../components/Loading/LoadingSpinnerMid/LoadingSpinnerMid'
import Bottom from '../../../../components/BottomBar/Bottom'

const loadDataBait = [
    {id: "bait"},
    {id: "bait"},
    {id: "bait"},
    {id: "bait"},
    {id: "bait"},
    {id: "bait"},
]

// Item Project
const showItem = 6;

// Debounce function definition
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const Projek = () => {

  // Search
  const [search, setSearch] = useState('')
  
  useEffect(() => {
    console.log(search)
  }, [search])

  // Countdown
  const [count, setCount] = useState(null);

  useEffect(() => {
      const countdownInterval = setInterval(() => {
      if (count > 0) {
          setCount(prevCount => prevCount - 1);
      } else {
          clearInterval(countdownInterval);
          // Add any additional actions you want to perform after the countdown
      }
      }, 1000);

      // Cleanup the interval when the component unmounts
      return () => clearInterval(countdownInterval);
  }, [count]);

  // Get User Current
  const [ getCurrentId, setCurrentId ] = useState('');
  const [ getCurrentEmail, setCurrentEmail ] = useState('');

  // Check Gabung
  const [checkGabung, setCheckGabung] = useState([]);
  const [checkGabungChanged, setCheckGabungChanged] = useState(false);


  
  const [ data, setData ] = useState([]);
  const [ loadSpinner, setLoadSpinner ] = useState(false)
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ imageLoaded, setImageLoaded ] = useState(false);
  
  const [ totalProjects, setTotalProjects ] = useState(0)
  
  useEffect(() => {
    const fetchData = async () => {
      localStorage.setItem('navbarClicked', "manajemenMatkulClicked");
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
}, [checkGabungChanged]); // Only trigger the effect when checkGabungChanged changes

useEffect(() => {
    // This block will run whenever checkGabung changes
    console.log("checkGabung has changed:", checkGabung);
}, [checkGabung]);

useEffect(() => {
  const fetchData = async () => {
    const projectsCollection = collection(db, "projects");

    // Only Total
    const queryTotal = query(projectsCollection);
    const snapshotTotal = await getDocs(queryTotal);
    setTotalProjects(snapshotTotal.size);
    console.log("Total: " + totalProjects);
    
    console.log("search: " + search)
    if (search) {
      setCurrentPage(1)

      console.log("search dijalankan")
      setTimeout(() => {
        setLoadSpinner(false)
      }, 1000);

      const capitalFirstWord = search.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      const searchVariations = [`${search.toUpperCase()}`, `${search.toLowerCase()}`, `${capitalFirstWord}`, `${search}`]
      
      const searchLabel = query(projectsCollection,
        where("labelProject", "in", searchVariations),
        where("statusProject", "==", "Public"),
      );

     const searchName = query(projectsCollection,
        where("nameProject", "in", searchVariations),
        where("statusProject", "==", "Public"),
      );

      const searchId = query(projectsCollection,
        where("idProject", "in", searchVariations),
      );
         
      try {

        const [snapshotLabel, snapshotName, snapshotId] = await Promise.all([
          getDocs(searchLabel),
          getDocs(searchName),
          getDocs(searchId)
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
        for (const doc of snapshotId.docs) {
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
      // third query
        for (const doc of snapshotName.docs) {
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
          setImageLoaded(true);
        }, 1400);
        setData(fetchedData);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
    } else if (!search) {
      console.log("Tidak melalui search")
      console.log(currentPage);
      const queryStatusProjects = query(projectsCollection,
        where("statusProject", "==", "Public"),
        orderBy("createdAt", "desc"),
         limit(currentPage * showItem));
     
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
    }

    
  };
  
    fetchData();
  }, [search, currentPage, totalProjects]);

  // Modal Terdaftar
  const [openTerdaftar, setOpenTerdaftar] = useState(false)
  const cancelButtonRefTerdaftar = useRef(null)

  // Modal Gabung
  const [open, setOpen] = useState(false)
  const cancelButtonRef = useRef(null)

  const [ getIdProject, setIdProject] = useState('');

  const handleClickGabung = () => {
    setOpen(true);
  }

  // Tombol Gabung to Terdaftar
  const [ disableGabung ] = useState(false);

  const handleYakin = async () => {
    setCheckGabungChanged(true);
    setTimeout(() => {
      setCheckGabungChanged(false);
    }, 500);
    setOpen(false);
    
    const usersCollection = collection(db, "usersProjects");
    
    const querySnapshot = await getDocs(query(usersCollection, where("idUsersProjects", "==", getCurrentId)));
    
    if (querySnapshot.size === 0) {
      // No existing document found, add a new one
      try {
        const docRef = await addDoc(usersCollection, {
          idUserProject: `users-${uuidv4()}-projects`,
          idUser: getCurrentId,
          idProject: getIdProject,
        });
        setCount(3);
        setOpenTerdaftar(true);
        
        setTimeout(() => {
            setOpenTerdaftar(false);
        }, 3500);

        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      // Document with the same idUsers already exists, handle accordingly
      console.log("Document with the same idUsers already exists");
      // You may choose to update the existing document here
    }
    
  }

  // Scroll
  useEffect(() => {
  const handleScroll = debounce(() => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;
    
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      // User has scrolled to the bottom      
      const itemProjects = currentPage * showItem;
      console.log("item: "+ itemProjects);
      if (totalProjects < itemProjects) {
        setLoadSpinner(false);
      } else {
        setLoadSpinner(true);
        setCurrentPage((prevPage) => prevPage + 1);
      }
        
    }
  }, 200);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadSpinner, currentPage, totalProjects]);


  return (
    <div className="min-h-full">
      <Navbar />
      <header className="bg-white drop-shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Cari Mata Kuliah</h1>
        </div>
      </header>

      {/* Start - Content */}

      

      {/* Modal Terdaftar */}
      <Transition.Root show={openTerdaftar} as={Fragment}>
            <Dialog as="div" className="relative" initialFocus={cancelButtonRefTerdaftar} onClose={setOpenTerdaftar}>
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-40 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div
                        className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-200 sm:mx-0 sm:h-10 sm:w-10 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                        </svg>
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                            Kamu terdaftar!
                            </Dialog.Title>
                            <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Kamu berhasil terdaftar, kamu akan otomatis kembali dalam waktu {count} detik.
                            </p>
                            </div>
                        </div>
                        </div>
                    </div>
                    </Dialog.Panel>
                </Transition.Child>
                </div>
            </div>
            </Dialog>
        </Transition.Root>

      {/* Modal Gabung */}
      <Transition.Root show={open} as={Fragment}>
          <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                          <QuestionMarkCircleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                            Yakin untuk bergabung?
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Apakah kamu yakin untuk bergabung di mata kuliah ini, proses ini tidak bisa dibatalkan dan kamu akan terdaftar di kelas ini.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                        onClick={() => {
                          handleYakin();
                          }
                        }
                      >
                        Yakin
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setOpen(false)}
                        ref={cancelButtonRef}
                      >
                        Batalkan
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      <main>
        <div className="mx-auto max-w-7xl">

            <div className="bg-gray-50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

              <div className="mt-5 lg:mx-0">
                  {/* Header */}

                    {/* Search */}

                          <label className="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
                          <div className="relative">
                              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                  <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                  </svg>
                              </div>
                              <input
                              type="search"
                              id="default-search"
                              onChange={(e) => setSearch(e.target.value)}
                              autoComplete='off'
                              placeholder="Cari projek (contoh:projek-xxxx-xx)"
                              className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300/75 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500  "
                              />
                              {/* <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-indigo-700 hover:bg-indigo-600 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-2 ">Search</button> */}
                          </div>

                    {/* End Search */}

                  {/* End Header */}
              </div>


            <section className="text-gray-600 body-font ">
              <div className="container py-8">
                  {totalProjects && data && imageLoaded ? (
                    <>
                    <div className="flex flex-wrap -m-4">
                      {data.map((project) => 
                        <div key={project.id} className="p-4 md:w-1/3 scale-100 transition-all duration-400 hover:scale-105">
                          <div className="h-full rounded-xl shadow-cla-blue bg-gradient-to-tr from-gray-50 to-indigo-50 overflow-hidden duration-300 hover:shadow-xl shadow-md">
                            {/* <a href="/toProject"> */}
                              <img className="lg:h-64 md:h-32 w-screen object-cover md:object-scale scale-110 transition-all duration-400 hover:opacity-90" src={project.imageUrlProject} alt="blog" />
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
                              <p className="leading-relaxed mb-3 text-gray-500 ">{project.descriptionProject !== "" ? project.descriptionProject : "Belum ada berita..."}</p>
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
                                  {checkGabung.includes(project.idProject) || project.userData.emailUser === getCurrentEmail ? (
                                    <div className="ml-auto">
                                      <button
                                      disabled
                                      className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-500 drop-shadow-md  shadow-cla-blue px-4 py-1 rounded-lg">Terdaftar</button>
                                    </div>
                                  ) : ( !disableGabung && (
                                    <div className="ml-auto">
                                    <button
                                    onClick={ () => {
                                        setIdProject(project.idProject);
                                        handleClickGabung();
                                      } 
                                    }
                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white transition-all duration-150 hover:scale-110 drop-shadow-md  shadow-cla-blue px-4 py-1 rounded-lg">Gabung</button>
                                  </div>
                                  ) 
                                  )}
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
                            <div className="p-6">
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
            {loadSpinner && (
              <>
                <LoadingSpinnerMid/>
              </>
            )}
          </div>
        </div>

        </div>
      </main>
      {/* End - Content */}
      
      <Bottom />
    </div>

  )
}

export default Projek