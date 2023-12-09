import React from 'react'
import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import classNames from 'classnames';

import { signOut } from "firebase/auth";
import { auth, db } from '../../config/firebase/firebase';
import { Navigate, useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from 'firebase/firestore';

  // const navigation = [
  //   { name: 'Dashboard', href: '/', current: false },
  //   { name: 'Manajemen Projek', href: '/manajemen-projek', current: false },
  //   { name: 'Manajemen User', href: '/manajemen-user', current: false },
  //   { name: 'Projek', href: '/projek', current: false },
  //   { name: 'Laporan', href: '/laporan', current: false },
  // ]
  const userNavigation = [
    { name: 'Logout', href: '/login' },
  ]
  
  const profil = [
    { name: 'Profil Anda', href: '/myProfile' },
  ]
  
  const Navbar = () => {
  const [ username, setUsername ] = useState('');
  const [ email, setEmail ] = useState('');
  const [ photo, setPhoto ] = useState('');
  const [ role, setRole ] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(()=>{
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const usersCollection = collection(db, "users");
    
            try {
              const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
              // Field from firestore
              const getUsername = querySnapshot.docs.map(doc => doc.data().usernameUser);
              const getEmail = querySnapshot.docs.map(doc => doc.data().emailUser);
              const getPhoto = querySnapshot.docs.map(doc => doc.data().imageUser);
              const getRole = querySnapshot.docs[0].data().roleUser;
              setUsername(getUsername);
              setEmail(getEmail);
              setPhoto(getPhoto);
              setRole(getRole);

            } catch (error) {
              console.log("Error: " + error)
              navigate("/login");
            }
          
          // ...
        
      });
      return () => {
        unsubscribe();
      }
}, [])


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
                  {(role === "user" || role === "admin") && (
                    <>
                      <a href="/" className='text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'>
                        Dashboard
                      </a>
                    </>
                  )}
                  {role === "admin" && (
                    <>
                      <a href="/manajemen-projek" className='text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'>
                        Manajemen Projek
                      </a>
                      <a href="/manajemen-user" className='text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'>
                        Manajemen User
                      </a>
                    </>
                  )}
                  {(role === "user" || role === "admin") && (
                    <>
                      <a href="/projek" className='text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'>
                        Projek
                      </a>
                      <a href="/laporan" className='text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'>
                        Laporan
                      </a>
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
                    {profil.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <a
                              href={item.href}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              {item.name}
                            </a>
                          )}
                        </Menu.Item>
                      ))}
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <a
                              href={item.href}
                              onClick={handleLogout}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              {item.name}
                            </a>
                          )}
                        </Menu.Item>
                      ))}
                     
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
                  <Disclosure.Button as="a" href="/" className='text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium'>
                    Dashboard
                  </Disclosure.Button>
                </>
              )}
              {role === "admin" && (
                <>
                  <Disclosure.Button as="a" href="/manajemen-projek" className='text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium'>
                    Manajemen Projek
                  </Disclosure.Button>
                  <Disclosure.Button as="a" href="/manajemen-user" className='text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium'>
                    Manajemen User
                  </Disclosure.Button>
                </>
              )}
              {(role === "user" || role === "admin") && (
                <>
                  <Disclosure.Button as="a" href="/projek" className='text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium'>
                    Projek
                  </Disclosure.Button>
                  <Disclosure.Button as="a" href="/laporan" className='text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium'>
                    Laporan
                  </Disclosure.Button>
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
              {profil.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {userNavigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  onClick={handleLogout}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </div>
        </Disclosure.Panel>
      </>
    )}
  </Disclosure>
  )
}

export default Navbar