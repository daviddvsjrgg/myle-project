import React, { useState } from 'react'
import Navbar from '../../../../../components/Navbar/Navbar'
import { useLocation } from 'react-router-dom';
import NotFound404 from '../../../../../url/NotFound404';
import { BookOpenIcon } from '@heroicons/react/20/solid';

const ProjekKu = () => {

    const location = useLocation();
    const projectData = location.state ? location.state.projectData : null;

    // Set Edit Button
    const [ buttonEdit, setButtonEdit ] = useState(false)

    return (
    <>
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

        <div class="grid grid-rows-1 md:grid-rows-3 md:grid-flow-col gap-4 px-2">
            {/* Section 1 */}
            <div class={`row-span-3 ${!buttonEdit ? "h-96" : ""} col-span-7 md:col-span-1 bg-gray-100 border-2 border-gray-300/40 shadow-md rounded-md`}>
                <div className="inline-flex bg-gray-300/40 w-full rounded-t-md p-2">
                    <div className="bg-gray-100 text-gray-800  items-center px-1.5 py-0.5 mt-0.5 rounded-md">
                        <BookOpenIcon className="h-5 w-5 mt-0.5 text-gray-600" aria-hidden="true" />
                    </div>
                    <div className="text-xl font-medium ml-1.5 text-gray-700">Informasi Matkul</div>
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

                </div>
                <div className="px-4 py-4 grid">
                    <dt className="text-md font-bold leading-6 text-gray-900">Dosen Pengampu</dt>
                    <dd className={`mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 ${buttonEdit ? "hidden" : ""} `}>null</dd>
                    <input 
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
                    <dd className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0`}>null SKS</dd>
                    <input 
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
                    <dt className="text-md font-bold leading-6 text-gray-900">Jadwal Kuliah</dt>
                    {/* Loop This */}
                    <div className={`${buttonEdit ? "hidden" : ""} inline-flex bg-indigo-100 rounded-md py-1 px-2  border-2 border-indigo-400/10 mb-1`}>
                        <dd className="text-sm leading-6 text-gray-700">null</dd>
                        <dd className="text-sm leading-6 text-gray-700 ml-auto">null</dd>
                        
                    </div>
                    <div className={`${buttonEdit ? "hidden" : ""} inline-flex bg-indigo-100 rounded-md py-1 px-2  border-2 border-indigo-400/10 mb-1`}>
                        <dd className="text-sm leading-6 text-gray-700">null</dd>
                        <dd className="text-sm leading-6 text-gray-700 ml-auto">null</dd>
                    </div>
                    {/* End Loop This */}

                    {/* Form Khusus Jadwal */}
                    <input 
                        placeholder="Ruang kelas (ex:Q310)"
                        type="text" 
                        name="ruangKelas" 
                        id="ruangKelas"
                        // defaultValue={`${projectData.labelProject}`}
                        className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                        ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                    </input>
                    <input
                        placeholder="Jadwal 1 (ex: Senin 09:30-11:10)" 
                        type="text" 
                        name="jadwal1" 
                        id="jadwal1"
                        // defaultValue={`${projectData.labelProject}`}
                        className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                        ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                    </input>
                    <input
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
                    <a href='/toWA' target='_blank' rel="noreferrer" className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 text-blue-700`}>
                        Link Group WhatsApp
                    </a>
                    <input 
                        placeholder="Masukkan link"
                        type="text" 
                        name="linkWa" 
                        id="linkWa"
                        // defaultValue={`${projectData.labelProject}`}
                        className={`${!buttonEdit ? "hidden" : "mt-1"} block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                        ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`}>
                    </input>
                </div>
                {/* Simpan */}
                <div className="mt-6 flex items-center justify-end px-4 py-3 sm:gap-4 sm:px-0">
                    <button
                        type="submit"
                        className={`${!buttonEdit ? "hidden" : "mr-0 -mt-6 sm:mr-4"} rounded-md bg-indigo-600 px-10 py-2 text-sm font-semibold 
                        text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                        >
                    Simpan
                    </button>
                </div>
            </div>


            {/* Section 2 */}
            <div class="col-span-7 row-span-3 bg-gray-100 border-2 border-gray-300/40 shadow-md rounded-t-md">
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