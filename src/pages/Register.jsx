import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase/firebase';

const Register = () => {
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

  const onSubmit = async (e) => {
    e.preventDefault()

    usernameValidation();
    emailValidation();
    passwordValidation();
    samePasswordValidation();

    if (username === '' || email === '' || password === '' || samePassword === '' || (samePassword !== password) ) {
      return null;
    } else {
        try {
          await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log(user);
                navigate("/")
                // ...  
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
                // ..
                setErrorMessageRegister("Sesuatu telah terjadi, pastikan email anda unik dan sesuai format!");
            });
        } catch (error) {
          console.log(error);
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
      }
    }

    const handlePasswordChange = (e) => {
      setPassword(e.target.value);
      if (password.length === 7) {
        setErrorMessagePassword("");
      }
    }

    const passwordValidation = () => {
      if ( password.length < 8 ) {
        setErrorMessagePassword("Password minimal 8 karakter")
      }
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
    
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
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
                errorMessageUsername ? 'ring-red-600' : 'ring-gray-300'
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
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                errorMessageEmail ? 'ring-red-600' : 'ring-gray-300'
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
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                errorMessagePassword ? 'ring-red-600' : 'ring-gray-300'
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
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                errorMessageSamePassword ? 'ring-red-600' : 'ring-gray-300'
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
          <button
            type="submit"
            onClick={onSubmit}
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 mt-7 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Register
          </button>
        </div>
      <p className="mt-10 text-center text-sm text-gray-500">
        Sudah punya akun?{' '}
        <a href="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
          Login
        </a>
      </p>
    </div>
  </div>
  )
}

export default Register