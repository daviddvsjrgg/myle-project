import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase/firebase';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';

const RegisterAdmin = () => {
  const navigate = useNavigate();

  const [ username, setUsername ] = useState('');
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ samePassword, setSamePassword ] = useState('');

  const [ errorMessageUsername, setErrorMessageUsername ] = useState('');
  const [ errorMessageEmail, setErrorMessageEmail ] = useState('');
  const [ errorMessagePassword, setErrorMessagePassword ] = useState('');
  const [ errorMessageSamePassword, setErrorMessageSamePassword ] = useState('');
  
  const [ errorMessageRegister, setErrorMessageRegister] = useState('');

  const [ clickedRegister, setClickedRegister ] = useState(false);
  
  const regexEmail = /^\S+@\S+\.\S+$/;

  const onSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (
      username === '' ||
      kodeKhusus !== 'davidcode-2024' ||
       email === '' ||
        password === '' ||
         samePassword === '' ||
          samePassword !== password ||
           !email.match(regexEmail) ) {
            // Do this
            usernameValidation();
            emailValidation();
            passwordValidation();
            samePasswordValidation();
            kodeKhususValidation();
    } else {
          try {
            setClickedRegister(true);
            await createUserWithEmailAndPassword(auth, email, password)
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
              const user = userCredential.user;
              // Assuming db is your Firestore instance
              const usersCollection = collection(db, "users");
    
              // Check if a document with the same idUsers already exists
              const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
    
              if (querySnapshot.size === 0) {
                // No existing document found, add a new one
                try {
                  const docRef = await addDoc(usersCollection, {
                    usernameUser: username,
                    idUser: user.uid, 
                    emailUser: user.email,
                    roleUser: "admin",
                    imageUser: "https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.webp",
                    positionUser: "Belum ada jabatan"
                  });
                  console.log("Document written with ID: ", docRef.id);
                  navigate('/');
                } catch (e) {
                  console.error("Error adding document: ", e);
                }
              } else {
                // Document with the same idUsers already exists, handle accordingly
                console.log("Document with the same idUsers already exists");
                // You may choose to update the existing document here
              }
              setErrorMessageUsername('');
              setErrorMessageEmail('');
              setErrorMessagePassword('');
              setErrorMessageSamePassword('');
              seterrorMessageKodeKhusus('');
            } catch (error) {
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log(errorCode, errorMessage);
              setClickedRegister(false);
              setErrorMessageRegister("Sesuatu telah terjadi, pastikan email dan field yang kamu isikan benar")
              if (errorCode === "auth/weak-password") {
                setClickedRegister(false);
                setErrorMessagePassword("Password minimal 6 karakter")
              } else if ( errorCode === "auth/email-already-in-use") {
                setClickedRegister(false);
                setErrorMessageEmail("Email telah digunakan")
              }
            }
      }
    }

    const handleUsernameChange = (e) => {
      setUsername(e.target.value);
      setErrorMessageUsername("");
    }

    const usernameValidation = () => {
      if ( username === '' ) {
        setErrorMessageUsername("Username tidak boleh kosong")
      }
    }

    const handleEmailChange = (e) => {
      setEmail(e.target.value);
      setErrorMessageEmail("");
    }

    const emailValidation = () => {
      if ( email === '' ) {
        setErrorMessageEmail("Email tidak boleh kosong")
      } else if ( email.length > 0) {
        if ( !email.match(regexEmail) ) {
          setErrorMessageEmail("Format email kamu salah")
        } else {
          setErrorMessageEmail("")
        }
      }
    }

    const handlePasswordChange = (e) => {
      setPassword(e.target.value);
      setErrorMessagePassword("")
      // if (password.length >= 7) {
      //   setErrorMessagePassword("");
      // } else  if ( password.length <= 7 ) {
      //   setErrorMessagePassword("Password minimal 8 karakter")
      // }
    }

    const passwordValidation = () => {
      if ( password === '' ) {
        setErrorMessagePassword("Password tidak boleh kosong")
      }
    //  if ( password.length >= 8) {
    //     setErrorMessagePassword("")
    //   } else  if ( password.length <= 7 ) {
    //     setErrorMessagePassword("Password minimal 8 karakter")
    //   }
    }

    const handleSamePassword = (e) => {
      setSamePassword(e.target.value);
    }

    const samePasswordValidation = () => {
      if ( samePassword !== password ) {
        setErrorMessageSamePassword("Password tidak sama dengan input sebelumnya")
      } else if ( samePassword === password ) {
        setErrorMessageSamePassword("")
      }
    }

    const [ kodeKhusus, setKodeKhusus ] = useState('');
    const [ errorMessageKodeKhusus, seterrorMessageKodeKhusus ] = useState('');

    const handleKodeKhusus = (e) => {
      setKodeKhusus(e.target.value)
    }

    const kodeKhususValidation = () => {
      if ( kodeKhusus === 'davidcode-2024') {
        seterrorMessageKodeKhusus("")
      } else if ( kodeKhusus !== 'davidcode-2024') {
        seterrorMessageKodeKhusus("Kode salah!")
      }
    }
    
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
      <img
        className="mx-auto h-10 w-auto"
        src="https://images.unsplash.com/photo-1582845512747-e42001c95638?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        alt="Your Company"
      />
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Silahkan Register
      </h2>
    </div>
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      {errorMessageRegister && (
        <div className="flex items-center p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert">
          <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
          </svg>
          <span className="sr-only">Info</span>
          <div>
            {errorMessageRegister}
          </div>
      </div>
      )}
    
        <div>
          <label htmlFor="nama" className="block text-sm font-medium leading-6 text-gray-900">
            Username
          </label>
          <div className="mt-2">
            <input
              autoFocus
              id="nama"
              name="nama"
              type="text"
              onChange={handleUsernameChange}
              autoComplete="nama"
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                errorMessageUsername ? 'ring-red-600' : 'ring-gray-400'
              }`}
            />
            {errorMessageUsername && (
              <div className="text-red-500 text-sm mt-1">
                {errorMessageUsername}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 mt-2">
            Email address
          </label>
          <div className="mt-2">
            <input
              placeholder='ex:example@gmail.com'
              id="email"
              name="email"
              type="email"
              onChange={handleEmailChange}
              autoComplete="email"
              required
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                errorMessageEmail ? 'ring-red-600' : 'ring-gray-400'
              }`}
            />
             {errorMessageEmail && (
              <div className="text-red-500 text-sm mt-1">
                {errorMessageEmail}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 mt-2">
              Password
            </label>
          </div>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              onChange={handlePasswordChange}
              autoComplete="current-password"
              required
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                errorMessagePassword ? 'ring-red-600' : 'ring-gray-400'
              }`}
              />
               {errorMessagePassword && (
                <div className="text-red-500 text-sm mt-1">
                  {errorMessagePassword}
                </div>
              )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 mt-2">
              Masukkan Password Yang Sama
            </label>
          </div>
          <div className="mt-2">
            <input
              id="passwordTest"
              name="passwordTest"
              type="password"
              onChange={handleSamePassword}
              autoComplete="current-password"
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                errorMessageSamePassword ? 'ring-red-600' : 'ring-gray-400'
              }`}
            />
             {errorMessageSamePassword && (
                <div className="text-red-500 text-sm mt-1">
                  {errorMessageSamePassword}
                </div>
              )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 mt-2">
              Masukkan Kode Khusus
            </label>
          </div>
          <div className="mt-2">
            <input
              id="kodeKhusus"
              name="kodeKhusus"
              type="password"
              onChange={handleKodeKhusus}
              autoComplete="current-password"
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                errorMessageKodeKhusus ? 'ring-red-600' : 'ring-gray-400'
              }`}
            />
             {errorMessageKodeKhusus && (
                <div className="text-red-500 text-sm mt-1">
                  {errorMessageKodeKhusus}
                </div>
              )}
          </div>
        </div>

        <div>
        {clickedRegister ? (
            <button
              type="submit"
              disabled
              className="animate-pulse flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 mt-7 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Loading...
            </button>
          ) : 
            <button
              type="submit"
              onClick={onSubmit}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 mt-7 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Register
            </button>
          }
          <p className="mt-10 text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <a href="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
              Login
            </a>
          </p>
        </div>
    </div>
  </div>
  )
}

export default RegisterAdmin