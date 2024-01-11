import Bottom from '../../../../components/BottomBar/Bottom';
import Navbar from '../../../../components/Navbar/Navbar';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from '../../../../config/firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';


const Dashboard = () => {
  const [ username, setUsername ] = useState('');
  const [ role, setRole ] = useState('');

  useEffect(()=>{

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
            const usersCollection = collection(db, "users");
    
            try {
              const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
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
      
      <header className="bg-white drop-shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{username}</h1>
        </div>
      </header>

      {/* Start - Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8"></div>
      </main>
      {/* End - Content */}

     <Bottom />
    </div>
  )
}

export default Dashboard