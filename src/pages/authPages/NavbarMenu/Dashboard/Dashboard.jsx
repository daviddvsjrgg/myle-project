import Bottom from '../../../../components/BottomBar/Bottom';
import Navbar from '../../../../components/Navbar/Navbar';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from '../../../../config/firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';


const Dashboard = () => {
  const [ username, setUsername ] = useState('');
  const [ image, setImage ] = useState('');
  const [ positionUser, setPositionUser ] = useState('');
  const [ role, setRole ] = useState('');
  const [ jumlahUser,  setJumlahUser ] = useState('')
  const [ jumlahProjects,  setJumlahProject ] = useState('')

  useEffect(()=>{

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
            const usersCollection = collection(db, "users");
            const projectsCollection = collection(db, "projects");
    
            try {
              const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
              const querySnapshotAllUsers = await getDocs(query(usersCollection));
              const querySnapshotAllProjects = await getDocs(query(projectsCollection));

              setJumlahUser(querySnapshotAllUsers.size.toString());
              setJumlahProject(querySnapshotAllProjects.size.toString());

              // Field from firestore
              const getUsername = querySnapshot.docs[0].data().usernameUser;
              const getImage = querySnapshot.docs[0].data().imageUser;
              const getPositionUser = querySnapshot.docs[0].data().positionUser;
              const getRole = querySnapshot.docs[0].data().roleUser;
              setUsername(getUsername);
              setImage(getImage);
              setPositionUser(getPositionUser);
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
      
      <header className="bg-white drop-shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        </div>
      </header>

      {/* Start - Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">

        {/* Welcoming */}

       {image ? (
         <div className="mx-2 grid mb-2 border border-gray-200 shadow-md rounded-lg md:mb-5 md:grid-cols-1 bg-white ">
            <figure className="flex flex-col items-center justify-center p-6 text-center bg-white border-b border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-ss-lg md:border-e  ">
                <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-4 ">
                    <h3 className="text-lg font-semibold text-gray-900 ">Selamat Datang</h3>
                    <p className="my-1">Semoga kuliahmu menyenangkan :{")"}</p>
                </blockquote>
                <figcaption className="flex items-center justify-center ">
                    <img className="rounded-full w-10 h-10" src={image} alt="" />
                    <div className=" font-medium  text-left rtl:text-right ms-3">
                        <div>{username}</div>
                        <div className="text-sm text-gray-500  ">{positionUser === "Belum Ada Jabatan" ? "Mahasiswa" : positionUser}</div>
                    </div>
                </figcaption>    
            </figure>
        </div>
       ) : (
        <div className="mx-2 grid mb-2 border border-gray-200 shadow-md  md:mb-6 md:grid-cols-1 bg-white ">
            <figure className="flex flex-col items-center justify-center p-6 text-center bg-white border-b border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-ss-lg md:border-e  ">
                <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-4 ">
                    <h3 className="text-lg font-semibold text-gray-900 ">Selamat Datang</h3>
                    <p className="my-1">Semoga kuliahmu menyenangkan :{")"}</p>
                </blockquote>
                <figcaption className="flex items-center justify-center ">
                    <div className="flex items-center">
                      <svg className="w-10 h-10 me-3 text-gray-200 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                        </svg>
                        <div>
                            <div className="h-2.5 bg-gray-200 rounded-full  w-32 mb-2"></div>
                            <div className="w-48 h-2 bg-gray-200 rounded-full "></div>
                        </div>
                    </div>
                </figcaption>    
            </figure>
        </div>
       )}
       
        
        {/* End Welcoming */}

        {/* Report */}
        
        {role === "admin" &&   (
        <>
        {jumlahProjects && jumlahUser ? (
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
                       <div className="text-4xl text-gray-600  ">{jumlahProjects}</div>
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
                       <div className="text-4xl text-gray-600 ">{jumlahUser}</div>
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