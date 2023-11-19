import React, { useState } from 'react'
import { auth } from '../config/firebase/firebase';
import { signInWithEmailAndPassword  } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'


const Login = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessageEmail, setErrorMessageEmail] = useState('');
  const [errorMessagePassword, setErrorMessagePassword] = useState('');
  const [errorMessageLogin, setErrorMessageLogin] = useState('');
     
  const onLogin = async (e) => {  
    e.preventDefault();
  
    emailValidation();
    passwordValidation();    
    
      if (email === '' || password === '') {
        return;
      } else {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          navigate("/");
          console.log(user);
          setErrorMessageEmail('');
          setErrorMessagePassword('');
        } catch (error) {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
          setErrorMessageLogin('Email atau password salah')
          navigate("/login");
        }
      }
    
    };
    
    const handleEmailChange = (e) => {
      setEmail(e.target.value);
      setErrorMessageEmail('');
      setErrorMessageLogin('')
    };
    
    const emailValidation = () => {
      if (email === '') {
        setErrorMessageEmail('Email tidak boleh kosong');
      }
    };
    
    const handlePasswordChange = (e) => {
      setPassword(e.target.value);
      setErrorMessagePassword('');
      setErrorMessageLogin('')
    };
    
    const passwordValidation = () => {
      if (password === '') {
        setErrorMessagePassword('Password tidak boleh kosong');
      }
    };
  

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
      <img
        className="mx-auto h-10 w-auto"
        src="https://images.unsplash.com/photo-1582845512747-e42001c95638?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        alt="Your Company"
      />
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Silahkan Login
      </h2>
    </div>
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      {errorMessageLogin && (
        <div id="alert-2" className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
        <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
        </svg>
        <span className="sr-only">Info</span>
        <div className="ms-3 text-sm font-medium">
          {errorMessageLogin}
        </div>
      </div>
      
      )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
            Email address
          </label>
          <div className="mt-2">
            <input
              autoFocus
              id="email"
              name="email"
              type="email"
              onChange={handleEmailChange}
              autoComplete="email"
              required
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inse placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
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
          <div className="flex items-center justify-between mt-2">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
            <div className="text-sm">
              <p href="" className="font-semibold text-indigo-600 hover:text-indigo-500">
               Lupa password?
              </p>
            </div>
          </div>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              onChange={handlePasswordChange}
              onBlur={passwordValidation}
              autoComplete="current-password"
              required
              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
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
          <button
            type="submit"
            onClick={onLogin}
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 mt-7 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Login
          </button>
        </div>
      <p className="mt-10 text-center text-sm text-gray-500">
        Belum punya akun?{' '}
        <a href="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
          Register
        </a>
      </p>
    </div>
  </div>
  )
}

export default Login