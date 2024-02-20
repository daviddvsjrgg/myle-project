import Navbar from '../../../../components/Navbar/Navbar';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from '../../../../config/firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { BookOpenIcon } from '@heroicons/react/20/solid';
import { Link } from 'react-router-dom';
import Bottom from '../../../../components/BottomBar/Bottom';

const loadBait = [
  {id: 1},
  {id: 2},
  {id: 3},
  {id: 4},
  {id: 5},
]

const Dashboard = () => {
  const [ username, setUsername ] = useState('');
  const [ role, setRole ] = useState('');
  const [ email, setEmail ] = useState('')
  // const [ jumlahUser,  setJumlahUser ] = useState('')
  // const [ jumlahProjects,  setJumlahProject ] = useState('')
  // const [ jumlahDaftar,  setJumlahDaftar ] = useState('')

  // Set ID also use it as loading trigger
  const [ loadingSimpan, setLoadingSimpan ] = useState('');

  useEffect(()=>{

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
            const usersCollection = collection(db, "users");
            // const projectsCollection = collection(db, "projects");
            // const usersProjectsCollection = collection(db, "usersProjects");
          
            try {
              const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
              // const querySnapshotAllUsers = await getDocs(query(usersCollection));
              // const querySnapshotAllProjects = await getDocs(query(projectsCollection));
              // const querySnapshotAllUsersProjects = await getDocs(query(usersProjectsCollection));

              // setJumlahUser(querySnapshotAllUsers.size.toString());
              // setJumlahProject(querySnapshotAllProjects.size.toString());
              // setJumlahDaftar(querySnapshotAllUsersProjects.size.toString());

              // Field from firestore
              const getId = querySnapshot.docs[0].data().idUser;
              const getUsername = querySnapshot.docs[0].data().usernameUser;
              const getRole = querySnapshot.docs[0].data().roleUser;
              const getEmail = querySnapshot.docs[0].data().emailUser;
              setUsername(getUsername);
              setRole(getRole);
              setEmail(getEmail);

              setLoadingSimpan(getId);
              localStorage.setItem('navbarClicked', "dashboardClicked");

            } catch (error) {
              console.log("Error: " + error)
            }
          // ...
        
      });
      return () => {
        unsubscribe();
      }
  }, [])


  // List Projek (Terdaftar)
  const [ fetchedProjects, setFetchedProjects ] = useState([]);
  const [ daftarBaru, setDaftarBaru ] = useState(false)
  const [ daftarLoad, setDaftarLoad ] = useState(false)

  try {
      useEffect(() => {
          const fetchData = async () => {
              const usersListCollection = collection(db, "usersProjects");
      
              try {
                  const userListQuery = query(usersListCollection, where("idUser", "==", loadingSimpan));
                  const querySnapshot = await getDocs(userListQuery);

                    setTimeout(() => {
                      setDaftarLoad(true);
                      setDaftarBaru(true);
                    }, 1400);


                  if (querySnapshot.docs.length > 0) {
                      const fetchedListProject = querySnapshot.docs.map(doc => ({
                          idProject: doc.data().idProject,
                      }));
                      // console.log("Projek by User: " + fetchedListProject.map(project => project.idProject))
                              
                      const usersCollection = collection(db, "projects");
      
                      if (fetchedListProject.length > 0) {
                          const usersQuery = query(usersCollection, where("idProject", "in", fetchedListProject.map(project => project.idProject)));
                          const usersSnapshot = await getDocs(usersQuery);
      
                          if (usersSnapshot.docs.length > 0) {
                              const projectList = usersSnapshot.docs.map(doc => ({
                                  idProject: doc.data().idProject,
                                  nameProject: doc.data().nameProject,
                                  labelProject: doc.data().labelProject,
                                  picProject: doc.data().picProject,
                                  imageUrlProject: doc.data().imageUrlProject,
                              }));
                              setFetchedProjects(projectList);
                          } else {
                              console.log("No project found for the given idUser values.");
                          }
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
          console.log("Test leak data loadingSimpan")
          // No cleanup needed in this case, so the return can be omitted or left empty.
          }, [loadingSimpan]);
  } catch (error) {
      console.log(error)
  }

  // Check Penanggung Jawab
  const [ checkPenanggungJawab, setCheckPenanggungJawab ] = useState(false);

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
      
      console.log("Test Leak Data checkPJ")
      fetchData();
    }, [email]);


  return (
    <div className="min-h-full">
      <Navbar />
      
      {/* <header className="bg-white drop-shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        </div>
      </header> */}

      {/* Section */}

        <section className="bg-white">
            <div className="mx-auto">
                <div className="bg-gradient-to-r from-indigo-950 to-indigo-500 bg-gray-800 p-8 md:p-12 mb-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                      <a href="https://www.instagram.com/davidek_rl/" target='_blank' rel="noreferrer"
                      className="transition-all scale-105 duration-100 ml-1 hover:scale-110
                       bg-indigo-300 text-indigo-900 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 me-1.5">
                        <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 0 1 6.775-5.025.75.75 0 0 1 .313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 0 1 1.248.313 5.25 5.25 0 0 1-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 1 1 2.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0 1 12 6.75ZM4.117 19.125a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" />
                        <path d="m10.076 8.64-2.201-2.2V4.874a.75.75 0 0 0-.364-.643l-3.75-2.25a.75.75 0 0 0-.916.113l-.75.75a.75.75 0 0 0-.113.916l2.25 3.75a.75.75 0 0 0 .643.364h1.564l2.062 2.062 1.575-1.297Z" />
                        <path fillRule="evenodd" d="m12.556 17.329 4.183 4.182a3.375 3.375 0 0 0 4.773-4.773l-3.306-3.305a6.803 6.803 0 0 1-1.53.043c-.394-.034-.682-.006-.867.042a.589.589 0 0 0-.167.063l-3.086 3.748Zm3.414-1.36a.75.75 0 0 1 1.06 0l1.875 1.876a.75.75 0 1 1-1.06 1.06L15.97 17.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                          Developed by David Dwiyanto
                      </a>
                      <h1 className="text-gray-200  text-2xl md:text-5xl font-extrabold mb-2 ">Selamat datang {username ? username : "Mahasiswa"}!</h1>
                      <p className="text-lg font-normal text-gray-300 mb-6">Semoga kegiatan kuliahmu berjalan menyenangkan.</p>
                      {/* <a href="/none" className="inline-flex justify-center items-center py-2.5 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-3000">
                          Read more
                          <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                          </svg>
                      </a> */}
                  </div>
                </div>
            </div>
        </section>

        <section className="bg-gray-50">
            <div className="px-0 lg:px-4 mx-auto max-w-screen-xl">
                <div className="grid md:grid-cols-2 gap-6">

                  {/* Section 1 */}

                    <div className="bg-white border border-gray-200 lg:rounded-lg p-6 md:px-6 md:py-6 lg:shadow-xl">
                      <div className="inline-flex">
                        <div className="bg-indigo-100 text-indigo-900  items-center px-2.5 py-0.5 rounded-md mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-xl font-medium ml-2 text-gray-700">Aktivitas Perkuliahan</div>
                      </div>
                      {/* <h2 className="text-gray-900 text-md md:text-xl lg:text-3xl font-bold lg:font-extrabold mb-2">Deadline Tugas</h2> */}
                      <hr className="h-0.5 bg-gray-950 border-2"></hr>
                      {(checkPenanggungJawab && role === "user") && (
                          <>
                            <div role="alert" className="alert rounded-xl bg-gray-50 mt-3 border border-gray-200">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-600">
                                <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                              </svg>
                              <div>
                                <h3 className="font-medium">Kamu telah menjadi penanggung jawab!</h3>
                              </div>
                              <a href='/manajemen-projek' className={`font-medium text-gray-700 underline hover:underline`}>
                                Buka Manajemen
                              </a>
                            </div>
                          </>
                          )}
                        {(role === "admin") && (
                          <>
                            <div role="alert" className="alert rounded-xl bg-gray-50 mt-3 border border-gray-200">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600">
                                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                              </svg>
                              <div>
                                <h3 className="font-medium">Kamu telah menjadi Admin!</h3>
                              </div>
                              <a href='/manajemen-projek' className={`font-medium text-gray-700 underline hover:hover:underline`}>
                                Buka Manajemen
                              </a>
                            </div>
                          </>
                          )}
                      <section className="bg-white mt-2">
                          <div className="grid md:grid-cols-2 gap-4">
                              <a href="/projek" className="hover:border hover:border-slate-400 hover:rounded-md">
                                  <div className="bg-gray-50 border border-gray-200  rounded-lg p-2 md:p-4">
                                      <a href="/projek" className=" text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md  mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                        </svg>
                                      </a>
                                      <p className="font-extrabold text-md text-gray-600 ml-2  -mt-2">Cari Mata Kuliah</p>
                                  </div>
                              </a>
                              <a href="/personal" className="hover:border hover:border-slate-400 hover:rounded-md">
                                  <div className="bg-gray-50 border border-gray-200  rounded-lg p-2 md:p-4">
                                      <a href="/projek" className=" text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md  mb-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                      </svg>
                                      </a>
                                      <p className="font-extrabold text-md text-gray-600 ml-2  -mt-2">Mata Kuliah</p>
                                  </div>
                              </a>
                              </div>
                      </section>


                     
                    </div>
                    
                    {/* End Section 1 */}

                    {/* Section 2 */}

                    <div className="bg-white border border-gray-200 lg:rounded-lg p-6 md:px-6 md:py-6 lg:shadow-xl">
                          <div className="inline-flex">
                            <div className="bg-red-100 text-red-800  items-center px-2.5 py-0.5 rounded-md mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                  <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                                  <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                                  <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
                                </svg>
                            </div>
                            <div className="text-xl font-medium ml-2 text-gray-700">Mata Kuliahku</div>
                          </div>
                        {/* <h2 className="text-gray-900 text-md md:text-xl lg:text-3xl font-bold lg:font-extrabold mb-2">Universitas 17 Agustus 1945 Surabaya</h2> */}
                        <hr className="h-0.5 bg-gray-950 border-2"></hr>

                        {/* Daftar Mata Kuliah */}

                        <ul className="my-4 space-y-3">
                          {fetchedProjects.length > 0 ? (
                              <>
                                {fetchedProjects.map((matkul) =>
                                    <>
                                    <div role="alert" className="alert rounded-xl mt-2 bg-gray-200/50 lg:flex lg:justify-between">
                                      <div className='flex'>
                                        <BookOpenIcon className="h-5 w-5 mt-0.5 text-gray-600" aria-hidden="true" />
                                        <h3 className="font-bold ml-1 -mt-0.5">{matkul.nameProject} - {matkul.labelProject}</h3>
                                      </div>
                                      <Link
                                        to="/personal/projekku" state={{projectData: matkul, clicked: "true"}}
                                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white transition-all duration-150 hover:px-8 drop-shadow-md shadow-cla-blue w-full lg:w-auto lg:px-6 py-1 rounded-lg">
                                        Buka
                                      </Link>
                                    </div>
                                    </>
                                  )}
                              </>
                          ) : (
                            <>
                              {loadBait.map(() =>
                                <li className={`${daftarBaru ? "hidden" : ""} flex items-center justify-between py-4 pl-1 pr-5 text-md text-gray-900 rounded-lg bg-gray-200/50 animate-pulse`}>
                                      <div className="flex w-0 flex-1 items-center">
                                          <div className="ml-4 flex min-w-0 flex-1 gap-2 ">
                                          <BookOpenIcon className="h-5 w-5 mt-0.5 text-gray-600" aria-hidden="true" />
                                          <span className="truncate font-medium">
                                            <div className="h-2.5 bg-gray-300/50 rounded-full mt-2 w-72"></div>
                                          </span>
                                          {/* <span className="flex-shrink-0 text-gray-400">2.4mb</span> */}
                                          </div>
                                      </div>
                                      <div className="ml-4 flex-shrink-0">
                                        <div className="h-2.5 bg-gray-300 rounded-full mt-2 w-20"></div>
                                      </div>
                                  </li>
                                  )}
                                  {daftarLoad && (
                                   <li className={`flex items-center justify-between py-4 pl-1 pr-5 text-md text-gray-900 rounded-lg bg-gray-200/50`}>
                                      <div className="flex w-0 flex-1 items-center">
                                          <div className="ml-4 flex min-w-0 flex-1 gap-2 ">
                                          <BookOpenIcon className="h-5 w-5 mt-0.5 text-gray-600" aria-hidden="true" />
                                          <span className="truncate font-medium">
                                            Belum ada mata kuliah
                                          </span>
                                          {/* <span className="flex-shrink-0 text-gray-400">2.4mb</span> */}
                                          </div>
                                      </div>
                                      <div className="ml-4 flex-shrink-0">
                                         <a href='/projek' className={`font-medium text-indigo-500 hover:text-indigo-400`}>
                                              Daftar Baru
                                          </a>
                                      </div>
                                  </li>
                                  )}
                            </>
                          )}
                        </ul>

                        {/* End Daftar Mata Kuliah */}

                    </div>

                    {/* End Section 2 */}

                </div>
            </div>
        </section>


      {/* End Section */}

      {/* Start - Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-4">

        {/* Report */}
       
        {/* End Report */}
          

        </div>
      </main>
      {/* End - Content */}

     <Bottom />
    </div>
  )
}

export default Dashboard