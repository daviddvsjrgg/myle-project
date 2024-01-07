import React, { Fragment, useEffect, useRef, useState } from 'react'
import Navbar from '../../../../components/Navbar/Navbar'
import Bottom from '../../../../components/BottomBar/Bottom'
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '../../../../config/firebase/firebase'
import { Dialog, Transition } from '@headlessui/react'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { onAuthStateChanged } from 'firebase/auth'
import { v4 as uuidv4 } from 'uuid';

const Projek = () => {

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

  // Get User Current ID
  const [ getCurrentId, setCurrentId ] = useState('');
  const [ getCurrentEmail, setCurrentEmail ] = useState('');

  // Check Gabung
  const [ checkGabung, setCheckGabung ] = useState([]);

  useEffect(()=>{

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const usersCollection = collection(db, "users");
        const usersProjectsCollection = collection(db, "usersProjects");

        const userProjectsArray = [];

        try {
          // users table
            const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
            const getId = querySnapshot.docs[0].data().idUser;
            const getEmail = querySnapshot.docs[0].data().emailUser;
            setCurrentId(getId);
            setCurrentEmail(getEmail);

          // usersProjects table
            const querySnapshotProjects = await getDocs(query(usersProjectsCollection, where("idUser", "==", user.uid)));
            const userProjects = querySnapshotProjects.docs.map(doc => doc.data().idProject);
            userProjects.forEach(getUsersProjectId => {
              console.log(getUsersProjectId);
               userProjectsArray.push(getUsersProjectId);
            });
            setCheckGabung(userProjectsArray);

        } catch (error) {
            console.log("Error: " + error)
        }
        // ...
    
    });
    return () => {
    unsubscribe();
    }
}, [])

  const [ data, setData ] = useState([]);

  const fetchData = async () => {
    const projectsCollection = collection(db, "projects");
  
    try {
      const snapshot = await getDocs(projectsCollection);
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
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  // Modal Terdaftar
  const [openTerdaftar, setOpenTerdaftar] = useState(false)
  const cancelButtonRefTerdaftar = useRef(null)

  // Modal Gabung
  const [open, setOpen] = useState(false)
  const cancelButtonRef = useRef(null)

  const [ getIdProject, setIdProject] = useState('');

  const handleClickGabung = () => {
    // setIdProject(idProject);
    setOpen(true);
  }

  // Tombol Gabung to Terdaftar
  const [ successGabung, setSuccessGabung ] = useState(false);
  const [ disableGabung, setDisableGabung ] = useState(false);

  const handleYakin = async () => {
    setDisableGabung(true);
    setSuccessGabung(true);
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
            window.location.reload();
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

  

  return (
    <div className="min-h-full">
      <Navbar />
      <header className="bg-white drop-shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mata Kuliah</h1>
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

            <div className="bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:mx-0">

                  {/* Header */}

                  {/* End Header */}

              </div>


            <section className="text-gray-600 body-font ">
              <div className="container py-8">
                <div className="flex flex-wrap -m-4">
                  {data.map((project) => 
                    <div key={project.id} className="p-4 md:w-1/3 scale-100 transition-all duration-400 hover:scale-105">
                      <div className="h-full rounded-xl shadow-cla-blue bg-gradient-to-tr from-gray-50 to-indigo-50 overflow-hidden hover:shadow-md">
                        {/* <a href="/toProject"> */}
                          <img className="lg:h-44 md:h-32 w-screen object-center scale-110 transition-all duration-400 hover:opacity-90" src={project.imageUrlProject} alt="blog" />
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
                          <p className="leading-relaxed mb-3 text-gray-500">{project.descriptionProject !== "" ? project.descriptionProject : "Belum ada berita..."}</p>
                            <div className="relative mt-3 flex items-center bottom-0 gap-x-4">
                              <img src={project.userData.imageUser} alt="" className="h-10 w-10 rounded-full bg-gray-50" />
                              <div className="text-sm leading-6">
                                <p className="font-semibold text-gray-900">
                                  {/* <a href="/user-profile-projek"> */}
                                    <span className="absolute inset-0" />
                                    {project.userData.usernameUser}
                                  {/* </a> */}
                                </p>
                                <p className="text-gray-600">{project.userData.positionUser !== "" ? project.userData.positionUser : "Belum ada Jabatan"}</p>
                              </div>
                              {checkGabung.includes(project.idProject) || (successGabung && getIdProject === project.idProject) || project.userData.emailUser === getCurrentEmail ? (
                                <div className="ml-auto">
                                  <button
                                  disabled
                                  className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-400 drop-shadow-md  shadow-cla-blue px-4 py-1 rounded-lg">Terdaftar</button>
                                </div>
                              ) : ( disableGabung ? (
                                <div className="ml-auto">
                                  <button
                                  disabled
                                  className="bg-gradient-to-r from-indigo-200 to-indigo-200 text-white transition-all duration-150 hover:scale-105 drop-shadow-md  shadow-cla-blue px-4 py-1 rounded-lg">Gabung</button>
                               </div>
                              ) : (
                                <div className="ml-auto">
                                  <button
                                  onClick={ () => {
                                      setIdProject(project.idProject);
                                      handleClickGabung();
                                    } 
                                  }
                                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white transition-all duration-150 hover:scale-105 drop-shadow-md  shadow-cla-blue px-4 py-1 rounded-lg">Gabung</button>
                              </div>
                              )
                                
                              )}
                             
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* <div className="p-4 md:w-1/3">
                      <div className="h-full rounded-xl shadow-cla-violate bg-gradient-to-r from-pink-50 to-red-50 overflow-hidden">
                        <img className="lg:h-48 md:h-36 w-full object-cover object-center scale-110 transition-all duration-400 hover:scale-100" src="https://images.unsplash.com/photo-1624628639856-100bf817fd35?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8M2QlMjBpbWFnZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60" alt="blog" />
                        <div className="p-6">
                          <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">CATEGORY-1</h2>
                          <h1 className="title-font text-lg font-medium text-gray-600 mb-3">The Catalyzer</h1>
                          <p className="leading-relaxed mb-3">Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.</p>
                          <div className="flex items-center flex-wrap ">
                            <button className="bg-gradient-to-r from-orange-300 to-amber-400 hover:scale-105 drop-shadow-md shadow-cla-violate px-4 py-1 rounded-lg">Learn more</button>
                          
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 md:w-1/3">
                      <div className="h-full rounded-xl shadow-cla-pink bg-gradient-to-r from-fuchsia-50 to-pink-50 overflow-hidden">
                        <img className="lg:h-48 md:h-36 w-full object-cover object-center scale-110 transition-all duration-400 hover:scale-100" src="https://images.unsplash.com/photo-1631700611307-37dbcb89ef7e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1yZWxhdGVkfDIwfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=600&q=60" alt="blog" />
                        <div className="p-6">
                          <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">CATEGORY-1</h2>
                          <h1 className="title-font text-lg font-medium text-gray-600 mb-3">The Catalyzer</h1>
                          <p className="leading-relaxed mb-3">Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.</p>
                          <div className="flex items-center flex-wrap ">
                            <button className="bg-gradient-to-r from-fuchsia-300 to-pink-400 hover:scale-105  shadow-cla-blue px-4 py-1 rounded-lg">Learn more</button>
                          
                          </div>
                        </div>
                      </div>
                    </div> */}
                </div>
              </div>
            </section>

            {/* <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
              {data.map((project) => (
              <>
              <a href='/toProject' className="group block rounded-lg p-6 bg-white ring-1 ring-slate-900/5 drop-shadow-lg space-y-3 hover:bg-gray-100 hover:ring-gray-200">
              <div className="flex items-center space-x-3">
                <article key={project.id} className="flex max-w-xl flex-col items-start justify-between">
                  <div className="flex items-center gap-x-4 text-xs">
                    <time dateTime={project.datetime} className="text-gray-500">
                      {project.createdAt}
                    </time>
                    <div
                      className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600">
                      {project.labelProject}
                    </div>
                  </div>
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900">
                        <span className="absolute inset-0" />
                        {project.nameProject}
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{project.descriptionProject !== "" ? project.descriptionProject : "Projek ini belum ada deskripsi..."}</p>
                  </div>
                  <div className="relative mt-8 flex items-center gap-x-4">
                    <img src={project.userData.imageUser} alt="" className="h-10 w-10 rounded-full bg-gray-50" />
                    <div className="text-sm leading-6">
                      <p className="font-semibold text-gray-900">
                        <a href="/user-profile">
                          <span className="absolute inset-0" />
                          {project.userData.usernameUser}
                        </a>
                      </p>
                      <p className="text-gray-600">{project.userData.positionUser !== "" ? project.userData.positionUser : "Belum ada Jabatan"}</p>
                    </div>
                  </div>
                </article>
             </div>
             </a>
             </>
              ))}
            </div> */}

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