import React, { Fragment, useEffect, useRef, useState } from 'react'
import Navbar from '../../../../../components/Navbar/Navbar'
import Bottom from '../../../../../components/BottomBar/Bottom'
import { BookOpenIcon } from '@heroicons/react/20/solid'
import { useLocation, useNavigate } from 'react-router-dom'
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../../../../../config/firebase/firebase'
import { Dialog, Transition } from '@headlessui/react'

const numberWa = '628990256825';
const text = "Hai David, sepertinya halaman ini bermasalah (url)"

const UserProfile = () => {

    const location = useLocation();
    console.log(location)
    const userData = location.state.userData;
    const navigate = useNavigate();

    const [ buttonLoading, setButtonLoading ] = useState(false)

    const handleClickSimpan = async (e) => {
        e.preventDefault();

        const getUsername =  document.getElementById("usernameUser").value;
        const getJabatan =  document.getElementById("positionUser").value;
        const getRole =  document.getElementById("roleUser").value;

        console.log("username: " + getUsername);
        console.log("Jabatan: " + getJabatan);
        console.log("Hak Akses: " + getRole);

        const usersCollection = collection(db, "users");
        // Check ID
        const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", userData.idUser)));

        if (querySnapshot.size === 0) {
        // No existing document found, add a new one
            console.log("Terjadi Kesalahan")
        } else {
            setButtonLoading(true);
            setCount(3);
            setOpen(true);
        // Document with the same idUsers already exists, update the existing document
        const doc = querySnapshot.docs[0];
        try {
            await updateDoc(doc.ref, {
            usernameUser: getUsername,
            positionUser: getJabatan,
            roleUser: getRole,
            });
            setTimeout(() => {
                navigate('/manajemen-user')
            }, 3500);
            console.log("Document updated with ID: ", doc.id);
        } catch (e) {
            console.error("Error updating document: ", e);
        }
        }
    }

    // Modal
    const [open, setOpen] = useState(false)
    const cancelButtonRef = useRef(null)

    // Countdown
    const [count, setCount] = useState(null);

    useEffect(() => {
        const countdownInterval = setInterval(() => {
        if (count > 0) {
            setCount(prevCount => prevCount - 1);
        } else {
            clearInterval(countdownInterval);
            // Add any additional actions you want to perform after the countdown
        }
        }, 1000);

        // Cleanup the interval when the component unmounts
        return () => clearInterval(countdownInterval);
    }, [count]);

  return (
    <div className="min-h-full">
        <Navbar />
        {/* Modal */}
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-40 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div
                        className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-200 sm:mx-0 sm:h-10 sm:w-10 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                        </svg>
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                            Data berhasil diubah
                            </Dialog.Title>
                            <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Data kamu berhasil diubah, kamu akan otomatis kembali dalam waktu {count} detik.
                            </p>
                            </div>
                        </div>
                        </div>
                    </div>
                    </Dialog.Panel>
                </Transition.Child>
                </div>
            </div>
            </Dialog>
        </Transition.Root>
        {/* End Modal */}
            <header className="bg-white drop-shadow-md">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Profile</h1>
                </div>
            </header>

            {/* Start - Content */}
            <main>
                <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                    <div>
                        <div className="px-4 sm:px-0">
                            <h3 className="text-base font-semibold leading-7 text-gray-900">Detail Pengguna</h3>
                            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Informasi personal pengguna dan mata kuliah.</p>
                        </div>
                        <div className="mt-6 border-t border-gray-100">
                            <dl className="divide-y divide-gray-100">
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Username</dt>
                                <input 
                                    type="text" 
                                    name="usernameUser" 
                                    id="usernameUser"
                                    defaultValue={`${userData.usernameUser}`}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6">
                                    </input>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Jabatan</dt>
                                <input 
                                    type="text" 
                                    name="positionUser" 
                                    id="positionUser"
                                    defaultValue={`${userData.positionUser !== "" ? userData.positionUser : "Belum ada jabatan"}`}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6">
                                    </input>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Hak Akses</dt>
                                <input 
                                    type="text" 
                                    name="roleUser" 
                                    id="roleUser"
                                    defaultValue={`${userData.roleUser}`}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6">
                                    </input>
                            </div>
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Email address</dt>
                                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{userData.emailUser}</dd>
                            </div>
                            
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Tentang Profile</dt>
                                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                    Semua informasi dapat diubah oleh pemilik akun. Dengan ketentuan berlaku. Hanya bisa mengubah "Username" untuk saat ini, jika ingin mengubah data yang lain kamu bisa menghubungi{' '}
                                    <a href={`https://wa.me/${numberWa}?text=${text}`} className=" text-sm leading-6 text-blue-600">
                                        developer.
                                    </a>
                                </dd>
                            </div>

                            {buttonLoading ? (
                                <div className="mt-6 flex items-center justify-end px-4 py-3 sm:gap-4 sm:px-0">
                                    <button
                                        type="submit"
                                        disabled
                                        className="animate-pulse rounded-md bg-indigo-600 px-10 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        >
                                    Loading...
                                    </button>
                                </div>
                            ):
                                <div className="mt-6 flex items-center justify-end px-4 py-3 sm:gap-4 sm:px-0">
                                    <button
                                        type="submit"
                                        onClick={handleClickSimpan}
                                        className="rounded-md bg-indigo-600 px-10 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        >
                                    Simpan
                                    </button>
                                </div>
                            
                            }

                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm font-medium leading-6 text-gray-900">Mata Kuliah</dt>
                                <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                                    <div className="flex w-0 flex-1 items-center">
                                        <BookOpenIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                        <span className="truncate font-medium">Pengembangan Aplikasi Bergerak</span>
                                        {/* <span className="flex-shrink-0 text-gray-400">2.4mb</span> */}
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <a href="/none" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Detail
                                        </a>
                                    </div>
                                    </li>
                                    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                                    <div className="flex w-0 flex-1 items-center">
                                        <BookOpenIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                        <span className="truncate font-medium">Pengolahan Citra Digital</span>
                                        {/* <span className="flex-shrink-0 text-gray-400">4.5mb</span> */}
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <a href="/none" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Detail
                                        </a>
                                    </div>
                                    </li>
                                </ul>
                                </dd>
                            </div>
                            </dl>
                        </div>
                     </div>
                </div>
            </main>
            {/* End - Content */}
            
        <Bottom />
    </div>
  )
}

export default UserProfile