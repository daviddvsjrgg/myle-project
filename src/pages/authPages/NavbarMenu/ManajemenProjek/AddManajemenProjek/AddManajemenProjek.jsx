import React, { useEffect } from 'react'
import Bottom from '../../../../../components/BottomBar/Bottom'
import Navbar from '../../../../../components/Navbar/Navbar'
import { PhotoIcon } from '@heroicons/react/24/solid'
import { Fragment, useState, useRef} from 'react'
import { Combobox, Transition, Dialog } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { addDoc, collection, getDocs, where, query } from 'firebase/firestore'
import { db } from '../../../../../config/firebase/firebase'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom'

const AddManajemenProjek = () => {

  const [ data, setData ] = useState([]);
  const navigate = useNavigate();
  useEffect(() =>{
    const fetchData = async () => {
      const usersCollection = collection(db, "users");

      try {
        const snapshot = await getDocs(usersCollection);
        const fetchedData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
    }
    fetchData();
  }, []);

  const [selected, setSelected] = useState(data[0])
  const [queryFilter, setQuery] = useState('')

  const filteredPeople =
    queryFilter === ''
      ? data
      : data.filter((person) =>
          person.usernameUser
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(queryFilter.toLowerCase().replace(/\s+/g, ''))
        )
        
  // Validation
  const [ namaProjek, setNamaProjek ] = useState('');
  const [ label, setLabel ] = useState('');
  const [ deskripsi, setDeskripsi ] = useState('');
  const [ droppedFile, setDroppedFile ] = useState(null);
  const [ selectedFile, setSelectedFile ] = useState(null);

  const [ errorMessageNamaProjek, setErrorMessageNamaProjek ] = useState('');
  const [ errorMessageLabel, setErrorMessageLabel ] = useState('');
  const [ errorPengguna, setErrorPengguna ] = useState('');

  // Button Tambahkan Animasi
  const [ clickedTambahkan, setClickedTambahkan] = useState(false);

  // Alert Success
  const [ success, setSuccess ] = useState(false);

  // onClick
  const handleSubmitProjek = async (e) => {
    e.preventDefault()

    const getPenggunaValidation = document.getElementById('pic').value;
    const setPenggunaValidation = getPenggunaValidation.toString();

    if (namaProjek === '' || label === '' || setPenggunaValidation === '' ) {
      namaProjekValidation();
      labelValdiation();
      
      //Validasi Pengguna
      const getPengguna = document.getElementById('pic').value;
      const setPengguna = getPengguna.toString();
      if (setPengguna === '') {
        setErrorPengguna("Penanggung jawab tidak boleh kosong")
      } else if (setPengguna !== ''){
        setErrorPengguna("")
      }  
      
    } else {
      try {
       

        const getPengguna = document.getElementById('pic').value;
        const setPengguna = getPengguna.toString();

        // Some validation hehe (to hard bro, to validate data value from db)
        if (setPengguna !== ''){
          setErrorPengguna("")
        }

        const usersCollection = collection(db, "projects");

        const querySnapshot = await getDocs(query(usersCollection,
           where("nameProject", "==", namaProjek),
           where("labelProject", "==", label)
           ));
    
        if (querySnapshot.size === 0) {
              try {
                setClickedTambahkan(true);
                 // Check if the file is dropped or selected then => Sending to Storage
                if (selectedFile !== null || droppedFile !== null) {
                  if (selectedFile !== null) {
                    setDroppedFile(null);
                    const imageName = `${uuidv4()}`
                    const sendFile = ref(getStorage(), `Projek/Gambar/${imageName}`);
                    await uploadBytes(sendFile, selectedFile).then(snapshot => {
                      console.log('File uploaded successfully:', snapshot);
                      getDownloadURL(sendFile).then(downloadURL => {
                        console.log('File download URL:', downloadURL);
                        try {
                          setTimeout(async () => {
                            try {   
                              const currentDate = new Date();
                              const options = { day: 'numeric', month: 'short' };
                              const dayAndMonth = currentDate.toLocaleDateString('id-ID', options);
                              const year = currentDate.getFullYear();
                              const formattedDateString = `${dayAndMonth}, ${year}`;
                              const docRef = await addDoc(usersCollection, {
                                idProject: `projek-${uuidv4()}`,
                                nameProject: namaProjek,
                                descriptionProject: deskripsi,
                                imageUrlProject: downloadURL,
                                imageNameProject: imageName,
                                picProject: setPengguna,
                                labelProject: label,
                                statusProject: "Private",
                                createdAt: formattedDateString,
                              });
                              console.log("Document written with ID: ", docRef.id);
                              // setSuccess(true);
                              setOpen(true);
                            } catch (error) {
                                console.log(error);
                            }
                          }, 1500);
                        } catch (error) {
                          
                        }
                      }).catch(error => {
                        console.error('Error getting download URL:', error);
                      });
                    }).catch(error => {
                      console.error('Error uploading file:', error);
                    });
                  } 
                  if (droppedFile !== null ){
                    setSelectedFile(null);
                    const imageName = `${uuidv4()}`
                    const sendFile = ref(getStorage(), `Projek/Gambar/${imageName}`);
                    await uploadBytes(sendFile, droppedFile).then(snapshot => {
                      console.log('File uploaded successfully:', snapshot);
                    getDownloadURL(sendFile).then(downloadURL => {
                      console.log('File download URL:', downloadURL);
                        setTimeout(async () => {
                          try {   
                            const currentDate = new Date();
                            const options = { day: 'numeric', month: 'short' };
                            const dayAndMonth = currentDate.toLocaleDateString('id-ID', options);
                            const year = currentDate.getFullYear();
                            const formattedDateString = `${dayAndMonth}, ${year}`;
                            const docRef = await addDoc(usersCollection, {
                              idProject: `projek-${uuidv4()}`,
                              nameProject: namaProjek,
                              descriptionProject: deskripsi,
                              imageUrlProject: downloadURL,
                              imageNameProject: imageName,
                              picProject: setPengguna,
                              labelProject: label,
                              statusProject: "Private",
                              createdAt: formattedDateString,
                            });
                            console.log("Document written with ID: ", docRef.id);
                            // setSuccess(true);
                            setOpen(true);
                          } catch (error) {
                              console.log(error);
                          }
                        }, 1500);
                      }).catch(error => {
                        console.error('Error getting download URL:', error);
                      });
                    }).catch(error => {
                      console.error('Error uploading file:', error);
                    });
                  }
                } else {
                    try {   
                      const imageName = `${uuidv4()}`
                      const currentDate = new Date();
                      const options = { day: 'numeric', month: 'short' };
                      const dayAndMonth = currentDate.toLocaleDateString('id-ID', options);
                      const year = currentDate.getFullYear();
                      const formattedDateString = `${dayAndMonth}, ${year}`;
                      const docRef = await addDoc(usersCollection, {
                        idProject: `projek-${uuidv4()}`,
                        nameProject: namaProjek,
                        descriptionProject: deskripsi,
                        imageUrlProject: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3R1ZHl8ZW58MHx8MHx8fDA%3D",
                        imageNameProject: imageName,
                        picProject: setPengguna,
                        labelProject: label,
                        statusProject: "Private",
                        createdAt: formattedDateString,
                      });
                      console.log("Document written with ID: ", docRef.id);
                      // setSuccess(true);
                      setOpen(true);
                    } catch (error) {
                        console.log(error);
                    }
                }
                
              } catch (error) {
                console.log("Error Message: " + error)
              }
            } else {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
              setErrorMessageNamaProjek("Nama projek sudah ada & label sama")
            }
      } catch (error) {
        console.log(error);
      }
    }

   

  }

  const handleNamaProjekOnChange = (e) => {
    setNamaProjek(e.target.value);
    setErrorMessageNamaProjek("");
  }

  const namaProjekValidation = () => {
    if (namaProjek === '') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      setErrorMessageNamaProjek("Nama projek tidak boleh kosong")
    }
  }

  const handleLabelOnChange = (e) => {
    setLabel(e.target.value);
    setErrorMessageLabel("");
  }

  const labelValdiation = () => {
    if (label === '') {
      setErrorMessageLabel("Label tidak boleh kosong")
    }
  }

  const handleDeskripsiOnChange = (e) => {
    setDeskripsi(e.target.value);
  }

  const [isDragOver, setIsDragOver] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  const handleDragEnter = () => {
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setSelectedFile(null);
    
    const droppedFile = e.dataTransfer.files[0];
    
    // Read the file content and set the preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target.result);
    };
    reader.readAsDataURL(droppedFile);
    setDroppedFile(droppedFile);

    console.log('Dropped file:', droppedFile);
  };

  const handleUndo = () => {
    setFilePreview(null);
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = null;
    }
    setSelectedFile(null);
    setDroppedFile(null);
  };

  const handleMasukkanFile = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        setFilePreview(event.target.result);
      };

      reader.readAsDataURL(file);
      setSelectedFile(file);
      console.log('Selected file:', file);
    }
  }

  // Modal
  const [open, setOpen] = useState(false)
  const cancelButtonRef = useRef(null)

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
                          Data berhasil disimpan
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Data kamu berhasil tersimpan, data akan muncul di halaman "Mata Kuliah" dengan Gambar, Mata Kuliah, dan Penanggung Jawab atas Matkul tersebut.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                      onClick={() => navigate('/manajemen-projek')}
                    >
                      Kembali ke Manajemen Mata Kuliah
                    </button>
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tambah Mata Kuliah</h1>
        </div>
      </header>
      {/* Start - Content */}
      <main>
        
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 p-3">
        { success && (
          <div id="alert-3" className="animate-bounce flex items-center p-4 mb-4 text-green-800 rounded-lg bg-green-200 " role="alert">
            <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <span className="sr-only">Info</span>
            <div className="ms-3 text-sm font-medium">
            Data berhasil tersimpan.
            </div>
            <button type="button" onClick={(e) => setSuccess(false)} className="ms-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8 " data-dismiss-target="#alert-3" aria-label="Close">
              <span className="sr-only">Close</span>
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
            </button  >
          </div>
        )}
            <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base font-semibold leading-7 text-gray-900">Profil Mata Kuliah</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                    Masukkan informasi Mata Kuliah kamu, pada form dibawah.
                </p>

            <div className="columns-1 mt-8">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                Nama Mata Kuliah *
              </label>
              <div className="mt-2 sm:max-w-md">
                <input
                  autoFocus
                  type="text"
                  name="first-name"
                  id="first-name"
                  onChange={handleNamaProjekOnChange}
                  autoComplete="given-name"
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                    errorMessageNamaProjek ? 'ring-red-600' : 'ring-gray-300'
                  }`}
                />
                {errorMessageNamaProjek && (
                  <div className="text-red-500 text-sm mt-1">
                      {errorMessageNamaProjek}  
                  </div>
                )}
                <p className="mt-3 text-sm leading-6 text-gray-600">Nama bersifat permanen dan tidak bisa diubah.</p>
              </div>
            </div>
                </div>
            </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                   
                </div>

                    <div className="col-span-full">
                    <label htmlFor="text-area-projek" className="block text-sm font-medium leading-6 text-gray-900">
                        Deskripsi Mata Kuliah
                    </label>
                    <div className="mt-2">
                        <textarea
                        id="text-area-projek"
                        name="text-area-projek"
                        rows={3}
                        onChange={handleDeskripsiOnChange}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        defaultValue={''}
                        />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-600">Tulis deskripsi Mata Kuliah yang akan dibuat.</p>
                    </div>


                    <div className="col-span-full">
                    <label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-gray-900">
                        Cover Photo
                    </label>
                        <div 
                         onDragEnter={handleDragEnter}
                         onDragLeave={handleDragLeave}
                         onDragOver={(e) => e.preventDefault()}
                         onDrop={handleDrop}
                        className={`mt-2 flex justify-center rounded-lg border ${isDragOver ? 'border-indigo-600 border-dashed' : 'border-dashed'} bg-white border-gray-900/25 px-6 py-10`}>
                          <div className="text-center">
                          {filePreview ? (
                            <>
                            <img src={filePreview} alt="File Preview" className="mx-auto border-2 object-contain h-64 w-auto px-1 py-1" />
                            <button
                              onClick={handleUndo}
                              className="mt-2 bg-white text-indigo-600 border border-indigo-600 px-2 py-1 rounded-md hover:border-red-600 hover:text-red-600"
                              >
                              Batalkan
                            </button>
                            </>
                          ) : (
                            <>
                            <PhotoIcon className="mx-auto h-44 w-12 text-gray-300" aria-hidden="true" />
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-offset-2 hover:text-indigo-500"
                                >
                                <span>Masukkan File</span>
                                <input 
                                onChange={handleMasukkanFile}
                                accept="image/*"
                                id="file-upload" name="file-upload" type="file" className="sr-only" />
                                </label>
                                <p className="pl-1">atau drag and drop</p>
                            </div>
                            </>
                          )}
                          <p className="text-xs leading-5 text-gray-600 mt-2">PNG/JPG. Maksimal (-)</p>
                          </div>
                        </div>
                        
                    </div>
                
                </div>
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                    <label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-gray-900">
                        Penanggung Jawab *
                    </label>
                <Combobox  defaultValue={selected} onChange={setSelected}>
                  <div className="relative mt-2">
                    <div className="relative w-full cursor-default overflow-hidden bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible focus-visible:ring-offset-2 focus-visible:ring-offset-1-300 sm:text-sm">
                      <Combobox.Input
                        placeholder='Cari penanggung jawab...'
                        id="pic"
                        name="pic"
                        autoComplete="off"
                        className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                          errorPengguna ? 'ring-red-600' : 'ring-gray-300'
                        }`}
                        displayValue={(person) => person.emailUser}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                      afterLeave={() => setQuery('')}
                    >
                      <Combobox.Options 
                      className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredPeople.length === 0 && queryFilter !== '' ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Tidak ditemukan.
                          </div>
                        ) : (
                          filteredPeople.map((person) => (
                            <Combobox.Option
                              key={person.idUser}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-indigo-500 text-white' : 'text-gray-900'
                                }`
                              }
                              value={person}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    }`}
                                  >
                                    {person.usernameUser} - {person.emailUser} 
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-teal-600'
                                      }`}
                                    >
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Transition>
                    {errorPengguna && (
                      <div className="text-red-500 text-sm mt-1 pl-1">
                          {errorPengguna}  
                      </div>
                    )}
                    <p className="mt-3 text-sm leading-6 text-gray-600 pl-1">Pilih penanggung jawab dari users untuk mengatur Mata Kuliah.</p>
                  </div>
                </Combobox>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Label *</label>
                  <div className="mt-2">
                    <input 
                      placeholder='ex:Bilingual, Private, atau Lain-lain'
                      type="text" 
                      name="last-name" 
                      id="last-name" 
                      onChange={handleLabelOnChange}
                      autoComplete="family-name" 
                      className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                        errorMessageLabel ? 'ring-red-600' : 'ring-gray-300'
                      }`}>
                    
                    </input>
                    {errorMessageLabel && (
                      <div className="text-red-500 text-sm mt-1 pl-1">
                          {errorMessageLabel}  
                      </div>
                    )}
                    <p className="mt-3 pl-1 text-sm leading-6 text-gray-600">Label akan menjadi tagline Mata Kuliah.</p>
                  </div>
                </div>
              </div>

                </div>
             </div>

              <div className="mt-6 flex items-center justify-end gap-x-6">
                  { clickedTambahkan ? (
                     <button
                     type="submit"
                     disabled
                     className="animate-pulse animate-infinite rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                     >
                   Loading...
                   </button>
                   
                  )
                    :
                    (
                      <button
                        type="submit"
                        onClick={handleSubmitProjek}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                      Tambahkan
                      </button>
                    )
                }
              </div>
        </div>
      </main>
      {/* End - Content */}
      
      <Bottom />
    </div>
  )
}

export default AddManajemenProjek