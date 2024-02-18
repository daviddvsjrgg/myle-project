import React from 'react'
import { Fragment } from 'react'
import { Disclosure, Menu, Transition, Popover} from '@headlessui/react'
import { Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline'
import classNames from 'classnames';

import { signOut } from "firebase/auth";
import { auth, db } from '../../config/firebase/firebase';
import { Link, useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ChevronDownIcon } from '@heroicons/react/20/solid'


  // const navigation = [
  //   { name: 'Dashboard', href: '/', current: false },
  //   { name: 'Manajemen Projek', href: '/manajemen-projek', current: false },
  //   { name: 'Manajemen User', href: '/manajemen-user', current: false },
  //   { name: 'Projek', href: '/projek', current: false },
  //   { name: 'Laporan', href: '/laporan', current: false },
  // ]
  // const userNavigation = [
  //   {id: 1, name: 'Logout', href: '/login' },
  // ]
  
  // const profil = [
  //   {id: 1, name: 'Profil Anda', href: '/user-profile' },
  // ]
  
  const Navbar = () => {
  const [ username, setUsername ] = useState('');
  const [ email, setEmail ] = useState('');
  const [ photo, setPhoto ] = useState('');
  const [ role, setRole ] = useState('');

  const [ checkPenanggungJawab, setCheckPenanggungJawab ] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(()=>{
    
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const usersCollection = collection(db, "users");
      
              try {
                const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
                // Field from firestore
                const getUsername = querySnapshot.docs[0].data().usernameUser;
                const getEmail = querySnapshot.docs[0].data().emailUser;
                const getPhoto = querySnapshot.docs[0].data().imageUser;
                const getRole = querySnapshot.docs[0].data().roleUser;
                setUsername(getUsername);
                setEmail(getEmail);
                setPhoto(getPhoto);
                setRole(getRole);

              } catch (error) {
                console.log("Error: " + error)
                setTimeout(() => {
                  navigate('/login')
                }, 2000);
              }
            
            // ...
          
        });
        return () => {
          unsubscribe();
        }
  }, [navigate])

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

        fetchData();
      }, [email]);


    const handleLogout = () => {               
      signOut(auth).then(() => {
      // Sign-out successful.
          navigate("/login");
      }).catch((error) => {
      // An error happened.
          console.log(error)
      });
  }
  
  return (
    <Disclosure as="nav" className="bg-gray-800">
    {({ open }) => (
      <>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8"
                  src="https://images.unsplash.com/photo-1582845512747-e42001c95638?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Your Company"
                />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {(role === "user" || role === "admin") ? (
                    <>
                      <Link to="/" className={`${localStorage.getItem('navbarClicked') === "dashboardClicked" ? "bg-gray-700 text-white" : ""}
                      text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium`}>
                        Dashboard
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/" className={`${localStorage.getItem('navbarClicked') === "dashboardClicked" ? "bg-gray-700 text-white" : ""}
                      text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium`}>
                        Dashboard
                      </Link>
                    </>
                  )}
                  {(role === "user" || role === "admin") ? (
                    <>
                     <Popover className="relative">
                      <Popover.Button 
                      className={`${
                        localStorage.getItem('navbarClicked') === "manajemenUserClicked" ||
                        localStorage.getItem('navbarClicked') === "manajemenProjekClicked" ||
                        localStorage.getItem('navbarClicked') === "manajemenMatkulClicked"
                       ? "text-white bg-gray-700" : ""}
                     inline-flex gap-x-1 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium`}>
                        <span>Manajemen</span>
                        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                      </Popover.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <Popover.Panel className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4">
                          <div className="w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                            <div className="p-4">
                              {(role === "user" || role === "admin") && (
                                <>
                                  {(checkPenanggungJawab || role === 'admin') ? (
                                    <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
                                        <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                          className={`${localStorage.getItem('navbarClicked') === "manajemenProjekClicked" ? "text-indigo-600 bg-gray-50" : ""}
                                          h-6 w-6 text-gray-600 group-hover:text-indigo-600`}>
                                            <path d="M5.566 4.657A4.505 4.505 0 016.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0015.75 3h-7.5a3 3 0 00-2.684 1.657zM2.25 12a3 3 0 013-3h13.5a3 3 0 013 3v6a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-6zM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 016.75 6h10.5a3 3 0 012.683 1.657A4.505 4.505 0 0018.75 7.5H5.25z" />
                                          </svg>
                                        </div>
                                        <div>
                                          <Link to="/manajemen-projek"
                                           className="font-semibold text-gray-900">
                                            Manajemen Projek
                                            <span className="absolute inset-0" />
                                          </Link>
                                          <p className="mt-1 text-gray-600">Menampilkan list projek</p>
                                        </div>
                                    </div>
                                    ) : (
                                      null
                                    )}
                                    {role === "admin" && (
                                    <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
                                      <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                      className={`${localStorage.getItem('navbarClicked') === "manajemenUserClicked" ? "text-indigo-600 bg-gray-50" : ""}
                                      h-6 w-6 text-gray-600 group-hover:text-indigo-600`}>
                                        <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                                        <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                                      </svg>
                                      </div>
                                      <div>
                                        <Link to="/manajemen-user" className="font-semibold text-gray-900">
                                          Manajemen User
                                          <span className="absolute inset-0" />
                                        </Link>
                                        <p className="mt-1 text-gray-600">Menampilkan list user</p>
                                      </div>
                                    </div>
                                    )}
                                </>
                              )}
                                <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
                                  <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                  className={`${localStorage.getItem('navbarClicked') === "manajemenMatkulClicked" ? "text-indigo-600 bg-gray-50" : ""}
                                  h-6 w-6 text-gray-600 group-hover:text-indigo-600`}>
                                    <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                                  </svg>
                                  </div>
                                  <div>
                                    <Link to="/projek" className="font-semibold text-gray-900">
                                      Cari Mata Kuliah
                                      <span className="absolute inset-0" />
                                    </Link>
                                    <p className="mt-1 text-gray-600">Menampilkan list mata kuliah</p>
                                  </div>
                                </div>
                            </div>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </Popover>
                    </>
                  ) : (
                    <>
                    <Popover className="relative">
                      <Popover.Button className="inline-flex gap-x-1 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                        <span>Manajemen</span>
                        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                      </Popover.Button>
                    </Popover>
                    </>
                  )}
                  {(role === "user" || role === "admin") ? (
                    <>
                      <Link to="/personal" 
                      className={`${localStorage.getItem('navbarClicked') === "manajemenPersonalClicked" ? "text-white bg-gray-700" : ""} 
                      text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium`}>
                        Mata Kuliahku
                      </Link>
                      <Link to="/none" className='text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'>
                        Jadwal Kuliah
                      </Link>
                      <Link to="/none" className='text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'>
                        Linimasa
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/personal" className='text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'>
                        Mata Kuliahku
                      </Link>
                      <Link to="/none" className='text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'>
                        Jadwal Kuliah
                      </Link>
                      <Link to="/none" className='text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'>
                        Linimasa
                      </Link>
                    </>
                  )}

                  {/*below is the main NAVIGATION*/}

                  {/* {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'rounded-md px-3 py-2 text-sm font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </a>
                  ))} */}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                {/* <button
                  type="button"
                  className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button> */}

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img className="h-8 w-8 rounded-full" src={photo ? photo : "https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.webp"} alt="" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link to="/user-profile"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Profil Anda
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="/login"
                              onClick={handleLogout}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Logout
                            </a>
                          )}
                        </Menu.Item>
                     
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              {/* Mobile menu button */}
              <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Disclosure.Button>
            </div>
          </div>
        </div>
                  
        <Disclosure.Panel className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {(role === "user" || role === "admin") && (
                <>
                  <Disclosure.Button as="a" href="/" className={`${localStorage.getItem('navbarClicked') === "dashboardClicked" ? "bg-gray-700 text-white" : ""}
                  text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium`}>
                    Dashboard
                  </Disclosure.Button>
                </>
              )}
              {(role === "user" || role === "admin") && (
               <>
                <Popover className="relative">
                  <Popover.Button
                   className={`${
                      localStorage.getItem('navbarClicked') === "manajemenUserClicked" ||
                      localStorage.getItem('navbarClicked') === "manajemenProjekClicked" ||
                      localStorage.getItem('navbarClicked') === "manajemenMatkulClicked"
                     ? "text-white bg-gray-700" : ""}
                   inline-flex gap-x-1 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium`}>
                    <span>Manajemen</span>
                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4">
                      <div className="w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                        <div className="p-4">
                        {(role === "user" || role === "admin") && (
                                <>
                                  {(checkPenanggungJawab || role === "admin") ? (
                                    <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
                                        <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                          className={`${localStorage.getItem('navbarClicked') === "manajemenProjekClicked" ? "text-indigo-600 bg-gray-50" : ""}
                                          h-6 w-6 text-gray-600 group-hover:text-indigo-600`}>
                                            <path d="M5.566 4.657A4.505 4.505 0 016.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0015.75 3h-7.5a3 3 0 00-2.684 1.657zM2.25 12a3 3 0 013-3h13.5a3 3 0 013 3v6a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-6zM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 016.75 6h10.5a3 3 0 012.683 1.657A4.505 4.505 0 0018.75 7.5H5.25z" />
                                          </svg>
                                        </div>
                                        <div>
                                          <Link to="/manajemen-projek"
                                          className="font-semibold text-gray-900">
                                            Manajemen Projek
                                            <span className="absolute inset-0" />
                                          </Link>
                                          <p className="mt-1 text-gray-600">Menampilkan list projek</p>
                                        </div>
                                    </div>
                                    ) : (
                                      null
                                    )}
                                    {role === "admin" && (
                                    <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
                                      <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                      className={`
                                      ${localStorage.getItem('navbarClicked') === "manajemenUserClicked" ? "text-indigo-600 bg-gray-50" : ""}
                                      h-6 w-6 text-gray-600 group-hover:text-indigo-600`}>
                                        <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                                        <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                                      </svg>
                                      </div>
                                      <div>
                                        <Link to="/manajemen-user" className="font-semibold text-gray-900">
                                          Manajemen User
                                          <span className="absolute inset-0" />
                                        </Link>
                                        <p className="mt-1 text-gray-600">Menampilkan list user</p>
                                      </div>
                                    </div>
                                    )}
                                </>
                              )}
                            <div className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
                              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                              className={`${localStorage.getItem('navbarClicked') === "manajemenMatkulClicked" ? "text-indigo-600 bg-gray-50" : ""}
                              h-6 w-6 text-gray-600 group-hover:text-indigo-600`}>
                                <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                              </svg>
                              </div>
                              <div>
                                <Link to="/projek" className="font-semibold text-gray-900">
                                  Cari Mata Kuliah
                                  <span className="absolute inset-0" />
                                </Link>
                                <p className="mt-1 text-gray-600">Menampilkan list mata kuliah</p>
                              </div>
                            </div>
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </Popover>
                </>
              )}
              {(role === "user" || role === "admin") && (
                <>
                <Link to="/personal">
                  <div className="mt-2"></div>
                  <Disclosure.Button as="a"
                  className={`${localStorage.getItem('navbarClicked') === "manajemenPersonalClicked" ? "text-white bg-gray-700" : ""} 
                  text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium`}>
                    Mata Kuliahku
                  </Disclosure.Button>
                </Link>
                    <div className="mt-2"></div>
                <Link to="/none">
                  <Disclosure.Button as="a" className='text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium'>
                    Jadwal Kuliah
                  </Disclosure.Button>
                </Link>
                <Link to="/none">
                  <Disclosure.Button as="a" className='text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium'>
                    Linimasa
                  </Disclosure.Button>
                </Link>
                </>
              )}
          </div>
          <div className="border-t border-gray-700 pb-3 pt-4">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <img className="h-10 w-10 rounded-full" src={photo ? photo : "https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.webp"} alt="profile-pic" />
              </div>
              
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">{username === '' || username ? username : "users"}</div>
                <div className="text-sm font-medium leading-none text-gray-400 mt-1">{email}</div>
              </div>

              {/* used to be bell button */}
              {/* <button
                type="button"
                className="relative ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span className="absolute -inset-1.5" />
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="false" />
              </button> */}
            </div>
            <div className="mt-3 space-y-1 px-2">
                <Link to="/user-profile">
                  <Disclosure.Button
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    Profil Anda
                  </Disclosure.Button>
                </Link>
                <Disclosure.Button
                  href="/login"
                  onClick={handleLogout}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  Logout
                </Disclosure.Button>
            </div>
          </div>
        </Disclosure.Panel>
      </>
    )}
  </Disclosure>
  )
}

export default Navbar