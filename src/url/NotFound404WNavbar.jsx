import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const NotFound404WNavbar = () => {

    const [ role, setRole ] = useState('');

    useEffect(()=>{
        
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const usersCollection = collection(db, "users");
        
                try {
                const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
                // Field from firestore
                const getRole = querySnapshot.docs[0].data().roleUser;
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
    <div>
        <div>
        {(role === "user" || role === "admin") && (
        <>
            <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
            <p className="text-6xl font-semibold text-indigo-600">404</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Halaman Tidak Ada</h1>
            <p className="mt-6 text-base leading-7 text-gray-600">Maaf, halaman yang kamu cari tidak ada.</p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                href="/"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                Kembali ke Dashboard
                </a>
                <a href={`https://www.instagram.com/davidek_rl/`} target='_blank' rel="noreferrer" className="text-sm font-semibold text-gray-900">
                Hubungi Developer {'DM Instagram'} <span aria-hidden="true">&rarr;</span>
                    </a>
                </div>
                </div>
            </main>
        </>
        )}
        </div>
    </div>
  )
}

export default NotFound404WNavbar