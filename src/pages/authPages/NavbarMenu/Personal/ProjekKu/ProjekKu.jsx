import React, { Fragment, useEffect, useRef, useState } from 'react'
import Navbar from '../../../../../components/Navbar/Navbar'
import { useLocation } from 'react-router-dom';
import NotFound404 from '../../../../../url/NotFound404';
import { BookOpenIcon } from '@heroicons/react/20/solid';
import { auth, db } from '../../../../../config/firebase/firebase';
import { addDoc, collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, Transition } from '@headlessui/react';

const ProjekKu = () => {

    const location = useLocation();
    const projectData = location.state ? location.state.projectData : null;

    // Set Edit Button
    const [ buttonEdit, setButtonEdit ] = useState(false)

    // Simpan Cliced 
    const [ buttonClicked, setButtonClicked ] = useState(false)

    // Get Informasi Mata Kuliah
    const [ fetchedInfoMatkul, setFetchedInfoMatkul ] = useState([])

    const [ day1, setDay1 ] = useState("")
    const [ time1, setTime1 ] = useState("")
    const [ day2, setDay2 ] = useState("")
    const [ time2, setTime2 ] = useState("")

    // Modal Terdaftar
    const [ tersimpan, setTersimpan ] = useState(false)
    const cancelButtonRefTersimpan = useRef(null)

    // Get Current auth
    const [ getCurrentEmail, setGetCurrentEmail ] = useState("")
    const [ getCurrentRole, setGetCurrentRole ] = useState("")

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

    useEffect(() => {
        const fetchData = async () => {
        const lecturersCollection = collection(db, "lecturers");

        try {
            const user = auth.currentUser;
            const usersCollection = collection(db, "users");

            const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
            const getEmail = querySnapshot.docs[0].data().emailUser;
            const getRole = querySnapshot.docs[0].data().roleUser;

            setGetCurrentEmail(getEmail);
            setGetCurrentRole(getRole);
        } catch (error) {
            console.log("user error: " + error)
        }

            try {
            // lecturers table
            const queryLecturers = await getDocs(query(lecturersCollection, where("idProject", "==", projectData.idProject)));
            if (queryLecturers.size > 0) {
                const lecturersList = queryLecturers.docs.map(doc => ({
                    ...doc.data()
                }));

                setFetchedInfoMatkul(lecturersList);

                // Seperate Day and Time
                const jadwal1 = queryLecturers.docs[0].data().scheduleLecturers.firstLecturers;
                const parts1 = jadwal1.split(" ");

                const day1 = parts1[0]; // "Day"
                const timeRange1 = parts1.slice(1).join(" "); // "Time"
                setDay1(day1);
                setTime1(timeRange1);

                const jadwal2 = queryLecturers.docs[0].data().scheduleLecturers.secondLecturers;
                const parts2 = jadwal2.split(" ");

                const day2 = parts2[0]; // "Day"
                const timeRange2 = parts2.slice(1).join(" "); // "Time"
                setDay2(day2);
                setTime2(timeRange2);
            }

            } catch (error) {
            console.log("err projects:" + error)
            }
        };
        
        console.log("Test Leak Data checkPJ")
        fetchData();
        
        }, [projectData]);

    // Handle Simpan
    const handleSimpanClick = async() => {
        console.log("Simpan Terclick")
        setButtonClicked(true)
        try {
            const lecturersCollection = collection(db, "lecturers");
            const querySnapshot = query(lecturersCollection, where("idProject", "==", projectData.idProject));

            const lecturersSnapshot = await getDocs(querySnapshot);

            const dosenPengampu = document.getElementById("dosenPengampu").value;
            const jumlahSKS = document.getElementById("jumlahSKS").value;
            const ruangKelas = document.getElementById("ruangKelas").value;
            const jadwal1 = document.getElementById("jadwal1").value;
            const jadwal2 = document.getElementById("jadwal2").value;
            const linkWa = document.getElementById("linkWa").value;

            if (lecturersSnapshot.size === 0) {
                // No existing document found, add a new one
                const setIdLecturers = `${uuidv4()}`
                try {
                  const docRef = await addDoc(lecturersCollection, {
                    idLecturers: `lecturers-${setIdLecturers}`, 
                    idProject: projectData.idProject,
                    nameLecturers: dosenPengampu,
                    sksLecturers: jumlahSKS,
                    roomLecturers: ruangKelas,
                    scheduleLecturers: {
                        firstLecturers: jadwal1,
                        secondLecturers: jadwal2 ? jadwal2 : "null"
                    },
                    groupLinkLecturers: linkWa ? linkWa : "null",
                  });
                    setCount(3);
                    setTersimpan(true);
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 3500);

                  console.log("Document written with ID: ", docRef.id);
                } catch (e) {
                  console.error("Error adding document: ", e);
                }
              } else {
                // Document with the same idUsers already exists, handle accordingly
                console.log("Document with the same idProject already exists (jalankan update)");
                const doc = lecturersSnapshot.docs[0];
                try {
                    await updateDoc(doc.ref, {
                      nameLecturers: dosenPengampu ? dosenPengampu : "null",
                      sksLecturers: jumlahSKS ? jumlahSKS : "null",
                      roomLecturers: ruangKelas ? ruangKelas : "null",
                      scheduleLecturers: {
                          firstLecturers: jadwal1 ? jadwal1 : "null",
                          secondLecturers: jadwal2 ? jadwal2 : "null"
                      },
                      groupLinkLecturers: linkWa ? linkWa : "null",
                    });
                    setCount(3);
                    setTersimpan(true);
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 3500);
                    console.log("Updated Data Completed!!!");
                  } catch (e) {
                    console.error("Error updating document ERROR: ", e);
                  }
              }
        } catch (error) {
            console.log("Error semua maszzeh: " + error)
        }

    }

    

    return (
    <>
    {/* Modal Tersimpan */}
    <Transition.Root show={tersimpan} as={Fragment}>
            <Dialog as="div" className="relative" initialFocus={cancelButtonRefTersimpan} onClose={setTersimpan}>
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
                            Data berhasil disimpan
                            </Dialog.Title>
                            <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Informasi Mata Kuliah berhasil tersimpan, refresh halaman dalam {count} detik
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
    {projectData ? (
         <div className="min-h-full">
         <Navbar />
         
         <header className="bg-white drop-shadow-md">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {projectData.nameProject} {projectData.nameProject.includes("-") ? '' : `- ${projectData.labelProject}`}
                </h1>
            </div>
         </header>

         {/* Start - Content */}
         <main>
         <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">

        <div className="grid grid-rows-1 md:grid-rows-3 md:grid-flow-col gap-4 px-2">
            {/* Section 1 */}
            <div className={`row-span-3 ${!buttonEdit ? "h-96" : ""} col-span-7 md:col-span-1 bg-gray-50 border-2 border-gray-300/40 shadow-md rounded-md`}>
                <div className="inline-flex bg-gray-300/40 w-full rounded-t-md p-2">
                    <div className="bg-gray-100 text-gray-800  items-center px-1.5 py-0.5 mt-0.5 rounded-md">
                        <BookOpenIcon className="h-5 w-5 mt-0.5 text-gray-600" aria-hidden="true" />
                    </div>
                    <div className="text-xl font-medium ml-1.5 text-gray-700">Informasi Matkul</div>
                    {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                    <>
                        <button
                            onClick={() => setButtonEdit(true)}
                            className={`${buttonEdit ? "hidden" : ""} transition-all duration-100 sclae-100 hover:scale-105 hover:-translate-y-0.5 ml-auto`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-700">
                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setButtonEdit(false)}
                            className={`${!buttonEdit ? "hidden" : ""}  ml-auto`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-700">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </>
                    )}

                    {getCurrentRole === "admin" && (
                    <>
                        <button
                            onClick={() => setButtonEdit(true)}
                            className={`${buttonEdit ? "hidden" : ""} transition-all duration-100 sclae-100 hover:scale-105 hover:-translate-y-0.5 ml-auto`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-700">
                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setButtonEdit(false)}
                            className={`${!buttonEdit ? "hidden" : ""}  ml-auto`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-700">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </>
                    )}

                </div>
                {fetchedInfoMatkul.length > 0 ? (
                    <>
                    {fetchedInfoMatkul.map((dosen) => 
                    <>
                        <div key={dosen.idLecturers}  className="px-4 py-4 grid">
                            <dt className="text-md font-bold leading-6 text-gray-900">Dosen Pengampu</dt>
                                    <dd className={`mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 ${buttonEdit ? "hidden" : ""} `}>
                                            {dosen.nameLecturers}
                                    </dd>
                            <input
                                defaultValue={`${dosen.nameLecturers}`}
                                placeholder="Nama dosen pengampu"
                                type="text" 
                                name="dosenPengampu" 
                                id="dosenPengampu"
                                // defaultValue={`${projectData.labelProject}`}
                                className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                                ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                            </input>
                        </div>
                        <div className="px-4 grid">
                            <dt className="text-md font-bold leading-6 text-gray-900">Jumlah SKS</dt>
                            <dd className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0`}>{dosen.sksLecturers} SKS</dd>
                            <input
                                defaultValue={`${dosen.sksLecturers}`}
                                placeholder="SKS (ex :2, 3, 4)"
                                type="text" 
                                name="jumlahSKS" 
                                id="jumlahSKS"
                                // defaultValue={`${projectData.labelProject}`}
                                className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                                ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                            </input>
                        </div>
                                
                        <div className="px-4 py-4 grid">
                            <div className="inline-flex">
                                <dt className="text-md font-bold leading-6 text-gray-900 mr-1">Jadwal Kuliah</dt>
                                <dd className="text-sm leading-6 text-gray-700">{`${dosen.roomLecturers !== "null" ? `(${dosen.roomLecturers})` : ""}`}</dd>
                            </div>
                            {/* Loop This */}
                            <div className={`${buttonEdit ? "hidden" : ""} inline-flex bg-indigo-100 rounded-md py-1 px-2  border-2 border-indigo-400/10 mb-1`}>
                                <dd className="text-sm leading-6 text-gray-700">{day1}</dd>
                                <dd className="text-sm leading-6 text-gray-700 ml-auto">{time1}</dd>
                                
                            </div>
                            <div className={`${buttonEdit ? "hidden" : ""} ${dosen.scheduleLecturers.secondLecturers === "null" ? "hidden" : ""}
                            inline-flex bg-indigo-100 rounded-md py-1 px-2  border-2 border-indigo-400/10 mb-1`}>
                                <dd className="text-sm leading-6 text-gray-700">{day2}</dd>
                                <dd className="text-sm leading-6 text-gray-700 ml-auto">{time2}</dd>
                            </div>
                            {/* End Loop This */}

                            {/* Form Khusus Jadwal */}
                            <input
                                defaultValue={`${dosen.roomLecturers}`}
                                placeholder="Ruang kelas (ex:Q310)"
                                type="text" 
                                name="ruangKelas" 
                                id="ruangKelas"
                                // defaultValue={`${projectData.labelProject}`}
                                className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                                ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                            </input>
                            <input
                                defaultValue={`${dosen.scheduleLecturers.firstLecturers}`}
                                placeholder="Jadwal 1 (ex: Senin 09:30 - 11:10)" 
                                type="text" 
                                name="jadwal1" 
                                id="jadwal1"
                                // defaultValue={`${projectData.labelProject}`}
                                className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                                ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                            </input>
                            <input
                                defaultValue={`${dosen.scheduleLecturers.secondLecturers}`}
                                placeholder="Jadwal 2 (boleh dikosongkan)" 
                                type="text" 
                                name="jadwal2" 
                                id="jadwal2"
                                // defaultValue={`${projectData.labelProject}`}
                                className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                                ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                            </input>
                            {/* End Form Khusus Jadwal */}
                        </div>
                        <div className="px-4 grid -mt-1">
                            <dt className="text-md font-bold leading-6 text-gray-900">Grup WhatsApp</dt>
                            {dosen.groupLinkLecturers === "null" || dosen.groupLinkLecturers === "" ? (
                                <a href='/#'
                                className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 text-blue-700`}>
                                    Belum ada link group
                                </a>
                            ) : (
                                <a href={`${dosen.groupLinkLecturers}`} target='_blank' rel="noreferrer" className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 text-blue-700`}>
                                    Link Group WhatsApp
                                </a>
                            )}
                            <input
                                defaultValue={`${dosen.groupLinkLecturers}`}
                                placeholder="Masukkan link"
                                type="text" 
                                name="linkWa" 
                                id="linkWa"
                                // defaultValue={`${projectData.labelProject}`}
                                className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                                ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                            </input>
                        </div>
                    </>
                )}
                    </>
                ) : (
                    <>
                        <div  className="px-4 py-4 grid">
                            <dt className="text-md font-bold leading-6 text-gray-900">Dosen Pengampu</dt>
                                    <dd className={`mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 ${buttonEdit ? "hidden" : ""} `}>
                                        Belum ada dosen pengampu
                                    </dd>
                            <input
                                defaultValue={``}
                                placeholder="Nama dosen pengampu"
                                type="text" 
                                name="dosenPengampu" 
                                id="dosenPengampu"
                                // defaultValue={`${projectData.labelProject}`}
                                className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                                ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                            </input>
                        </div>
                        <div className="px-4 grid">
                            <dt className="text-md font-bold leading-6 text-gray-900">Jumlah SKS</dt>
                            <dd className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0`}>0 SKS</dd>
                            <input
                                defaultValue={``}
                                placeholder="SKS (ex :2, 3, 4)"
                                type="text" 
                                name="jumlahSKS" 
                                id="jumlahSKS"
                                // defaultValue={`${projectData.labelProject}`}
                                className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                                ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                            </input>
                        </div>
                                
                        <div className="px-4 py-4 grid">
                            <div className="inline-flex">
                                <dt className="text-md font-bold leading-6 text-gray-900 mr-1">Jadwal Kuliah</dt>
                                <dd className="text-sm leading-6 text-gray-700">{``}</dd>
                            </div>
                            {/* Loop This */}
                            <div className={`${buttonEdit ? "hidden" : ""} inline-flex bg-indigo-100 rounded-md py-1 px-2  border-2 border-indigo-400/10 mb-1`}>
                                <dd className="text-sm leading-6 text-gray-700">null</dd>
                                <dd className="text-sm leading-6 text-gray-700 ml-auto">null</dd>
                                
                            </div>
                            <div className={`${buttonEdit ? "hidden" : ""} 
                            inline-flex bg-indigo-100 rounded-md py-1 px-2  border-2 border-indigo-400/10 mb-1`}>
                                <dd className="text-sm leading-6 text-gray-700">null</dd>
                                <dd className="text-sm leading-6 text-gray-700 ml-auto">null</dd>
                            </div>
                            {/* End Loop This */}

                            {/* Form Khusus Jadwal */}
                            <input
                                defaultValue={``}
                                placeholder="Ruang kelas (ex:Q310)"
                                type="text" 
                                name="ruangKelas" 
                                id="ruangKelas"
                                // defaultValue={`${projectData.labelProject}`}
                                className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                                ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                            </input>
                            <input
                                defaultValue={``}
                                placeholder="Jadwal 1 (ex: Senin 09:30 - 11:10)" 
                                type="text" 
                                name="jadwal1" 
                                id="jadwal1"
                                // defaultValue={`${projectData.labelProject}`}
                                className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                                ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                            </input>
                            <input
                                defaultValue={``}
                                placeholder="Jadwal 2 (boleh dikosongkan)" 
                                type="text" 
                                name="jadwal2" 
                                id="jadwal2"
                                // defaultValue={`${projectData.labelProject}`}
                                className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                                ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                            </input>
                            {/* End Form Khusus Jadwal */}
                        </div>
                        <div className="px-4 grid -mt-1">
                            <dt className="text-md font-bold leading-6 text-gray-900">Grup WhatsApp</dt>
                                <a href='/#'
                                  className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 text-blue-700`}>
                                    Belum ada link group
                                </a>
                            <input
                                defaultValue={``}
                                placeholder="Masukkan link"
                                type="text" 
                                name="linkWa" 
                                id="linkWa"
                                // defaultValue={`${projectData.labelProject}`}
                                className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                                ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                            </input>
                        </div>
                    </>
                )}
                
                {/* Simpan */}
                <div className="mt-6 flex items-center justify-end px-4 py-3 sm:gap-4 sm:px-0">
                    {buttonClicked ? (
                        <button
                            disabled
                            type="submit"
                            className={`${!buttonEdit ? "hidden" : "mr-0 -mt-6 sm:mr-4"} animate-pulse rounded-md bg-indigo-600 px-10 py-2 text-sm font-semibold 
                            text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                            >
                        Loading...
                        </button>
                    ) : (
                        <button
                            type="submit"
                            onClick={handleSimpanClick}
                            className={`${!buttonEdit ? "hidden" : "mr-0 -mt-6 sm:mr-4"} rounded-md bg-indigo-600 px-10 py-2 text-sm font-semibold 
                            text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                            >
                        Simpan
                        </button>
                    )}
                  
                </div>
            </div>
            {/* End Section 1 */}


            {/* Section 2 */}
            <div className="col-span-7 row-span-3 bg-gray-50 border-2 border-gray-300/40 shadow-md rounded-t-md">
                <div className="inline-flex bg-gray-300/40 w-full rounded-t-md p-2">
                    <div className="bg-gray-100 text-gray-800  items-center px-1.5 py-0.5 mt-0.5 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mt-0.5">
                            <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                            <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                            <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
                        </svg>
                    </div>
                    <div className="text-xl font-medium ml-1.5 text-gray-700">Kegiatan Perkuliahan</div>
                </div>
            </div>
            {/* End Section 2 */}
        </div>

         </div>
         </main>
         {/* End - Content */}
         
     </div>
    ) : (
        <NotFound404 />
    )}
       
    </>
    )
}

export default ProjekKu