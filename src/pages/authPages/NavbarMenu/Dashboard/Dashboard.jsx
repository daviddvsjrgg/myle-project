import Bottom from '../../../../components/BottomBar/Bottom';
import Navbar from '../../../../components/Navbar/Navbar';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from '../../../../config/firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';


const Dashboard = () => {
  const [ username, setUsername ] = useState('');
  const [ role, setRole ] = useState('');
  const [ jumlahUser,  setJumlahUser ] = useState('')
  const [ jumlahProjects,  setJumlahProject ] = useState('')
  const [ jumlahDaftar,  setJumlahDaftar ] = useState('')

  useEffect(()=>{

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
            const usersCollection = collection(db, "users");
            const projectsCollection = collection(db, "projects");
            const usersProjectsCollection = collection(db, "usersProjects");
          
            try {
              const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
              const querySnapshotAllUsers = await getDocs(query(usersCollection));
              const querySnapshotAllProjects = await getDocs(query(projectsCollection));
              const querySnapshotAllUsersProjects = await getDocs(query(usersProjectsCollection));

              setJumlahUser(querySnapshotAllUsers.size.toString());
              setJumlahProject(querySnapshotAllProjects.size.toString());
              setJumlahDaftar(querySnapshotAllUsersProjects.size.toString());

              // Field from firestore
              const getUsername = querySnapshot.docs[0].data().usernameUser;
              const getRole = querySnapshot.docs[0].data().roleUser;
              setUsername(getUsername);
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
                      className="transition-all scale-100 duration-100 hover:scale-105
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

        <section className="bg-white">
            <div className="px-4 mx-auto max-w-screen-xl">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 md:p-12">
                        <a href="/none" className="bg-green-100 text-green-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md mb-2">
                            <svg className="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                                <path d="M17 11h-2.722L8 17.278a5.512 5.512 0 0 1-.9.722H17a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1ZM6 0H1a1 1 0 0 0-1 1v13.5a3.5 3.5 0 1 0 7 0V1a1 1 0 0 0-1-1ZM3.5 15.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM16.132 4.9 12.6 1.368a1 1 0 0 0-1.414 0L9 3.55v9.9l7.132-7.132a1 1 0 0 0 0-1.418Z"/>
                            </svg>
                            Design
                        </a>
                        <h2 className="text-gray-900  text-3xl font-extrabold mb-2">Start with Flowbite Design System</h2>
                        <p className="text-lg font-normal text-gray-500 mb-4">Static websites are now used to bootstrap lots of websites and are becoming the basis for a variety of tools that even influence both web designers and developers.</p>
                        <a href="/none" className="text-blue-600 hover:underline font-medium text-lg inline-flex items-center">Read more
                            <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                        </svg>
                        </a>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 md:p-12">
                        <a href="/none" className="bg-purple-100 text-purple-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md mb-2">
                            <svg className="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 4 1 8l4 4m10-8 4 4-4 4M11 1 9 15"/>
                            </svg>
                            Code
                        </a>
                        <h2 className="text-gray-900  text-3xl font-extrabold mb-2">Best react libraries around the web</h2>
                        <p className="text-lg font-normal text-gray-500 mb-4">Static websites are now used to bootstrap lots of websites and are becoming the basis for a variety of tools that even influence both web designers and developers.</p>
                        <a href="/none" className="text-blue-600  hover:underline font-medium text-lg inline-flex items-center">Read more
                            <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>


      {/* End Section */}

      {/* Start - Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-4">

        {/* Report */}
        
        {role === "admin" &&   (
          <>
          {jumlahProjects && jumlahUser ? (
            <div className="rounded-lg grid mb-4 border border-gray-200 shadow-md  md:mb-4 md:grid-cols-3">
            <figure className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border-b border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-ss-lg md:border-e  ">
                <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 ">
                    <h3 className="text-lg font-semibold text-gray-900 ">Total Projek</h3>
                    {/* <p className="my-4">If you care for your time, I hands down would go with this."</p> */}
                </blockquote>
                <figcaption className="flex items-center justify-center ">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-indigo-600">
                  <path d="M5.566 4.657A4.505 4.505 0 0 1 6.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0 0 15.75 3h-7.5a3 3 0 0 0-2.684 1.657ZM2.25 12a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3v-6ZM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 0 1 6.75 6h10.5a3 3 0 0 1 2.683 1.657A4.505 4.505 0 0 0 18.75 7.5H5.25Z" />
                </svg>
                    <div className="space-y-0.5 font-medium  text-left rtl:text-right ms-3">
                        <div className="text-4xl -mt-1 text-gray-600  ">{jumlahProjects}</div>
                    </div>
                </figcaption>    
            </figure>
            <figure className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border-b border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-ss-lg md:border-e  ">
                <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 ">
                    <h3 className="text-lg font-semibold text-gray-900 ">Total Daftar</h3>
                    {/* <p className="my-4">If you care for your time, I hands down would go with this."</p> */}
                </blockquote>
                <figcaption className="flex items-center justify-center ">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-indigo-600">
                    <path fillRule="evenodd" d="M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm4.125 3a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm-3.873 8.703a4.126 4.126 0 0 1 7.746 0 .75.75 0 0 1-.351.92 7.47 7.47 0 0 1-3.522.877 7.47 7.47 0 0 1-3.522-.877.75.75 0 0 1-.351-.92ZM15 8.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15ZM14.25 12a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15Z" clipRule="evenodd" />
                  </svg>
                    <div className="space-y-0.5 font-medium  text-left rtl:text-right ms-3">
                        <div className="text-4xl -mt-1 text-gray-600  ">{jumlahDaftar}</div>
                    </div>
                </figcaption>    
            </figure>
            <figure className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border-b border-gray-200 md:rounded-se-lg  ">
                <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 ">
                    <h3 className="text-lg font-semibold text-gray-900 ">Total User</h3>
                    {/* <p className="my-4">Designing with Figma components that can be easily translated to the utility classes of Tailwind CSS is a huge timesaver!"</p> */}
                </blockquote>
                <figcaption className="flex items-center justify-center ">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-indigo-600">
                  <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
                  <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
                </svg>
                    <div className="space-y-0.5 font-medium  text-left rtl:text-right ms-3">
                        <div className="text-4xl -mt-1 text-gray-600 ">{jumlahUser}</div>
                    </div>
                </figcaption>    
            </figure>
        </div>
          ) : (
            <>
            <div className="mx-2 rounded-lg grid mb-4 border border-gray-200 shadow-md  md:mb-4 md:grid-cols-2 bg-white ">
                <figure className="flex flex-col items-center justify-center p-8 text-center bg-white border-b border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-ss-lg md:border-e  ">
                    <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 ">
                        <h3 className="text-lg font-semibold text-gray-900 ">Total Mata Kuliah</h3>
                        {/* <p className="my-4">If you care for your time, I hands down would go with this."</p> */}
                    </blockquote>
                    <figcaption className="flex items-center justify-center ">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-indigo-600">
                      <path d="M5.566 4.657A4.505 4.505 0 0 1 6.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0 0 15.75 3h-7.5a3 3 0 0 0-2.684 1.657ZM2.25 12a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3v-6ZM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 0 1 6.75 6h10.5a3 3 0 0 1 2.683 1.657A4.505 4.505 0 0 0 18.75 7.5H5.25Z" />
                    </svg>
                        <div className="space-y-0.5 font-medium  text-left rtl:text-right ms-3">
                            <div className="text-md text-gray-400 animate-pulse">Menghitung...</div>
                        </div>
                    </figcaption>    
                </figure>
                <figure className="flex flex-col items-center justify-center p-8 text-center bg-white border-b border-gray-200 md:rounded-se-lg  ">
                    <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 ">
                        <h3 className="text-lg font-semibold text-gray-900 ">Total User</h3>
                        {/* <p className="my-4">Designing with Figma components that can be easily translated to the utility classes of Tailwind CSS is a huge timesaver!"</p> */}
                    </blockquote>
                    <figcaption className="flex items-center justify-center ">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-indigo-600">
                      <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
                      <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
                    </svg>
                        <div className="space-y-0.5 font-medium  text-left rtl:text-right ms-3">
                            <div className="text-md text-gray-400 animate-pulse">Menghitung...</div>
                        </div>
                    </figcaption>    
                </figure>
            </div>
            </>
          )}
          </>
        )}
       
        {/* End Report */}
          

        </div>
      </main>
      {/* End - Content */}

     <Bottom />
    </div>
  )
}

export default Dashboard