import React, { Fragment, useEffect, useRef, useState } from 'react'
import Navbar from '../../../../../components/Navbar/Navbar'
import { useLocation } from 'react-router-dom';
import NotFound404 from '../../../../../url/NotFound404';
import { BookOpenIcon } from '@heroicons/react/20/solid';
import { auth, db, storage } from '../../../../../config/firebase/firebase';
import { Timestamp, addDoc, collection, deleteDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, Transition } from '@headlessui/react';
import Bottom from '../../../../../components/BottomBar/Bottom';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
  } from "@material-tailwind/react";


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
            setTimeout(() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }, 150);
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

     // Modal Berita
     let [ newsIsOpen, setNewsIsOpen ] = useState(false)

     const [ judulBerita, setJudulBerita ] = useState('')
     const [ detailBerita, setDetailBerita ] = useState('')

     const [ errorMessageJudulBerita, setErrorMessageJudulBerita ] = useState('')
     const [ errorMessageDetailBerita, setErrorMessageDetailBerita ] = useState('')

     const [ buatBeritaText, setBuatBeritaText ] = useState(false)

     function newsCloseModal() {
       setNewsIsOpen(false)
     }
   
     function newsOpenModal() {
       setNewsIsOpen(true)
       setJudulBerita("");
       setDetailBerita(""); 
     }

     const handleJudulBerita = (e) => {
        setJudulBerita(e.target.value);
        setErrorMessageJudulBerita("")
    }
    
    const handleDetailBerita = (e) => {
        setDetailBerita(e.target.value);
        setErrorMessageDetailBerita("")
    }

    const judulBeritaValidation = () => {
        if (judulBerita === "") {
            setErrorMessageJudulBerita("Judul berita harus diisi.");
        }
    }

    const detailBeritaValidation = () => {
        if (detailBerita === "") {
            setErrorMessageDetailBerita("Detail berita harus diisi.");
        }
    }
     
    const handleBuatBerita = async () => {   
        if (judulBerita === "" || 
            detailBerita === "") {
                judulBeritaValidation();
                detailBeritaValidation();
            } else {
                setBuatBeritaText(true);
                try {
                    const newsCollection = collection(db, "news");

                        const setIdNews = `${uuidv4()}`
                        // Get the current Firestore timestamp
                        const currentTimestamp = Timestamp.now();

                        // Convert the timestamp to a JavaScript Date object
                        const currentDate = currentTimestamp.toDate();

                        // Define month names in Indonesian
                        const monthNames = [
                        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                        ];

                        // Pad single digits with leading zero
                        const padWithZero = (num) => (num < 10 ? '0' : '') + num;

                        // Format the date string according to Indonesian locale
                        const currentDateString = `${padWithZero(currentDate.getDate())} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}, Pukul ${padWithZero(currentDate.getHours())}:${padWithZero(currentDate.getMinutes())}:${padWithZero(currentDate.getSeconds())}`;
                            
                        

                        try {
                          const docRef = await addDoc(newsCollection, {
                            idNews: `news-${setIdNews}`, 
                            idProject: projectData.idProject,
                            titleNews: judulBerita ? judulBerita : "null",
                            descriptionNews: detailBerita ? detailBerita : "null",
                            createdAt: currentDateString ? currentDateString : "null",
                          });
                            setCount(3);
                            setTersimpan(true);
                            setNewsIsOpen(false)
                            setTimeout(() => {
                                window.location.reload();
                            }, 3500);
        
                          console.log("Document written with ID: ", docRef.id);
                        } catch (e) {
                          console.error("Error adding document: ", e);
                        }
                        
                } catch (error) {
                    console.log("Error semua maszzeh: " + error)
                }
            }
    }

    const [ fetchedBerita, setFetchedBerita ] = useState([]);

    try {
        useEffect(() => {
            const fetchDataBerita = async () => {
            try {
                const newsCollection = collection(db, "news");
                const orderedQuery = query(newsCollection, where("idProject", "==", projectData.idProject), orderBy("createdAt", "asc")); // Assuming projectData is available
                
                const snapshot = await getDocs(orderedQuery);
                const fetchedDataBerita = snapshot.docs.map(doc => ({
                    idNews: doc.data().idNews,
                    titleNews: doc.data().titleNews,
                    descriptionNews: doc.data().descriptionNews,
                    createdAt: doc.data().createdAt,
                }));
                setFetchedBerita(fetchedDataBerita);
                console.log("test leak data");
            } catch (error) {
                console.log("Error fetching data: ", error);
            }
            };
        
            // Invoke the fetch function
            console.log("test leak data");
            fetchDataBerita();
        }, [projectData.idProject]);
    } catch (error) {
        console.log(error);
    }

    // Initialize the state to manage open states of multiple accordions
    const [openAcc, setOpenAcc] = useState(fetchedBerita.map(() => true));

    // Function to toggle the open state of an accordion
    const handleToggleAcc = (index) => {
        setOpenAcc(prevOpenAcc => {
            const newOpenAcc = [...prevOpenAcc];
            newOpenAcc[index] = !newOpenAcc[index];
            return newOpenAcc;
        });
    };

     // Hapus Berita
     const [ openHapusBerita, setOpenHapusBerita ] = useState(false);
     const [ yakinHapusBeritaText, setYakinHapusBeritaText ] = useState(false)
     const cancelButtonRefBerita = useRef(null);

     const [ deleteIdNews, setDeleteIdNews ] = useState('')

     const handleHapusBerita = async () => {
        console.log("handle Hapus is working: " + deleteIdNews);
        setYakinHapusBeritaText(true);
        try {
            const newsCollection = collection(db, "news");
    
            const querySnapshot = await getDocs(query(newsCollection,
                where("idNews", "==", deleteIdNews)
            ));

            if (querySnapshot.size === 0) {
                  console.log("Tidak ketemu id yang akan di hapus");
              } else if (querySnapshot.size === 1){
                // Document with the same idUsers already exists, handle accordingly
                querySnapshot.forEach(async (doc) => {
                    try {
                        await deleteDoc(doc.ref);
                        console.log("Document successfully deleted!");
                        setTimeout(() => {
                            window.location.reload();
                        }, 250);
                    } catch (error) {
                        console.error("Error deleting document: ", error);
                    }
                });
                
              } else {
                console.log("ada 2 result yang akan di hapus");
              }

        } catch (error) {
            console.error("Error getting documents: ", error);
        }
    }


    // Modal Deadline
    let [ deadlineIsOpen, deadlineSetIsOpen ] = useState(false)

    function deadlineCloseModal() {
      deadlineSetIsOpen(false)
    }
  
    function deadlineOpenModal() {
      deadlineSetIsOpen(true)
    }

    // Form Deadline
    const [ namaTugas, setNamaTugas ] = useState('')
    const [ tanggalTugas, setTanggalTugas ] = useState('')
    const [ jamTugas, setJamTugas ] = useState('')
    const [ menitTugas, setMenitTugas ] = useState('')

    const [ errorMessageNamaTugas, setErrorMessageNamaTugas ] = useState('')
    const [ errorMessageTanggalTugas, setErrorMessageTanggalTugas ] = useState('')

    const [ buatDeadlineText, setBuatDeadlineText] = useState(false)


    const handleNamaTugas = (e) => {
        setNamaTugas(e.target.value)
        setErrorMessageNamaTugas('')
    }

    const namaTugasValidation = () => {
        if (namaTugas === '') {
            setErrorMessageNamaTugas("Nama tugas harus diisi.")
        }
    }
    
    const handleTanggalDeadline = (e) => {
        setTanggalTugas(e.target.value)
        setErrorMessageTanggalTugas('')
    }

    const tanggalTugasValidation = () => {
        if (tanggalTugas === '') {
            setErrorMessageTanggalTugas("Tanggal tugas harus diisi.")
        }
    }

    const handleJamDeadline = (e) => {
        setJamTugas(e.target.value)
    }
    
    const handleMenitDeadline = (e) => {
        setMenitTugas(e.target.value)
    }

    const handleBuatDeadline = async () => {
        console.log("Nama: " + namaTugas);
        console.log("Tanggal: " + tanggalTugas);
        console.log("Jam: " + jamTugas);
        console.log("Menit: " + menitTugas);
        if (namaTugas === '' || tanggalTugas === '') {
            namaTugasValidation();
            tanggalTugasValidation();
        } else {
            setBuatDeadlineText(true)
            try {
                const deadlineCollection = collection(db, "deadlines");
    
                    const setIdDeadlines = `${uuidv4()}`
                    try {
                      const docRef = await addDoc(deadlineCollection, {
                        idDeadline: `deadline-${setIdDeadlines}`, 
                        idProject: projectData.idProject,
                        nameDeadline: namaTugas ? namaTugas : "null",
                        dateDeadline: tanggalTugas ? tanggalTugas : "null",
                        hourDeadline: jamTugas  ? jamTugas : "00",
                        minuteDeadline: menitTugas ? menitTugas : "00",
                      });
                        setCount(3);
                        setTersimpan(true);
                        deadlineSetIsOpen(false)
                        setTimeout(() => {
                            window.location.reload();
                        }, 3500);
    
                      console.log("Document written with ID: ", docRef.id);
                    } catch (e) {
                      console.error("Error adding document: ", e);
                    }
                    
            } catch (error) {
                console.log("Error semua maszzeh: " + error)
            }
        }
    }

    const [ fetchedDeadlines, setFetchedDeadlines ] = useState([]);
    const [ fetchedDeadlinesTime, setFetchedDeadlinesTime ] = useState([]);

    try {
        useEffect(() => {
            const fetchDataDeadline = async () => {
            try {
                const deadlinesCollection = collection(db, "deadlines");
                const orderedQuery = query(deadlinesCollection, where("idProject", "==", projectData.idProject), orderBy("dateDeadline", "asc")); // Assuming projectData is available
                
                const snapshot = await getDocs(orderedQuery);
                const fetchedDataDeadlines = snapshot.docs.map(doc => ({
                idDeadline: doc.data().idDeadline,
                nameDeadline: doc.data().nameDeadline,
                dateDeadline: doc.data().dateDeadline,
                hourDeadline: doc.data().hourDeadline,
                minuteDeadline: doc.data().minuteDeadline,
                }));
                const fetchedDataDeadlinesTime = snapshot.docs.map(doc => ({
                    targetDate: new Date(`${doc.data().dateDeadline}T${doc.data().hourDeadline}:${doc.data().minuteDeadline}:00+07:00`),
                }));
                setFetchedDeadlines(fetchedDataDeadlines);
                setFetchedDeadlinesTime(fetchedDataDeadlinesTime);
                console.log("test leak data");
            } catch (error) {
                console.log("Error fetching data: ", error);
            }
            };
        
            // Invoke the fetch function
            console.log("test leak data");
            fetchDataDeadline();
        }, [projectData.idProject]);
    } catch (error) {
        console.log(error);
    }
    

    const [ timeRemaining, setTimeRemaining ] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
        setTimeRemaining(getTimeRemaining());
            }, 1000);
        return () => clearInterval(interval);
    }, );

    function getTimeRemaining() {
        const now = new Date();
        const remainingTimes = fetchedDeadlinesTime.map(deadlineTime => {
        const timeDifference = deadlineTime.targetDate - now;
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
        return { days, hours, minutes, seconds };
        });

        return remainingTimes;
    }

    
    // Handle Detail Deadline
    const [ indexDetailDeadline, setIndexDetailDeadline ] = useState(0);
    const [ idDeadline, setIdDeadline ] = useState('');
    const [ nameDeadline, setNameDeadline ] = useState('');
    const [ dateDeadline, setDateDeadline ] = useState('');
    const [ hourDeadline, setHourDeadline ] = useState('');
    const [ minuteDeadline, setMinuteDeadline ] = useState('');

    const handleDetailDeadline = (deadlineValue, index) => {
        document.getElementById('my_modal_2').showModal();
        setIndexDetailDeadline(index);
        setIdDeadline(deadlineValue.idDeadline);
        setNameDeadline(deadlineValue.nameDeadline);
        setDateDeadline(deadlineValue.dateDeadline);
        setHourDeadline(deadlineValue.hourDeadline);
        setMinuteDeadline(deadlineValue.minuteDeadline);
        console.log("Detail Clicked:" + nameDeadline);
       
        setDeskripsiDeadline("")
        setEditNameDeadline(false);
        setEditDetailDeadline(false);
        setDetailSaved(false);
    }

    // Set Edit Detail Deadline
    const [ editDetailDeadline, setEditDetailDeadline ] = useState(false)
    const [ detailSaved, setDetailSaved ] = useState(false)
    const [ deadlineDescription, setDeskripsiDeadline ] = useState('')

    const handleDeskripsiDeadline = (e) => {
        setDeskripsiDeadline(e.target.value);
        setDetailSaved(false);
    }

    // Fetch data description deadline
    const [ fetchedDescriptionDeadlines, setFetchedDescriptionDeadlines ] = useState([]);
    const [ finalDescription, setfinalDescription ] = useState([]);

    try {
        useEffect(() => {
            if(idDeadline) {
            const fetchDataDeadline = async () => {
            try {
                const deadlineDescriptionsCollection = collection(db, "deadlineDescriptions");
                const orderedQuery = query(deadlineDescriptionsCollection, where("idDeadline", "==", idDeadline)); // Assuming projectData is available
                
                const snapshot = await getDocs(orderedQuery);
                const fetchedDescriptionDeadlines = snapshot.docs.map(doc => ({
                    description: doc.data().description,
                }));

                setFetchedDescriptionDeadlines(fetchedDescriptionDeadlines);
                setfinalDescription(fetchedDescriptionDeadlines.map(desc => desc.description))
                console.log("Open after deadline clicked :D");
            } catch (error) {
                console.log("Error fetching data: ", error);
            }
            };
            console.log("test leak data");
            fetchDataDeadline();
         }
        }, [idDeadline, dateDeadline, hourDeadline, minuteDeadline]);
    } catch (error) {
        console.log(error);
    }

    // Fetch data attachment deadline
    const [ fetchedAttachmentDeadlines, setFetchedAttachmentDeadlines ] = useState([]);

    try {
        useEffect(() => {
            if(idDeadline) {
            const fetchDataDeadline = async () => {
            try {
                const deadlineAttachmentCollection = collection(db, "deadlineAttachments");
                const orderedQuery = query(deadlineAttachmentCollection, where("idDeadline", "==", idDeadline)); // Assuming projectData is available
                
                const snapshot = await getDocs(orderedQuery);
                const fetchedAttachmentDeadlines = snapshot.docs.map(doc => ({
                    nameAttachment: doc.data().nameAttachment,
                    sizeAttachment: doc.data().sizeAttachment,
                    urlAttachment: doc.data().urlAttachment,
                }));

                setFetchedAttachmentDeadlines(fetchedAttachmentDeadlines);
                console.log("Open after deadline clicked :D");
            } catch (error) {
                console.log("Error fetching data: ", error);
            }
            };
            console.log("test leak data");
            fetchDataDeadline();
         }
        }, [idDeadline]);
    } catch (error) {
        console.log(error);
    }
    
 
    const handleSimpanEditDetailDeadline = async () => {
        console.log("edit detail deadline tersimpan")
        console.log("Deskripsi Deadline: " + deadlineDescription)

        try {
            const deadlineDescriptionsCollection = collection(db, "deadlineDescriptions");
            const querySnapshot = query(deadlineDescriptionsCollection, where("idDeadline", "==", idDeadline));
            const deadlineDescriptionsSnapshot = await getDocs(querySnapshot);

            if (deadlineDescriptionsSnapshot.size === 0) {
                setDetailSaved(true);
                // No existing document found, add a new one
                const setIdDeadlineDescriptions = `${uuidv4()}`
                try {
                  const docRef = await addDoc(deadlineDescriptionsCollection, {
                    idDeadlineDescriptions: `deadlineDescriptions-${setIdDeadlineDescriptions}`, 
                    idDeadline: idDeadline,
                    description: deadlineDescription ? deadlineDescription : "Belum ada deskripsi",
                  });
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);

                  console.log("Document written with ID: ", docRef.id);
                } catch (e) {
                  console.error("Error adding document: ", e);
                }
              } else {
                  // Document with the same idUsers already exists, handle accordingly
                  setDetailSaved(true);
                console.log("Document with the same idProject already exists (jalankan update)");
                const doc = deadlineDescriptionsSnapshot.docs[0];
                try {
                    await updateDoc(doc.ref, {
                      description: deadlineDescription ? deadlineDescription : "Belum ada deskripsi",
                    });
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    
                    console.log("Updated Data Completed!!!");
                  } catch (e) {
                    console.error("Error updating document ERROR: ", e);
                  }
              }
        } catch (error) {
            console.log("Error semua maszzeh: " + error)
        }
    }

    // Set Edit Name Deadline
    const [ editNameDeadline, setEditNameDeadline ] = useState(false)
    const [ nameDeadlineSaved, setNameDeadlineSaved ] = useState(false)

    const handleSimpanNameDeadline = async () => {
        console.log("Simpan name deadline !!")
        try {
            const deadlinesCollection = collection(db, "deadlines");
            const querySnapshot = query(deadlinesCollection, where("idDeadline", "==", idDeadline));
            const deadlineSnapshot = await getDocs(querySnapshot);

            const editNameDeadline = document.getElementById("editNameDeadline").value;
            const editDateDeadline = document.getElementById("editDateDeadline").value;
            const editHourDeadline = document.getElementById("editHourDeadline").value;
            const editMinuteDeadline = document.getElementById("editMinuteDeadline").value;

            if (deadlineSnapshot.size === 0) {
                // No existing document found, add a new one
                console.log("error");
                setNameDeadlineSaved(true);
            } else {
                setNameDeadlineSaved(true);
                // Document with the same idUsers already exists, handle accordingly
                console.log("Document with the same idProject already exists (jalankan update)");
                const doc = deadlineSnapshot.docs[0];
                try {
                    await updateDoc(doc.ref, {
                        nameDeadline: editNameDeadline ? editNameDeadline : "Tidak ada nama tugas",
                        dateDeadline: editDateDeadline ? editDateDeadline : "2050/12/12",
                        hourDeadline: editHourDeadline ? editHourDeadline : "00",
                        minuteDeadline: editMinuteDeadline ? editMinuteDeadline : "00",
                    });
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    
                    console.log("Updated Data Completed!!!");
                  } catch (e) {
                    console.error("Error updating document ERROR: ", e);
                  }
              }
        } catch (error) {
            console.log("Error semua maszzeh: " + error)
        }
    }

    // Handle Detail Attachment
    const [ selectedDeadlineAttachmentFile, setSelectedDeadlineAttachmentFile ] = useState(null);
    const [ deadlinneAttachmentUpload, setDeadlinneAttachmentUpload ] = useState(false);
    const [ endingDeadlinneAttachmentUpload, setEndingDeadlinneAttachmentUpload ] = useState(false);
    
    
    const handleDeadlineAttachment = (event) => {
        setSelectedDeadlineAttachmentFile(event.target.files[0]);
    };
    
    // Handle Upload Deadline Attachment
    const handleUploadDeadlineAttachment = () => {
      if (!selectedDeadlineAttachmentFile) {
        console.error('No file selected.');
        return;
      }
      
      const setIdDeadlineAttachment = `${uuidv4()}`
      const nameAttachment = selectedDeadlineAttachmentFile.name;
      const sizeAttachment = parseFloat((selectedDeadlineAttachmentFile.size / (1024 * 1024)).toFixed(3));
      const fileNameAttachment = `${selectedDeadlineAttachmentFile.name}-${setIdDeadlineAttachment}`
      
      const storageRef = ref(storage, `Semester-6/${projectData.nameProject}-${projectData.labelProject}/${nameDeadline}/${fileNameAttachment}`);
      
      setDeadlinneAttachmentUpload(true);
      uploadBytes(storageRef, selectedDeadlineAttachmentFile)
        .then(async (snapshot) => {
          console.log('File uploaded successfully!', snapshot);
          try {
            const urlDeadlineAttachment = await getDownloadURL(storageRef);
            console.log('Download URL:', urlDeadlineAttachment);
            // You can use this URL to open the PDF in a browser or PDF viewer
            const deadlineAttachmentsRef = collection(db, 'deadlineAttachments');
            await addDoc(deadlineAttachmentsRef, {
                idDeadline: idDeadline,
                idDeadlineAttachment: `deadlineAttachments-${setIdDeadlineAttachment}`,
                nameAttachment: nameAttachment,
                sizeAttachment: `${sizeAttachment} mb`,
                urlAttachment: urlDeadlineAttachment,
                fileNameAttachment: `${fileNameAttachment}`,
            });
            setEndingDeadlinneAttachmentUpload(true);
            setTimeout(() => {
                window.location.reload()
            }, 1250);
            console.log("ednding upload...")
          } catch (error) {
            console.error('Error getting download URL:', error);
          }
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    };
    


    return (
    <>
    {/* Modal Hapus Berita */}
    <Transition.Root show={openHapusBerita} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRefBerita} onClose={setOpenHapusBerita}>
                <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                            <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                Yakin untuk menghapus?
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                 Apakah kamu yakin menghapus berita di mata kuliah ini? Proses ini tidak bisa dibatalkan.
                                </p>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            {yakinHapusBeritaText ? (
                                <>
                                    <button
                                        type="button"
                                        disabled
                                        className="inline-flex w-full justify-center rounded-md animate-pulse
                                         bg-indigo-400 px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
                                    >
                                        Loading...
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                                        onClick={handleHapusBerita}
                                    >
                                        Yakin
                                    </button>
                                </>
                            )}
                        <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={() => setOpenHapusBerita(false)}
                            ref={cancelButtonRefBerita}
                        >
                            Batalkan
                        </button>
                        </div>
                    </Dialog.Panel>
                    </Transition.Child>
                </div>
                </div>
            </Dialog>
            </Transition.Root>

    {/* Modal Detail Deadline */}
    <dialog id="my_modal_2" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
            <div className='flex justify-between'>
                <h3 className="font-bold text-lg mr-2">{nameDeadline}</h3>
                <div className={`lg:tooltip lg:tooltip-left ml-auto`} data-tip='Ubah deadline'>
                    {getCurrentEmail === projectData.picProject && getCurrentRole === "user" && (
                        <>
                        <button
                            onClick={() => setEditNameDeadline(true)}
                            className={`${editNameDeadline ? "hidden" : ""} transition-all duration-100 sclae-100 hover:scale-110s`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-gray-900">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setEditNameDeadline(false)}
                            className={`${editNameDeadline ? "" : "hidden"} transition-all duration-100 sclae-100 hover:scale-110`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-gray-900">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </button>
                        </>
                    )}
                    {getCurrentRole === "admin" && (
                        <>
                        <button
                            onClick={() => setEditNameDeadline(true)}
                            className={`${editNameDeadline ? "hidden" : ""} transition-all duration-100 sclae-100 hover:scale-110`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-gray-900">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setEditNameDeadline(false)}
                            className={`${editNameDeadline ? "" : "hidden"} transition-all duration-100 sclae-100 hover:scale-110`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-gray-900">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </button>
                        </>
                    )}
                </div>
            </div>
                <label className={`${editNameDeadline ? "" : "hidden"} form-control w-full max-w-xs`}>
                    <div className="label">
                        <span className="label-text">Nama Tugas</span>
                    </div>
                    <input defaultValue={`${nameDeadline}`} type="text" id='editNameDeadline' name='editNameDeadline' placeholder="Type here" className="input input-bordered w-full max-w-xs" />
                    <div className="label">
                        <span className="label-text">Tanggal Deadline</span>
                    </div>
                    <input type="date" defaultValue={`${dateDeadline}`} id='editDateDeadline' name='editDateDeadline' placeholder="Type here" className="input input-bordered w-full max-w-xs" />
                    <div className="mt-1">
                       <span className="label-text">Jam Deadline</span>
                            <div className="mt-2 sm:max-w-md">
                            <div className="flex mb-2 space-x-2 rtl:space-x-reverse">
                                <div>
                                    <label for="code-1" className="sr-only"></label>
                                    <input
                                    onChange={handleJamDeadline}
                                     autoComplete='off' defaultValue={`${hourDeadline}`} type="text" maxLength="2" id="editHourDeadline" name="editHourDeadline" placeholder='00' className="block w-12 h-9 py-3 text-sm  text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" required />
                                </div>
                                <div>
                                    <label for="code-2" className="sr-only"></label>
                                    <input
                                    onChange={handleMenitDeadline}
                                     autoComplete='off' defaultValue={`${minuteDeadline}`} type="text" maxLength="2" id="editMinuteDeadline" name="editMinuteDeadline" placeholder='00' className="block w-12 h-9 py-3 text-sm  text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" required />
                                </div>
                                <div  className="mt-1.5">WIB</div>
                            </div>
                                <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan jam, format waktu 00:00 - 24:00.</p>
                            </div>
                       </div>
                </label>
                {nameDeadlineSaved ? (
                <>
                <div className={`${editNameDeadline ? "" : "hidden"} label justify-end`}>
                    <span className="label-text-alt bg-indigo-300 text-white px-4 py-2 rounded-md">Saved</span>
                </div>
                </>
            ) : (
                <>
                <div className={`${editNameDeadline ? "" : "hidden"} label justify-end`}>
                    <span onClick={handleSimpanNameDeadline} className="label-text-alt bg-indigo-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-600">Simpan</span>
                </div>
                </>
            )}
            <div className='-mt-4'></div>
            <div className='divider'></div>
            {timeRemaining[indexDetailDeadline + 0] && (
                <>
            {timeRemaining[indexDetailDeadline].days < 0 &&
                timeRemaining[indexDetailDeadline].hours < 0 &&
                timeRemaining[indexDetailDeadline].minutes < 0 &&
                timeRemaining[indexDetailDeadline].seconds < 0 ? (
                <>
                <div className='-mt-2 font-medium'>Selesai pada: </div>
                <div className={`text-indigo-700`}>
                    Jam  {hourDeadline}:{minuteDeadline} WIB,{" "}
                    {dateDeadline}
                </div>
                </>
            ) : (
                <>  
                    <div className='-mt-2 font-medium'>Sisa Waktu: </div>
                    <div className={`${timeRemaining[indexDetailDeadline].days === 0 ? 'text-red-600' : ""}`}>
                        {timeRemaining[indexDetailDeadline].days} hari {timeRemaining[indexDetailDeadline].hours} jam{" "}
                        {timeRemaining[indexDetailDeadline].minutes} menit {timeRemaining[indexDetailDeadline].seconds} detik
                    </div>
                </>
            )}
            </>
            )}
            <div className="divider divider-start font-medium">Deskripsi Tugas</div>
            <div className='-mt-2'>
            <div className={`tooltip tooltip-left ml-auto -mt-12 float-right`} data-tip='Ubah deskripsi'>
                    {getCurrentEmail === projectData.picProject && getCurrentRole === "user" && (
                        <>
                        <button
                            onClick={() => setEditDetailDeadline(true)}
                            className={`${editDetailDeadline ? "hidden" : ""} transition-all duration-100 sclae-100 hover:scale-110`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-gray-900">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setEditDetailDeadline(false)}
                            className={`${editDetailDeadline ? "" : "hidden"} transition-all duration-100 sclae-100 hover:scale-110`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-gray-900">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </button>
                        </>
                    )}
                    {getCurrentRole === "admin" && (
                        <>
                        <button
                            onClick={() => setEditDetailDeadline(true)}
                            className={`${editDetailDeadline ? "hidden" : ""} transition-all duration-100 sclae-100 hover:scale-110`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-gray-900">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setEditDetailDeadline(false)}
                            className={`${editDetailDeadline ? "" : "hidden"} transition-all duration-100 sclae-100 hover:scale-110`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-gray-900">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </button>
                        </>
                    )}
                </div>
                {fetchedDescriptionDeadlines.length > 0 ? (
                    <>
                        {fetchedDescriptionDeadlines.map((deadline) =>
                            <>
                              {deadline.description && deadline.description.includes('\n') ? (
                                // If the description contains \n, split and map over the lines
                                deadline.description.split('\n').map((line, index) => (
                                    <p key={index}>
                                    {line.split(/\s+/).map((word, wordIndex) => {
                                        if (word.startsWith('https://')) {
                                        return <a className='text-blue-600 hover:underline' href={word} target='_blank' rel="noreferrer" key={wordIndex}>{word}</a>;
                                        }
                                        return word + ' ';
                                    })}
                                    </p>
                                ))
                                ) : (
                                // Otherwise, just render the description as is
                                <p>
                                    {deadline.description.split(/\s+/).map((word, wordIndex) => {
                                    if (word.startsWith('https://')) {
                                        return <a href={word} key={wordIndex}>{word}</a>;
                                    }
                                    return word + ' ';
                                    })}
                                </p>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <div className='mr-2'>Belum ada deskripsi</div>
                    </>
                )}
            
            </div>
            <label className={`${editDetailDeadline ? "" : "hidden"} form-control`}>
            <div className="label">
                <span className="label-text">Tuliskan deskripsi</span>
            </div>
            <textarea onChange={handleDeskripsiDeadline} defaultValue={`${finalDescription}`} className="textarea textarea-bordered h-24" placeholder="ex: Dikerjakan individu, Tidak boleh chat gpt"></textarea>
            </label>
            {detailSaved ? (
                <>
                <div className={`${editDetailDeadline ? "" : "hidden"} label justify-end`}>
                    <span className="label-text-alt bg-indigo-300 text-white px-4 py-2 rounded-md">Saved</span>
                </div>
                </>
            ) : (
                <>
                <div className={`${editDetailDeadline ? "" : "hidden"} label justify-end`}>
                    <span onClick={handleSimpanEditDetailDeadline} className="label-text-alt bg-indigo-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-600">Simpan</span>
                </div>
                </>
            )}
            <div className="divider divider-start font-medium">Lampiran</div>
            {fetchedAttachmentDeadlines.length > 0 ? (
                <>
                {fetchedAttachmentDeadlines.map((attachment) =>
                    <>
                    <div className='inline-flex'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
                            <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                        </svg>
                            <a href={attachment.urlAttachment} target='_blank' rel="noreferrer" className='mr-2 hover:underline hover:text-blue-900'>{attachment.nameAttachment}</a>
                    </div>
                    <div className='flex justify-start'>
                        <div className='font-extralight -mt-2 ml-0.5'>Ukuran: {attachment.sizeAttachment}</div>
                    </div>
                    </>
                )}
                </>
            ) : (
                <>
                     <div className='inline-flex'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
                                <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                            </svg>
                        <div className='flex justify-start'>
                            <div className='font-extralight ml-0.5'>Belum ada lampiran</div>
                        </div>
                     </div>
                </>
            )}
            
            {getCurrentRole === "admin" && (
                <>
                    <input 
                    onChange={handleDeadlineAttachment}
                    type="file" 
                    className="file-input file-input-bordered file-input-sm w-full mt-2" 
                    accept="application/pdf"/>
                    {selectedDeadlineAttachmentFile && (
                        <div>
                            <p>Ukuran file: {parseFloat((selectedDeadlineAttachmentFile.size / (1024 * 1024)).toFixed(3))} mb</p>
                        </div>
                    )}
                    <p className="text-sm leading-6 text-gray-600">Hanya bisa upload dengan format .pdf</p>
                    {deadlinneAttachmentUpload ? (
                        <>
                        {endingDeadlinneAttachmentUpload ? (
                            <>
                            <div 
                            className={`mt-2 label justify-end`}>
                                <span className="label-text-alt bg-indigo-500 text-white px-4 py-2 rounded-md">Uploaded</span>
                            </div>
                            </>
                        ) : (
                            <>
                            <div 
                            className={`mt-2 label justify-end`}>
                                <span className="label-text-alt bg-indigo-400 text-white px-4 py-2 rounded-md animate-pulse">Uploading...</span>
                            </div>
                            </>
                        )}
                        </>
                    ) : (
                        <>
                            <div 
                            onClick={handleUploadDeadlineAttachment}
                            className={`mt-2 label justify-end`}>
                                <span className="label-text-alt bg-indigo-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-600">Upload</span>
                            </div>
                        </>
                    )}
                </>
            )}
            {getCurrentRole === "user" && getCurrentEmail === projectData.picProject && (
                <>
                    <input 
                    onChange={handleDeadlineAttachment}
                    type="file" 
                    className="file-input file-input-bordered file-input-sm w-full mt-2" 
                    accept="application/pdf"/>
                    {selectedDeadlineAttachmentFile && (
                        <div>
                            <p>Ukuran file: {parseFloat((selectedDeadlineAttachmentFile.size / (1024 * 1024)).toFixed(3))} mb</p>
                        </div>
                    )}
                    <p className="text-sm leading-6 text-gray-600">Hanya bisa upload dengan format .pdf</p>
                    {deadlinneAttachmentUpload ? (
                        <>
                        {endingDeadlinneAttachmentUpload ? (
                            <>
                            <div 
                            className={`mt-2 label justify-end`}>
                                <span className="label-text-alt bg-indigo-500 text-white px-4 py-2 rounded-md">Uploaded</span>
                            </div>
                            </>
                        ) : (
                            <>
                            <div 
                            className={`mt-2 label justify-end`}>
                                <span className="label-text-alt bg-indigo-400 text-white px-4 py-2 rounded-md animate-pulse">Uploading...</span>
                            </div>
                            </>
                        )}
                        </>
                    ) : (
                        <>
                            <div 
                            onClick={handleUploadDeadlineAttachment}
                            className={`mt-2 label justify-end`}>
                                <span className="label-text-alt bg-indigo-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-600">Upload</span>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
        <form method="dialog" className="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>

    {/* Modal Berita */}
      <Transition appear show={newsIsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={newsCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Buat Berita Mata Kuliah
                  </Dialog.Title>
                  <div className="divider"></div> 
                  <div className="-mt-3">
                     <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Judul Berita
                        </label>
                            <div className="mt-2 sm:max-w-md">
                                <input
                                    autoFocus
                                    onChange={handleJudulBerita}
                                    type="text"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="off"
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errorMessageJudulBerita ? 'ring-red-600' : 'ring-gray-300'}`}
                                    />
                                    {errorMessageJudulBerita ? (
                                        <div className="text-red-500 text-sm mt-1">
                                        {errorMessageJudulBerita}
                                    </div>
                                    ) : (
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan judul berita yang akan dimasukkan.</p>
                                    )}
                            </div>
                       </div>
                  </div>
                  <div className="mt-4">
                     <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Detail Berita
                        </label>
                            <div className="mt-2 sm:max-w-md">
                                <textarea
                                    autoFocus
                                    onChange={handleDetailBerita}
                                    type="text"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="off"
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errorMessageDetailBerita ? 'ring-red-600' : 'ring-gray-300'}`}
                                    />
                                    {errorMessageDetailBerita ? (
                                        <div className="text-red-500 text-sm mt-1">
                                        {errorMessageDetailBerita}
                                    </div>
                                    ) : (
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan detail berita yang akan dimasukkan.</p>
                                    )}
                            </div>
                       </div>
                  </div>
                  <div className="divider"></div> 
                  <div className="mt-4">
                    {buatBeritaText ? (
                        <>
                        <button
                            type="submit"
                            disabled
                            className={`rounded-md bg-indigo-400 px-10 py-2 text-sm font-semibold float-right animate-pulse
                            text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                            >
                            Loading...
                        </button>
                        </>
                    ) : (
                        <>
                        <button
                            type="submit"
                            onClick={handleBuatBerita}
                            className={`rounded-md bg-indigo-600 px-10 py-2 text-sm font-semibold float-right
                            text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                            >
                            Buat
                        </button>
                        </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

    {/* Modal Deadline */}
      <Transition appear show={deadlineIsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={deadlineCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Buat Deadline Mata Kuliah - {projectData.nameProject} {projectData.nameProject.includes("-") ? '' : `(${projectData.labelProject})`}
                  </Dialog.Title>
                  <div className="divider"></div> 
                  <div className="-mt-3">
                     <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Nama Tugas
                        </label>
                            <div className="mt-2 sm:max-w-md">
                                <input
                                    autoFocus
                                    onChange={handleNamaTugas}
                                    type="text"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="off"
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errorMessageNamaTugas ? 'ring-red-600' : 'ring-gray-300'}`}
                                    />
                                    {errorMessageNamaTugas ? (
                                        <div className="text-red-500 text-sm mt-1">
                                        {errorMessageNamaTugas}
                                    </div>
                                    ) : (
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan nama tugas yang akan diberikan.</p>
                                    )}
                            </div>
                       </div>
                  </div>
                  <div className="mt-4">
                     <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Tanggal Deadline
                        </label>
                            <div className="mt-2 sm:max-w-md">
                                <input
                                    autoFocus
                                    onChange={handleTanggalDeadline}
                                    type="date"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="off"
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errorMessageTanggalTugas ? 'ring-red-600' : 'ring-gray-300'}`}
                                    />
                                {errorMessageTanggalTugas ? (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errorMessageTanggalTugas}
                                    </div>
                                    ) : (
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan tanggal deadline tugas.</p>
                                    )}
                            </div>
                       </div>
                  </div>
                  <div className="mt-4">
                     <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Jam Deadline
                        </label>
                            <div className="mt-2 sm:max-w-md">
                            <div className="flex mb-2 space-x-2 rtl:space-x-reverse">
                                <div>
                                    <label for="code-1" className="sr-only"></label>
                                    <input
                                    onChange={handleJamDeadline}
                                     autoComplete='off' type="text" maxLength="2" id="code-1" placeholder='00' className="block w-12 h-9 py-3 text-sm  text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" required />
                                </div>
                                <div>
                                    <label for="code-2" className="sr-only"></label>
                                    <input
                                    onChange={handleMenitDeadline}
                                     autoComplete='off' type="text" maxLength="2" id="code-2" placeholder='00' className="block w-12 h-9 py-3 text-sm  text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" required />
                                </div>
                                <div  className="mt-1.5">WIB</div>
                            </div>
                                <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan jam, format waktu 00:00 - 24:00.</p>
                            </div>
                       </div>
                  </div>
                  <div className="divider"></div> 
                  <div className="mt-4">
                    {buatDeadlineText ? (
                        <>
                            <button
                                type="submit"
                                disabled
                                className={`rounded-md bg-indigo-400 px-10 py-2 text-sm font-semibold float-right animate-pulse
                                text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                                >
                                Loading...
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="submit"
                                onClick={handleBuatDeadline}
                                className={`rounded-md bg-indigo-600 px-10 py-2 text-sm font-semibold float-right
                                text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                                >
                                Buat
                            </button>
                        </>
                    )}
                   
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

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
         <div className="mx-auto max-w-7xl pt-6 sm:px-6 lg:px-8">

        <div className="grid grid-rows-1 md:grid-rows-3 md:grid-flow-col gap-4 px-2">
            {/* Section 1 */}
            <div className={`row-span-3 ${!buttonEdit ? "h-96" : ""} col-span-7 md:col-span-1 bg-white border-2 border-gray-300/40 shadow-md rounded-md`}>
                <div className="inline-flex bg-gray-300/40 w-full rounded-t-md p-2">
                    <div className="bg-gray-100 text-gray-800  items-center px-1.5 py-0.5 mt-0.5 rounded-md">
                        <BookOpenIcon className="h-5 w-5 mt-0.5 text-gray-600" aria-hidden="true" />
                    </div>
                    <div className="text-xl font-medium ml-1.5 text-gray-700">Informasi Matkul</div>
                    {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                    <>
                        <div className={`${buttonEdit ? "hidden" : ""} tooltip ml-auto`} data-tip='Ubah'>
                            <button
                                onClick={() => setButtonEdit(true)}
                                className={`transition-all duration-100 sclae-100 hover:scale-110 mt-0.5`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-700">
                                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                                </svg>
                            </button>
                        </div>

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
                        <div className={`${buttonEdit ? "hidden" : ""} tooltip ml-auto`} data-tip='Ubah'>
                            <button
                                onClick={() => setButtonEdit(true)}
                                className={`transition-all duration-100 sclae-100 hover:scale-110 mt-0.5`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-700">
                                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                                </svg>
                            </button>
                        </div>


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
                                    <dd className={`mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 lg:w-56 ${buttonEdit ? "hidden" : ""} `}>
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
                                <div
                                className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 text-blue-700`}>
                                    Belum ada link group
                                </div>
                            ) : (
                                <a href={`${dosen.groupLinkLecturers}`} target='_blank' rel="noreferrer" className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 text-blue-700 hover:underline`}>
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
                                <div
                                  className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 text-blue-700`}>
                                    Belum ada link group
                                </div>
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
            <div className="col-span-7 row-span-3 bg-white border-2 border-gray-200 shadow-md rounded-t-md">
                <div className="inline-flex bg-gray-300/40 w-full rounded-t-md p-2">
                    <div className="bg-gray-100 text-gray-800  items-center px-1.5 py-0.5 mt-0.5 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mt-0.5">
                            <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                            <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                            <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
                        </svg>
                    </div>
                        <div className="text-sm mt-1 lg:text-xl lg:mt-0 font-medium ml-1.5 text-gray-700">Kegiatan Perkuliahan</div>
                        
                        <div data-dial-init className="flex ml-auto">
                            <div id="speed-dial-menu-horizontal" className="flex me-1 space-x-1 items-center">
                                <div className="tooltip scale-100 hover:scale-110 transition-all duration-200">
                                    <button  type="button" data-tooltip-target="tooltip-share tooltip"  data-tip="Share" data-tooltip-placement="top" className="flex justify-center items-center w-[30px] h-[30px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50   focus:ring-4 focus:ring-gray-300 focus:outline-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 scale-110 text-gray-600">
                                           <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                                {(getCurrentRole === "admin" || (projectData.picProject === getCurrentEmail && getCurrentRole === "user")) && (
                                    <>
                                        <div className="tooltip scale-100 hover:scale-110 transition-all duration-200" data-tip="Berita">
                                            <button
                                            onClick={newsOpenModal}
                                            type="button" data-tooltip-target="tooltip-share tooltip"  data-tip="Share" data-tooltip-placement="top" className="flex justify-center items-center w-[30px] h-[30px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50   focus:ring-4 focus:ring-gray-300 focus:outline-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 scale-110 text-gray-600">
                                                    <path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 0 0 3 3h15a3 3 0 0 1-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125ZM12 9.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H12Zm-.75-2.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75ZM6 12.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5H6Zm-.75 3.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75ZM6 6.75a.75.75 0 0 0-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-3A.75.75 0 0 0 9 6.75H6Z" clipRule="evenodd" />
                                                    <path d="M18.75 6.75h1.875c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 0 1-3 0V6.75Z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div 
                                        onClick={deadlineOpenModal}
                                        className="tooltip scale-100 hover:scale-110 transition-all duration-200" data-tip="Deadline">
                                            <button type="button" data-tooltip-target="tooltip-share tooltip"  data-tip="Share" data-tooltip-placement="top" className="flex justify-center items-center w-[30px] h-[30px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50   focus:ring-4 focus:ring-gray-300 focus:outline-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 scale-110 text-gray-600">
                                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="tooltip scale-100 hover:scale-110 transition-all duration-200">
                                            <button type="button" data-tooltip-target="tooltip-share tooltip"  data-tip="Share" data-tooltip-placement="top" className="flex justify-center items-center w-[30px] h-[30px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50   focus:ring-4 focus:ring-gray-300 focus:outline-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 scale-110 text-gray-600">
                                                    <path fillRule="evenodd" d="M19.5 21a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-5.379a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H4.5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h15Zm-6.75-10.5a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V10.5Z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                        {/* Content */}
                        <div className="card rounded-none w-auto border-2 border-gray-200">
                            <div className="card-body -mx-2 -mt-2">
                            <div className="card rounded-md w-auto bg-base-100 shadow-xl">
                                <figure><img className='lg:h-64 md:h-32 w-full object-cover' src={projectData.imageUrlProject} alt="Shoes" /></figure>
                                <div className="card-body">
                                    <h2 className="card-title mb-5 ">Berita Mata Kuliah</h2>
                                    <div className='-mt-12'></div>
                                    <div className='divider'></div>
                                    {fetchedBerita.length > 0 ? (
                                    <>
                                        <div className='-mt-5'></div>
                                        {fetchedBerita.map((berita, index) => (
                                            <Accordion className={`${openAcc[index] ? "bg-base-200/50 rounded-md transition-all duration-100 border-2 border-slate-100/90" : ""}
                                             focus:text-gray-800`} open={openAcc[index]} key={berita.idNews}>
                                                <AccordionHeader
                                                    className='p-2 rounded-md font-bold text-gray-800/90 transition-all duration-200 hover:bg-gray-100'
                                                    onClick={() => handleToggleAcc(index)}> {/* Call handleToggleAcc with the index */}
                                                    <div  className=''>
                                                        <div className='font-bold text-gray-800/70'>
                                                            {berita.titleNews}
                                                        </div>
                                                        <div className='text-sm font-light text-black ml-0.5'>
                                                            dibuat pada {berita.createdAt} WIB
                                                        </div>
                                                    </div>
                                                </AccordionHeader>
                                                <AccordionBody className="p-3 mb-2 font-normal overflow-x-scroll w-56 lg:w-full lg:overflow-hidden">
                                                    {berita.descriptionNews && berita.descriptionNews.includes('\n') ? (
                                                        // If the description contains \n, split and map over the lines
                                                        berita.descriptionNews.split('\n').map((line, index) => (
                                                            <p key={index}>
                                                            {line.split(/\s+/).map((word, wordIndex) => {
                                                                if (word.startsWith('https://')) {
                                                                return <a className='text-blue-600 hover:underline' href={word} target='_blank' rel="noreferrer" key={wordIndex}>{word}</a>;
                                                                }
                                                                return word + ' ';
                                                            })}
                                                            </p>
                                                        ))
                                                        ) : (
                                                        // Otherwise, just render the description as is
                                                        <p>
                                                            {berita.descriptionNews.split(/\s+/).map((word, wordIndex) => {
                                                            if (word.startsWith('https://')) {
                                                                return <a href={word} key={wordIndex}>{word}</a>;
                                                            }
                                                            return word + ' ';
                                                            })}
                                                        </p>
                                                        )}
                                                        {getCurrentEmail === projectData.picProject && getCurrentRole === "user" && (
                                                            <button
                                                                onClick={() => {
                                                                    setDeleteIdNews(berita.idNews)
                                                                    setOpenHapusBerita(true)
                                                                }
                                                                }
                                                                type="submit"
                                                                className={`text-sm font-semibold flex bg-red-500 rounded-md py-2 px-4 hover:bg-red-600 mt-2 lg:float-right text-white`}
                                                                >
                                                                Hapus
                                                            </button>
                                                        )}
                                                        {getCurrentRole === "admin" && (
                                                            <button
                                                                onClick={() => {
                                                                    setDeleteIdNews(berita.idNews)
                                                                    setOpenHapusBerita(true)
                                                                }
                                                                }
                                                                type="submit"
                                                                className={`text-sm font-semibold flex bg-red-500 rounded-md py-2 px-4 hover:bg-red-600 mt-2 lg:float-right text-white`}
                                                                >
                                                                Hapus
                                                            </button>
                                                        )}
                                                </AccordionBody>
                                            </Accordion>
                                        ))}
                                    </>
                                     ) : (
                                        <>
                                            <p>Belum ada berita...</p>
                                        </>
                                    )}
                                </div>
                            </div>
                                <div className='divider'></div>
                                <ul className="menu w-auto rounded-box -my-5">
                                <li>
                                    <details closed>
                                    <summary className='font-bold text-lg'>Deadline Tugas Mahasiswa</summary>
                                    <ul>
                                        <li>
                                        {fetchedDeadlines.length > 0 ?(
                                            <>
                                                {fetchedDeadlines.map((deadline, index) => (
                                                    <div key={index}>
                                                        <ul onClick={() => handleDetailDeadline(deadline, index)}>
                                                            {timeRemaining[index + 0] && (
                                                                <>
                                                                {timeRemaining[index].days < 0 &&
                                                                 timeRemaining[index].hours < 0 &&
                                                                 timeRemaining[index].minutes < 0 &&
                                                                 timeRemaining[index].seconds < 0 ? (
                                                                    <>
                                                                    <summary className={`font-medium mb-0.5`}>{deadline.nameDeadline}</summary>
                                                                    <li className={`text-indigo-700`}>
                                                                        Selesai pada:{" "}
                                                                        <br className='visible lg:hidden' />
                                                                        Jam  {deadline.hourDeadline}:{deadline.minuteDeadline} WIB,{" "}
                                                                        <br className='visible lg:hidden' />
                                                                        {deadline.dateDeadline}
                                                                    </li>
                                                                    </>
                                                                ) : (
                                                                    <>  
                                                                    <summary className={`${timeRemaining[index].minutes === -1 ? 'hidden' : ""} font-medium mb-0.5`}>{deadline.nameDeadline}</summary>
                                                                        <li className={`${timeRemaining[index].days === 0 ? 'text-red-600' : ""}`}>
                                                                            Sisa Waktu: {timeRemaining[index].days} hari {timeRemaining[index].hours} jam{" "}
                                                                            <br className='visible lg:hidden' />
                                                                            {timeRemaining[index].minutes} menit {timeRemaining[index].seconds} detik
                                                                        </li>
                                                                    </>
                                                                )}
                                                                </>
                                                            )}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                              <summary className='font-medium'>Belum ada tugas :D !!!</summary>
                                            </>
                                        )}
                                        </li>
                                    </ul>
                                    </details>
                                </li>
                                </ul>
                                <div className='divider'></div>

                            </div>
                        </div>
                        {/* End Content */}
                </div>
            {/* End Section 2 */}
        </div>
     </div>
    </main>
         {/* End - Content */}
         
         {/* Start - Content 2*/}
        <main>
        <div className="mx-auto max-w-7xl pt-6 sm:px-6 lg:px-8">

        <div className="grid grid-rows-1 md:grid-rows-3 md:grid-flow-col gap-4 px-2">

            {/* hidden, just trigerring the flex */}
                {/* Section 1 */}
                    <div className={`row-span-3 ${!buttonEdit ? "h-96" : ""} hidden lg:block lg:invisible
                     select-none cursor-default col-span-7 md:col-span-1 bg-white border-2 border-gray-300/40 shadow-md rounded-md`}>
                        <div className="inline-flex bg-gray-300/40 w-full rounded-t-md p-2">
                            <div className="bg-gray-100 text-gray-800  items-center px-1.5 py-0.5 mt-0.5 rounded-md">
                                <BookOpenIcon className="h-5 w-5 mt-0.5 text-gray-600" aria-hidden="true" />
                            </div>
                            <div className="text-xl font-medium ml-1.5 text-gray-700">Informasi Matkul</div>
                            {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                            <>
                                <div className={`${buttonEdit ? "hidden" : ""} ml-auto`}>
                                    <button
                                        disabled
                                        className={`transition-all duration-100 sclae-100 hover:scale-110 mt-0.5`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-700">
                                            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                            <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                                        </svg>
                                    </button>
                                </div>

                                <button
                                    disabled
                                    className={`${!buttonEdit ? "hidden" : ""}  ml-auto`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-700">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </>
                            )}

                            {getCurrentRole === "admin" && (
                            <>
                                <div className={`${buttonEdit ? "hidden" : ""} ml-auto`}>
                                    <button
                                        disabled
                                        className={`transition-all duration-100 sclae-100 hover:scale-110 mt-0.5`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-700">
                                            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                            <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                                        </svg>
                                    </button>
                                </div>


                                <button
                                    disabled
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
                                    <dd className={`mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 lg:w-56 ${buttonEdit ? "hidden" : ""} `}>
                                            {dosen.nameLecturers}
                                    </dd>
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
                                </div>
                            </>
                        )}
                    </div>
                {/* End Section 1 */}
            {/* hidden, just trigerring the flex */}


            {/* Section 2 */}
            <div className="col-span-7 row-span-3 bg-white border-2 border-gray-200 shadow-md rounded-t-md">
                <div className="inline-flex bg-gray-300/40 w-full rounded-t-md p-2">
                    <div className="bg-gray-100 text-gray-800  items-center px-1.5 py-0.5 mt-0.5 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mt-0.5">
                            <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                            <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                            <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
                        </svg>
                    </div>
                    <div className="text-sm mt-1 lg:text-xl lg:mt-0 font-medium ml-1.5 text-gray-700">Minggu 1 - 19 Februari 2024</div>
                </div>
                        {/* Content */}
                        <div className="card rounded-none w-auto border-2 border-gray-200">
                            <div className="card-body -mx-2 -mt-2">
                            <div className="card rounded-md w-auto">
                                <div className="card-body">
                                    <h2 className="card-title mb-5 -mx-6 -mt-10">Aktivitas</h2>
                                    <div className='-mt-12'></div>
                                    <div className='divider -mx-6'></div>
                                    <ol className="relative border-s border-gray-200 ">                  
                                        <li className="mb-10 ms-6">            
                                            <span className="absolute flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full -start-3 ring-8 ring-white ">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                            </svg>
                                            </span>
                                            <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 ">Materi Pertemuan 1</h3>
                                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 ">dibuat pada 20 Februari, 2024</time>
                                            <p className="mb-4 text-base font-normal text-gray-500   lg:w-72">Harap dibaca dengan .</p>
                                            <div className='inline-flex'>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5  text-gray-600">
                                                    <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
                                                    <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                                                </svg>
                                                    <a href="/#" target='_blank' rel="noreferrer" className='mr-2 hover:underline hover:text-gray-900'>Materi Pemrograman.pdf</a>
                                            </div>
                                            <div className='flex justify-start'>
                                                <div className='font-extralight -mt-2 ml-0.5'>Ukuran: 1.03 mb</div>
                                            </div>
                                        </li>
                                        <li className="mb-10 ms-6">
                                            <span className="absolute flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full -start-3 ring-8 ring-white ">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                            </svg>
                                            </span>
                                            <h3 className="mb-1 text-lg font-semibold text-gray-900 ">Flowbite Figma v1.3.0</h3>
                                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 ">dibuat pada 20 Februari, 2024</time>
                                            <p className="text-base font-normal text-gray-500 ">All of the pages and  </p>
                                        </li>
                                        <li className="ms-6">
                                            <span className="absolute flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full -start-3 ring-8 ring-white ">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                            </svg>
                                            </span>
                                            <h3 className="mb-1 text-lg font-semibold text-gray-900 ">Flowbite Library v1.2.2</h3>
                                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 ">dibuat pada 20 Februari, 2024</time>
                                            <p className="text-base font-normal text-gray-500 ">Get started with dozens</p>
                                        </li>
                                    </ol>


                                </div>
                            </div>
                            <div className="card-body">
                                    <h2 className="card-title mb-5 -mx-6 -mt-10">Detail Pertemuan</h2>
                                    <div className='-mt-12'></div>
                                    <div className='divider -mx-6'></div>
                                    <div className="stats stats-vertical lg:stats-horizontal shadow-md border-2 borderslate-200/50 -mt-4 ">
                                        <div className="stat overflow-x-scroll lg:overflow-hidden">
                                            <div className='inline-flex'>
                                            <div className="stat-title font-bold text-blue-600">Online</div>
                                            <div className="stat-title">/</div>
                                            <div className="stat-title">Offline</div>
                                            <div className="stat-title">/</div>
                                            <div className="stat-title">Izin</div>
                                            <div className="stat-title">/</div>
                                            <div className="stat-title">Tidak Hadir</div>
                                            </div>
                                            <div className="text-xl font-extrabold ">Tidak Hadir</div>
                                            <div className="stat-desc mt-1">07:00 - 08:30 (1 jam 30 menit)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* End Content */}
                </div>
            {/* End Section 2 */}
        </div>
     </div>
    </main>
         {/* End - Content 2*/}
     </div>
    ) : (
        <NotFound404 />
    )}
       
    <Bottom />
    </>
    )
}

export default ProjekKu