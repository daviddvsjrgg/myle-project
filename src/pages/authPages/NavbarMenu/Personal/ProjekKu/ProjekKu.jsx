import React, { Fragment, useEffect, useRef, useState } from 'react'
import Navbar from '../../../../../components/Navbar/Navbar'
import { Link, useLocation } from 'react-router-dom';
import { BookOpenIcon } from '@heroicons/react/20/solid';
import { auth, db, storage } from '../../../../../config/firebase/firebase';
import { Timestamp, addDoc, collection, deleteDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, Transition } from '@headlessui/react';
import Bottom from '../../../../../components/BottomBar/Bottom';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import BaseLoading from '../../../../../components/Loading/BaseLoading/BaseLoading';


const ProjekKu = () => {
    const location = useLocation();
    const projectData = location.state ? location.state.projectData : null;

    // Download Materi
    // const handleDownload = async () => {
    //     console.log("download clicked")
    // }

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
    const [ getCurrentImage, setGetCurrentImage ] = useState("")
    const [ getCurrentUsername, setGetCurrentUsername ] = useState("")

    // Countdown
    const [count, setCount] = useState(null);

    // loading
    const [ isLoading, setIsLoading ] = useState(true);

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
        localStorage.setItem('navbarClicked', "manajemenPersonalClicked");
        const lecturersCollection = collection(db, "lecturers");

        try {
            const user = auth.currentUser;
            const usersCollection = collection(db, "users");

            const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
            const getEmail = querySnapshot.docs[0].data().emailUser;
            const getRole = querySnapshot.docs[0].data().roleUser;
            const getImage = querySnapshot.docs[0].data().imageUser;
            const getUsername = querySnapshot.docs[0].data().usernameUser;

            setGetCurrentEmail(getEmail);
            setGetCurrentRole(getRole);
            setGetCurrentImage(getImage);
            setGetCurrentUsername(getUsername);

            setTimeout(() => {
                setIsLoading(false)
            }, 1400);
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
                        const user = auth.currentUser;
                       
                        const usersCollection = collection(db, "users");
                        const querySnapshot = await getDocs(query(usersCollection, where("idUser", "==", user.uid)));
                        const userName = querySnapshot.docs[0].data().usernameUser;
                        const userImage = querySnapshot.docs[0].data().imageUser;
                        const userRole = querySnapshot.docs[0].data().roleUser;

                        try {
                          const docRef = await addDoc(newsCollection, {
                            idNews: `news-${setIdNews}`, 
                            idProject: projectData.idProject,
                            titleNews: judulBerita ? judulBerita : "null",
                            descriptionNews: detailBerita ? detailBerita : "null",
                            createdAt: currentDateString ? currentDateString : "null",
                            publisherNews: {
                                userName: userName,
                                userImage: userImage,
                                userRole: userRole,
                            },
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
                const orderedQuery = query(newsCollection, where("idProject", "==", projectData.idProject), orderBy("createdAt", "desc")); // Assuming projectData is available
                
                const snapshot = await getDocs(orderedQuery);
                const fetchedDataBerita = snapshot.docs.map(doc => ({
                    idNews: doc.data().idNews,
                    titleNews: doc.data().titleNews,
                    descriptionNews: doc.data().descriptionNews,
                    createdAt: doc.data().createdAt,
                    publisherNews: {
                        userName:  doc.data().publisherNews.userName,
                        userImage:  doc.data().publisherNews.userImage,
                        userRole:  doc.data().publisherNews.userRole,
                    },
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

    const [ selectedDeadlineAttachmentFile, setSelectedDeadlineAttachmentFile ] = useState(null); // Just for delete attachment
    const [ errorMessageUploadDeadlineAttachments, setErrorMessageUploadDeadlineAttachments ] = useState(""); // delete error message

    const [ indexDetailDeadline, setIndexDetailDeadline ] = useState(0);
    const [ idDeadline, setIdDeadline ] = useState('');
    const [ nameDeadline, setNameDeadline ] = useState('');
    const [ dateDeadline, setDateDeadline ] = useState('');
    const [ hourDeadline, setHourDeadline ] = useState('');
    const [ minuteDeadline, setMinuteDeadline ] = useState('');

    const handleDetailDeadline = (deadlineValue, index) => {
        setSelectedDeadlineAttachmentFile(null)
        setErrorMessageUploadDeadlineAttachments("")
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
            try {
                if(idDeadline) {
                const q = query (
                  collection(db, "deadlineAttachments"),
                  where("idDeadline", "==", idDeadline),
                )
          
                console.log("test leak deadline")
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                  const deadlineAttachments = [];
                  querySnapshot.forEach((doc) => {
                      deadlineAttachments.push({ ...doc.data() })
                  })
                  setFetchedAttachmentDeadlines(deadlineAttachments);
                })
                return () => unsubscribe;
                }
            } catch (error) {
                console.log("error: " + error)
            }
          console.log("test leak deadline")
        }, [idDeadline])
    } catch (error) {
        console.log("error")
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
    // const [ selectedDeadlineAttachmentFile, setSelectedDeadlineAttachmentFile ] = useState(null);
    const [ deadlineAttachmentUpload, setDeadlineAttachmentUpload ] = useState(false);
    const [ endingDeadlinneAttachmentUpload, setEndingDeadlinneAttachmentUpload ] = useState(false);
    
    
    const handleDeadlineAttachment = (event) => {
        setSelectedDeadlineAttachmentFile(event.target.files[0]);
        setErrorMessageUploadDeadlineAttachments("")
    };
    
    // Handle Upload Deadline Attachment
    const handleUploadDeadlineAttachment = () => {
      if (!selectedDeadlineAttachmentFile) {
        setSelectedDeadlineAttachmentFile(null)
        setErrorMessageUploadDeadlineAttachments("File masih kosong.")
        console.error('No file selected.');
        return;
      }
      const setIdDeadlineAttachment = `${uuidv4()}`
      const nameAttachment = selectedDeadlineAttachmentFile.name;
      const sizeAttachment = parseFloat((selectedDeadlineAttachmentFile.size / (1024 * 1024)).toFixed(3));
      const fileNameAttachment = `${setIdDeadlineAttachment}-${selectedDeadlineAttachmentFile.name}`
      
      const storageRef = ref(storage, `Semester-6/${projectData.nameProject}-${projectData.labelProject}/Assignments/${nameDeadline}/${fileNameAttachment}`);
      
      setDeadlineAttachmentUpload(true);
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
                setDeadlineAttachmentUpload(false)
            }, 1000);
            console.log("ednding upload...")
          } catch (error) {
            console.error('Error getting download URL:', error);
          }
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    };

    // Tambah Bagian
    let [ sectionIsOpen, setSectionIsOpen ] = useState(false)

    const [ judulBagian, setJudulBagian ] = useState('')
    const [ previewJudulBagian, setPreviewJudulBagian ] = useState('')

    const [ errorMessageJudulBagian, setErrorMessageJudulBagian ] = useState('')

    const [ buatBagianText, setBuatBagianText ] = useState(false)



    function sectionCloseModal() {
        setSectionIsOpen(false)
        setJudulBagian("")
        setPreviewJudulBagian("")
      }
    
    function sectionOpenModal() {
        setSectionIsOpen(true)
    }


    const handleJudulBagian = (e) => {
        setJudulBagian(e.target.value);
        setPreviewJudulBagian(e.target.value)
        setErrorMessageJudulBagian("")
    }
    
    const judulBagianValidation = () => {
        if (judulBagian === "") {
            setErrorMessageJudulBagian("Judul Bagian harus diisi.");
        }
    }

    const handleBuatBagian = async () => {
        if(judulBagian === "") {
            judulBagianValidation();
        } else {
            setBuatBagianText(true)
            try {
                const sectionsCollection = collection(db, "sections");

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
                      const docRef = await addDoc(sectionsCollection, {
                        idSection: `section-${setIdNews}`, 
                        idProject: projectData.idProject,
                        titleSection: judulBagian ? judulBagian : "null",
                        createdAt: currentDateString ? currentDateString : "null",
                      });
                        setCount(3);
                        setTersimpan(true);
                        setSectionIsOpen(false)
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

    // Fetched Bagian
    const [ fetchedBagian, setFetchedBagian ] = useState([]);

    try {
        useEffect(() => {
            try {
                const q = query (
                  collection(db, "sections"),
                  where("idProject", "==", projectData.idProject),
                  orderBy("createdAt", "asc")
                )
          
                console.log("test leak sections")
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                  const fetchedBagian = [];
                  querySnapshot.forEach((doc) => {
                      fetchedBagian.push({ 
                        idSection: doc.data().idSection,
                        titleSection: doc.data().titleSection,
                        createdAt: doc.data().createdAt,
                       })
                  })
                  setFetchedBagian(fetchedBagian);
                })
                return () => unsubscribe;
            } catch (error) {
                console.log("error: " + error)
            }
          console.log("test leak sections")
        }, [projectData.idProject])
    } catch (error) {
        console.log("error")
    }

    // Modal Edit Bagian
    let [ editBagianIsOpen, setEditBagianIsOpen ] = useState(false)

    const [ currentJudulBagian, setCurrentJudulBagian ] = useState('')
    const [ judulBagianTextEdit, setjudulBagianTextEdit ] = useState('')
    const [ idSectionsState, setIdJudulBagian ] = useState('')

    const [ ubahEditJudulBagianText, setUbahEditJudulBagianText ] = useState(false)

    const [ errorMessageEditJudulBagian, setErrorMessageEditJudulBagian ] = useState('')

    function editBagianCloseModal() {
        setEditBagianIsOpen(false)
        setjudulBagianTextEdit("")
        setCurrentJudulBagian("")
        setErrorMessageEditJudulBagian("");
      }
    
    function editBagianOpenModal(titleSection, idSection) {
        setEditBagianIsOpen(true)
        setCurrentJudulBagian(titleSection)
        setjudulBagianTextEdit(titleSection)
        setIdJudulBagian(idSection)
    }

    const handleEditJudulBagian = (e) => {
        setjudulBagianTextEdit(e.target.value)
    }

    const editJudulBagianValidation = () => {
        if (judulBagianTextEdit === "") {
            setErrorMessageEditJudulBagian("Judul Bagian harus diisi.");
        }
    }

    const handleSimpanJudulBagian = async () => {
        if(judulBagianTextEdit === "") {
            editJudulBagianValidation();
           
        } else {
            setUbahEditJudulBagianText(true)
            console.log("current judul: " + currentJudulBagian)
            console.log("id sections: " + idSectionsState)
            try {
                const sectionsCollection = collection(db, "sections");
                const querySnapshot = query(sectionsCollection, where("idSection", "==", idSectionsState));
                const sectionsSnapshot = await getDocs(querySnapshot);
    
                if (sectionsSnapshot.size === 0) {
                    console.log("data more than 2, please fix")
                  } else {
                    console.log("Document with the same idProject already exists (jalankan update)");
                    const doc = sectionsSnapshot.docs[0];
                    try {
                        await updateDoc(doc.ref, {
                          titleSection: judulBagianTextEdit ? judulBagianTextEdit : "null",
                        });
                        setCount(3);
                        setTersimpan(true);
                        setEditBagianIsOpen(false)
                        setUbahEditJudulBagianText(false)
                        setTimeout(() => {
                            setTersimpan(false)
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
    }

    // Bagian Aktivitas
    let [ bagianAktivitasIsOpen, setbagianAktivitasIsOpen ] = useState(false)

    const [ judulBagianAktivitas, setJudulBagianAktivitas ] = useState('')
    const [ deskripsiBagianAktivitas, setDeskripsiBagianAktivitas ] = useState('')

    const [ judulBagianToBagianAktivitas, setJudulBagianToBagianAktivitas ] = useState('')
    const [ idSectionToBagianAktivitas, setIdSectionToBagianAktivitas ] = useState('')

    const [ errorMessageJudulBagianAktivitas, setErrorMessageJudulBagianAktivitas ] = useState('')
    const [ errorMessageDeskripsiBagianAktivitas, setErrorMessageDeskripsiBagianAktivitas ] = useState('')
    
    const [ buatAktivitasText, setBuatAktivitasText ] = useState(false)

    function bagianAktivitasCloseModal() {
        setbagianAktivitasIsOpen(false)
        setJudulBagianAktivitas("")
        setDeskripsiBagianAktivitas("")
        setErrorMessageJudulBagianAktivitas("")
        setErrorMessageDeskripsiBagianAktivitas("")
      }
    
    function bagianAktivitasOpenModal(titleSection, idSection) {
        setbagianAktivitasIsOpen(true)
        setJudulBagianToBagianAktivitas(titleSection)
        setIdSectionToBagianAktivitas(idSection)
    }

    const handleJudulBagianAktivitas = (e) => {
        setJudulBagianAktivitas(e.target.value)
        setErrorMessageJudulBagianAktivitas("")
    }

    const handleDeskripsiBagianAktivitas = (e) => {
        setDeskripsiBagianAktivitas(e.target.value)
        setErrorMessageDeskripsiBagianAktivitas("")
    }

    const judulBagianAktivitasValidation = () => {
        if (judulBagianAktivitas === "") {
            setErrorMessageJudulBagianAktivitas("Judul Aktivitas harus diisi.");
        }
    }

    const handleBuatAktivitas = async () => {
        if(judulBagianAktivitas === "") {
            judulBagianAktivitasValidation()
        } else {
            setBuatAktivitasText(true)
            try {
                const sectionActivitiesCollection = collection(db, "sectionActivities");

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
                    const dateOrder = `${padWithZero(currentDate.getDate())} ${monthNames[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;
                    
                    try {
                      const docRef = await addDoc(sectionActivitiesCollection, {
                        idActivity: `activity-${setIdNews}`, 
                        idSection: idSectionToBagianAktivitas, 
                        idProject: projectData.idProject, 
                        titleActivity: judulBagianAktivitas ? judulBagianAktivitas : "null",
                        descriptionActivity: deskripsiBagianAktivitas ? deskripsiBagianAktivitas : "",
                        dateActivity: dateOrder ? dateOrder : "null",
                        createdAt: currentDateString ? currentDateString : "null",
                      });
                        setCount(3);
                        setTersimpan(true);
                        setbagianAktivitasIsOpen(false)
                        setBuatAktivitasText(false)
                        setTimeout(() => {
                            setTersimpan(false)
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

    // Fetch Bagian Aktivitas
    const [ fetchedBagianAktivitas, setFetchedBagianAktivitas ] = useState([]);

    try {
        useEffect(() => {
            try {
                const q = query (
                  collection(db, "sectionActivities"),
                  where("idProject", "==", projectData.idProject),
                  orderBy("createdAt", "asc")
                )
          
                console.log("test leak sectionActivities")
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                  const fetchedDataBerita = [];
                  querySnapshot.forEach((doc) => {
                      fetchedDataBerita.push({ 
                        idActivity: doc.data().idActivity,
                        idSection: doc.data().idSection,
                        titleActivity: doc.data().titleActivity,
                        descriptionActivity: doc.data().descriptionActivity,
                        dateActivity: doc.data().dateActivity,
                        createdAt: doc.data().createdAt,
                       })
                  })
                  setFetchedBagianAktivitas(fetchedDataBerita);
                })
                return () => unsubscribe;
            } catch (error) {
                console.log("error: " + error)
            }
          console.log("test leak sectionActivities")
        }, [projectData.idProject])
    } catch (error) {
        console.log("error")
    }

    // Edit Bagian Aktivitas
    let [ editBagianAktivitasIsOpen, setEditBagianAktivitasIsOpen ] = useState(false)  

    const [ editIdBagianAktivitas, setEditIdBagianAktivitas ] = useState('')  
    const [ editJudulBagianAktivitasInput, setEditJudulBagianAktivitasInput ] = useState('')
    const [ editDeskripsiBagianAktivitasInput, setEditDeskripsiBagianAktivitasInput ] = useState('')
    const [ titleSection, setTitleSections ] = useState('')

    const [ errorMessageEditJudulBagianAktivitas, setErrorMessageEditJudulBagianAktivitas ] = useState('')

    const [ editUbahBagianAktivitas, setEditUbahBagianAktivitas ] = useState(false)


    const [ selectedActivityAttachmentFile, setSelectedActivityAttachmentFile ] = useState(null); // just for delete the unused attachments the file
    const [ errorMessageUploadActivityAttachments, setErrorMessageUploadActivityAttachments ] = useState(""); // delete error message

    function editBagianAktivitasCloseModal() {
        setSelectedActivityAttachmentFile(null)
        setEditBagianAktivitasIsOpen(false)
        setEditJudulBagianAktivitasInput("")
        setEditDeskripsiBagianAktivitasInput("")
      }
    
    function editBagianAktivitasOpenModal(titleActivity, idActivity, descriptionActivity, titleSection) {
        setErrorMessageUploadActivityAttachments("")
        setEditBagianAktivitasIsOpen(true)
        setEditIdBagianAktivitas(idActivity)
        setTitleSections(titleSection)
        
        setEditJudulBagianAktivitasInput(titleActivity)
        setEditDeskripsiBagianAktivitasInput(descriptionActivity)
    }

    const handleEditJudulBagianAktivitas = (e) => {
        setEditJudulBagianAktivitasInput(e.target.value)
        setErrorMessageEditJudulBagianAktivitas("")
    }

    const handleEditDeskripsiBagianAktivitas = (e) => {
        setEditDeskripsiBagianAktivitasInput(e.target.value)
    }

    const editJudulBagianAktivitasValidation = () => {
        if (editJudulBagianAktivitasInput === "") {
            setErrorMessageEditJudulBagianAktivitas("Judul Aktivitas harus diisi.");
        }
    }

    const handleEditBagianAktivitas = async () => {
        if (editJudulBagianAktivitasInput === "") {
            editJudulBagianAktivitasValidation()
        } else {
            setEditUbahBagianAktivitas(true)
            try {
                const sectionActivitiesCollection = collection(db, "sectionActivities");
                const querySnapshot = query(sectionActivitiesCollection, where("idActivity", "==", editIdBagianAktivitas));
                const sectionsSnapshot = await getDocs(querySnapshot);
    
                if (sectionsSnapshot.size === 0) {
                    console.log("data more than 2, please fix")
                  } else {
                    console.log("Document with the same idProject already exists (jalankan update)");
                    const doc = sectionsSnapshot.docs[0];
                    try {
                        await updateDoc(doc.ref, {
                          titleActivity: editJudulBagianAktivitasInput ? editJudulBagianAktivitasInput : "null",
                          descriptionActivity: editDeskripsiBagianAktivitasInput ? editDeskripsiBagianAktivitasInput : "",
                        });
                        setCount(3);
                        setTersimpan(true);
                        setEditBagianAktivitasIsOpen(false)
                        setEditUbahBagianAktivitas(false)
                        setTimeout(() => {
                            setTersimpan(false)
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
    }

    // Get List User (Terdaftar)
    const [ fetchedUsers, setFetchedUsers ] = useState([]);
    const [ noDaftar, setStatusDaftar ] = useState(false);
    const [ picData, setPicData ] = useState([]);

    const [ currentPic, setCurrentPic ] = useState('');
    const [ totalUserListed, setTotalUserListed ] = useState('');

    const handleCurrentPic = async (pic) => {
        setCurrentPic(pic);
    };

    try {
        useEffect(() => {
            const fetchData = async () => {
                const usersListCollection = collection(db, "usersProjects");

                const usersCollection = collection(db, "users");

                const picProject = query(usersCollection, where("emailUser", "==", currentPic));
                const picProjectSnapshot = await getDocs(picProject);
                const fetchedPicProjectData = picProjectSnapshot.docs.map(doc => ({
                    usernameUser: doc.data().usernameUser,
                    emailUser: doc.data().emailUser,
                    positionUser: doc.data().positionUser,
                    roleUser: doc.data().roleUser,
                    imageUser: doc.data().imageUser,
                }));
                setPicData(fetchedPicProjectData);
        
                try {
                    const userListQuery = query(usersListCollection, where("idProject", "==", projectData.idProject));
                    const querySnapshot = await getDocs(userListQuery);
        
                    if (querySnapshot.docs.length > 0) {
                        const fetchedListUser = querySnapshot.docs.map(doc => ({
                            idUser: doc.data().idUser,
                        }));

                        setTotalUserListed(fetchedListUser.length + 1)
        
                        // Fetch users based on idUser
                        const usersCollection = collection(db, "users");
        
                        if (fetchedListUser.length > 0) {
                            const usersQuery = query(usersCollection, where("idUser", "in", fetchedListUser.map(user => user.idUser)));
                            const usersSnapshot = await getDocs(usersQuery);
        
                            if (usersSnapshot.docs.length > 0) {
                                const userList = usersSnapshot.docs.map(doc => doc.data());
                                setFetchedUsers(userList);
                            } else {
                                console.log("No users found for the given idUser values.");
                            }
                        } else {
                            console.log("dataListUser is empty.");
                        }
                    } else {
                        console.log("No documents found for the given query.");
                        setStatusDaftar(true);
                    }
                } catch (error) {
                    console.error("Error fetching data: ", error);
                }
            };
        
            // Invoke the fetch function
            fetchData();
            console.log("test leak data")
            // No cleanup needed in this case, so the return can be omitted or left empty.
            }, [projectData.idProject, currentPic]);
    } catch (error) {
        console.log(error)
    }

     // Handle Activity Attachment
    //  const [ selectedActivityAttachmentFile, setSelectedActivityAttachmentFile ] = useState(null);
    //  const [ errorMessageUploadActivityAttachments, setErrorMessageUploadActivityAttachments ] = useState("");
     
     const handleActivityAttachment = (event) => {
         setSelectedActivityAttachmentFile(event.target.files[0]);
         setErrorMessageUploadActivityAttachments("")
     };

    const [ activityAttachmentUpload, setActivityAttachmentUpload ] = useState(false);
    const [ endingActivityAttachmentUpload, setEndingActivityAttachmentUpload ] = useState(false);
     
     // Handle Upload Deadline Attachment
     const handleUploadActivitytAttachment = () => {
       if (!selectedActivityAttachmentFile) {
         console.error('No file selected.');
         setErrorMessageUploadActivityAttachments("File masih kosong.")
         return;
        }
        const setIdAvtivityAttachments = `${uuidv4()}`
        const nameAttachment = selectedActivityAttachmentFile.name;
        const sizeAttachment = parseFloat((selectedActivityAttachmentFile.size / (1024 * 1024)).toFixed(3));
        const fileNameAttachment = `${setIdAvtivityAttachments}-${selectedActivityAttachmentFile.name}`
        
        const storageRef = ref(storage, `Semester-6/${projectData.nameProject}-${projectData.labelProject}/${titleSection}/${editJudulBagianAktivitasInput}/${fileNameAttachment}`);
        
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

        setActivityAttachmentUpload(true)
        uploadBytes(storageRef, selectedActivityAttachmentFile)
            .then(async (snapshot) => {
            console.log('File uploaded successfully!', snapshot);
            try {
                const urlDeadlineAttachment = await getDownloadURL(storageRef);
                console.log('Download URL:', urlDeadlineAttachment);
                // You can use this URL to open the PDF in a browser or PDF viewer
                const deadlineAttachmentsRef = collection(db, 'activityAttachments');
                await addDoc(deadlineAttachmentsRef, {
                    idProject: projectData.idProject,
                    idActivity: editIdBagianAktivitas,
                    idActivityAttachment: `activityAttachments-${setIdAvtivityAttachments}`,
                    nameAttachment: nameAttachment,
                    sizeAttachment: `${sizeAttachment} mb`,
                    urlAttachment: urlDeadlineAttachment,
                    fileNameAttachment: `${fileNameAttachment}`,
                    createdAt: currentDateString,
                });
                setErrorMessageUploadActivityAttachments("")
                setEndingActivityAttachmentUpload(true)
                setCount(3);
                setTersimpan(true);
                setEditBagianAktivitasIsOpen(false)
                setActivityAttachmentUpload(false)
                setSelectedActivityAttachmentFile(null)
                setTimeout(() => {
                    setTersimpan(false)
                }, 3500);
                console.log("ednding upload...")
            } catch (error) {
                console.error('Error getting download URL:', error);
            }
            })
            .catch((error) => {
            console.error('Error uploading file:', error);
            });
    }

     // Fetch data attachment activity
     const [ fetchedActivityAttachments, setFetchedActivityAttachments ] = useState([]);

     try {
        useEffect(() => {
            try {
                const q = query (
                  collection(db, "activityAttachments"),
                  where("idProject", "==", projectData.idProject),
                  orderBy("createdAt", "desc")
                )
          
                console.log("test leak activityAttachments")
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                  const activityAtatchments = [];
                  querySnapshot.forEach((doc) => {
                      activityAtatchments.push({ ...doc.data() })
                  })
                  setFetchedActivityAttachments(activityAtatchments);
                })
                return () => unsubscribe;
            } catch (error) {
                console.log("error: " + error)
            }
          console.log("test leak activityAttachments")
        }, [projectData.idProject])
    } catch (error) {
        console.log("error")
    }

     // Modal Tambah Pertemuan
    let [ meetingIsOpen, meetingSetIsOpen ] = useState(false)

    const [ idSectionForMeeting, setIdSectionForMeeting ] = useState("")
    const [ titleSectionForMeeting, setTitleSectionForMeeting ] = useState("")

    const [ statusPertemuan, setStatusPertemuan ] = useState("")
    const [ errorMessageStatusPertemuan, setErrorMessageStatusPertemuan ] = useState("")
    
    const [ namaPertemuan, setNamaPertemuan ] = useState("")
    const [ errorMessageNamaPertemuan, setErrorMessageNamaPertemuan ] = useState("")
    
    const [ deskripsiPertemuan, setDeskripsiPertemuan ] = useState("")
    const [ errorMessageDeskripsiPertemuan, setErrorMessageDeskripsiPertemuan ] = useState("")

    const [ awal1Pertemuan, setAwal1Pertemuan ] = useState("")
    const [ awal2Pertemuan, setAwal2Pertemuan ] = useState("")

    const [ akhir1Pertemuan, setAkhir1Pertemuan ] = useState("")
    const [ akhir2Pertemuan, setAkhir2Pertemuan ] = useState("")
    
    const [ buatTambahPertemuanButton, setBuatTambahPertemuanButton ] = useState(false)
    

    function meetingCloseModal() {
      meetingSetIsOpen(false)
      setStatusPertemuan("")
      setNamaPertemuan("")
      setDeskripsiPertemuan("")
      setAwal1Pertemuan("")
      setAwal2Pertemuan("")
      setAkhir1Pertemuan("")
      setAkhir2Pertemuan("")

      setErrorMessageStatusPertemuan("")
      setErrorMessageNamaPertemuan("")
      setErrorMessageDeskripsiPertemuan("")
    }
  
    function meetingOpenModal() {
      meetingSetIsOpen(true)
    }
    
    const handleTambahPertemuanModalSendingParameter = (titleSection, idSection) => {
        setTitleSectionForMeeting(titleSection)
        setIdSectionForMeeting(idSection)
    }

    // Tambah Pertemuan Function

    const handleStatusPertemuan = (e) => {
        setStatusPertemuan(e.target.value)
        setErrorMessageStatusPertemuan("")
    }

    const statusPertemuanVaidation = () => {
        if (statusPertemuan === "") {
            setErrorMessageStatusPertemuan("Status harus diisi.");
        }
    }

    const handleNamaPertemuan = (e) => {
        setNamaPertemuan(e.target.value)
        setErrorMessageNamaPertemuan("")
    }

    const namaPertemuanVaidation = () => {
        if (namaPertemuan === "") {
            setErrorMessageNamaPertemuan("Nama pertemuan harus diisi.");
        }
    }
    
    const handleTanggalPertemuan = (e) => {
        setDeskripsiPertemuan(e.target.value)
        setErrorMessageDeskripsiPertemuan("")
    }

    const deskripsiPertemuanVaidation = () => {
        if (deskripsiPertemuan === "") {
            setErrorMessageDeskripsiPertemuan("Tanggal pertemuan harus diisi.");
        }
    }

    const handleAwal1Pertemuan = (e) => {
        setAwal1Pertemuan(e.target.value)
    }

    const handleAwal2Pertemuan = (e) => {
        setAwal2Pertemuan(e.target.value)
    }

    const handleAkhir1Pertemuan = (e) => {
        setAkhir1Pertemuan(e.target.value)
    }

    const handleAkhir2Pertemuan = (e) => {
        setAkhir2Pertemuan(e.target.value)
    }   

    const handleBuatPertemuan = async () => {
        if (statusPertemuan === "" ||
            namaPertemuan === "" ||
            deskripsiPertemuan === "") {
                statusPertemuanVaidation()
                namaPertemuanVaidation()
                deskripsiPertemuanVaidation()
            } else {
                setBuatTambahPertemuanButton(true)

                const jamAwal = `${awal1Pertemuan ? awal1Pertemuan : "00"}:${awal2Pertemuan ? awal2Pertemuan : "00"}`
                const jamAkhir = `${akhir1Pertemuan ? akhir1Pertemuan : "00"}:${akhir2Pertemuan ? akhir2Pertemuan : "00"}`

                // Split the time strings into hours and minutes
                const [hours1, minutes1] = jamAwal.split(':').map(Number);
                const [hours2, minutes2] = jamAkhir.split(':').map(Number);

                // Calculate the time difference
                let hoursDiff = hours2 - hours1;
                let minutesDiff = minutes2 - minutes1;

                // Adjust for negative time differences
                if (minutesDiff < 0) {
                    hoursDiff--;
                    minutesDiff += 60;
                }

                const durasiPertemuan = `${hoursDiff} jam ${minutesDiff} menit`

                try {
                    const sectionMeetingsCollection = collection(db, "sectionMeetings");
    
                        const setIdsectionMeeting = `${uuidv4()}`
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
                          const docRef = await addDoc(sectionMeetingsCollection, {
                            idMeeting: `meeting-${setIdsectionMeeting}`, 
                            idProject: projectData.idProject,
                            idSection: idSectionForMeeting,
                            statusMeeting: statusPertemuan,
                            nameMeeting: namaPertemuan,
                            descriptionMeeting: deskripsiPertemuan,
                            firstHourMeeting: jamAwal,
                            lastHourMeeting: jamAkhir,
                            durationMeeting: durasiPertemuan,
                            createdAt: currentDateString ? currentDateString : "null",
                          });
                            setCount(3);
                            setTersimpan(true);
                            meetingSetIsOpen(false)
                            setBuatTambahPertemuanButton(false)
                            setTimeout(() => {
                                setTersimpan(false);
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
        
        // Fetch Pertemuan
        const [ fetchedPertemuan, setFetchedPertemuan ] = useState([]);

        try {
            useEffect(() => {
                try {
                    const q = query (
                      collection(db, "sectionMeetings"),
                      where("idProject", "==", projectData.idProject),
                      orderBy("createdAt", "desc")
                    )
              
                    console.log("test leak sectionMeetings")
                    const unsubscribe = onSnapshot(q, (querySnapshot) => {
                      const fetchedDataPertemuan = [];
                      querySnapshot.forEach((doc) => {
                          fetchedDataPertemuan.push({ ...doc.data() })
                      })
                      setFetchedPertemuan(fetchedDataPertemuan);
                    })
                    return () => unsubscribe;
                } catch (error) {
                    console.log("error: " + error)
                }
              console.log("test leak sectionMeetings")
            }, [projectData.idProject])
        } catch (error) {
            console.log("error")
        }

    // Modal Edit Pertemuan
    let [ editMeetingIsOpen, editMeetingSetIsOpen ] = useState(false)
    
    const [ currentIdMeeting, setCurrentIdMeeting ] = useState("")
    const [ editCurrentDeskripsiPertemuan, setEditCurrentDeskripsiPertemuan ] = useState("")
    const [ titleSectionForEditPertemuan, setTitleSectionForEditPertemuan ] = useState("")

    const [ errorMessageeditCurrentDeskripsiPertemuan, setErrorMessageeditCurrentDeskripsiPertemuan ] = useState("")
    
    const [ ubahPertemuanButton, setUbahPertemuanButton ] = useState(false)

    function editMeetingCloseModal() {
        editMeetingSetIsOpen(false)

        setCurrentIdMeeting("")
        setEditCurrentDeskripsiPertemuan("")
        setTitleSectionForEditPertemuan("")

        setErrorMessageeditCurrentDeskripsiPertemuan("")
      }
    
    function editMeetingOpenModal(idMeeting, descriptionMeeting, titleSection) {
        editMeetingSetIsOpen(true)
        setCurrentIdMeeting(idMeeting)
        setEditCurrentDeskripsiPertemuan(descriptionMeeting)
        setTitleSectionForEditPertemuan(titleSection)
    }

    const handleEditTanggalPertemuan = (e) => {
        setEditCurrentDeskripsiPertemuan(e.target.value)
        setErrorMessageeditCurrentDeskripsiPertemuan("")
    }

    const deskripsiEditPertemuanVaidation = () => {
        if (editCurrentDeskripsiPertemuan === "") {
            setErrorMessageeditCurrentDeskripsiPertemuan("Tanggal pertemuan harus diisi.");
        }
    }

    const handleEditPertemuan = async () => {
        if(editCurrentDeskripsiPertemuan === "") {
            deskripsiEditPertemuanVaidation()
        } else {
            setUbahPertemuanButton(true)
            console.log("id" + currentIdMeeting)
            console.log("desc" + editCurrentDeskripsiPertemuan)
            try {
                const sectionMeetingsCollection = collection(db, "sectionMeetings");
                const querySnapshot = query(sectionMeetingsCollection, where("idMeeting", "==", currentIdMeeting));
                const sectionMeetingsSnapshot = await getDocs(querySnapshot);
    
                if (sectionMeetingsSnapshot.size === 0) {
                    console.log("data more than 2, please fix")
                  } else {
                    console.log("Document with the same idProject already exists (jalankan update)");
                    const doc = sectionMeetingsSnapshot.docs[0];
                    try {
                        await updateDoc(doc.ref, {
                          descriptionMeeting: editCurrentDeskripsiPertemuan ? editCurrentDeskripsiPertemuan : "",
                        });
                        setCount(3);
                        setTersimpan(true);
                        editMeetingSetIsOpen(false)
                        setUbahPertemuanButton(false)
                        setTimeout(() => {
                            setTersimpan(false);
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
    }

    // Hapus Pertemuan
    const [ openHapusPertemuan, setOpenHapusPertemuan ] = useState(false);
    const [ yakinHapusPertemuanText, setYakinHapusPertemuanText ] = useState(false)
    const cancelButtonRefPertemuan = useRef(null);

    const [ deleteIdPertemuan, setDeleteIdPertemuan ] = useState('')
    const [ currentTitleSectionForPertemuanDelete, setCurrentTitleSectionForPertemuanDelete ] = useState('')

    const setPertemuanParameter = (idMeeting, titleSection) => {
        setDeleteIdPertemuan(idMeeting)
        setCurrentTitleSectionForPertemuanDelete(titleSection)

        console.log("id = " + deleteIdPertemuan)
        console.log("title = " + currentTitleSectionForPertemuanDelete)
    }

    const handleHapusPertemuan = async () => {
        setYakinHapusPertemuanText(true);
        try {
            const sectionMeetingsCollection = collection(db, "sectionMeetings");
    
            const querySnapshot = await getDocs(query(sectionMeetingsCollection,
                where("idMeeting", "==", deleteIdPertemuan)
            ));

            if (querySnapshot.size === 0) {
                  console.log("Tidak ketemu id yang akan di hapus");
              } else if (querySnapshot.size === 1){
                // Document with the same idUsers already exists, handle accordingly
                querySnapshot.forEach(async (doc) => {
                    try {
                        await deleteDoc(doc.ref);
                        console.log("Document successfully deleted!");
                        setCount(3);
                        setTersimpan(true);
                        setOpenHapusPertemuan(false)
                        setTimeout(() => {
                            setYakinHapusPertemuanText(false)                            
                        }, 500);
                        setTimeout(() => {
                            setTersimpan(false);
                        }, 3500);
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

    // Hapus Lampiran Aktivitas
    const [ openHapusLampiranAktivitas, setOpenHapusLampiranAktivitas ] = useState(false);
    const [ yakinHapusLampiranAktivitas, setYakinHapusLampiranAktivitas ] = useState(false)
    const cancelButtonRefLampiranAktivitas = useRef(null);

    const [ namaLampiranForDelete, setNamaLampiranForDelete ] = useState("")
    const [ fileNameDelete, setFileNameDelete ] = useState("")
    const [ titleSectionDelete, setTitleSectionDelete ] = useState("")
    const [ titleActivityDelete, setTitleActivityDelete ] = useState("")

    const setLampiranAktivitasParameter = (nameAttachment, fileNameAttachment, titleSection, titleActivity) => {
        setNamaLampiranForDelete(nameAttachment)
        setFileNameDelete(fileNameAttachment)
        setTitleSectionDelete(titleSection)
        setTitleActivityDelete(titleActivity)

        console.log("1 " + namaLampiranForDelete)
        console.log("2 " + fileNameDelete)
        console.log("3 " + titleSectionDelete)
        console.log("4 " + titleActivityDelete)
    }
    
    const handleHapusLampiranAktivitas = async() => {
        setYakinHapusLampiranAktivitas(true);
        
        const filePathToDelete = `Semester-6/${projectData.nameProject}-${projectData.labelProject}/${titleSectionDelete}/${titleActivityDelete}/${fileNameDelete}`;
        try {
            const activityAttachmentsCollection = collection(db, "activityAttachments");
    
            const querySnapshot = await getDocs(query(activityAttachmentsCollection,
                where("fileNameAttachment", "==", fileNameDelete)
            ));

            if (querySnapshot.size === 0) {
                  console.log("Tidak ketemu id yang akan di hapus");
              } else if (querySnapshot.size === 1){
                // Document with the same idUsers already exists, handle accordingly
                querySnapshot.forEach(async (doc) => {
                    try {
                        await deleteDoc(doc.ref);
                        console.log("Document successfully deleted!");
                        try {
                            await deleteObject(ref(storage, filePathToDelete));                            
                            console.log("File successfully deleted!");
                            setCount(3);
                            setTersimpan(true);
                            setYakinHapusLampiranAktivitas(false)
                            setOpenHapusLampiranAktivitas(false)
                            setTimeout(() => {
                                setTersimpan(false);
                            }, 3500);
                        } catch (error) {
                            console.log("Delete File Error")
                        }
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

    const [ deadlineAttachmentDeleting, setDeadlineAttachmentDeleting ] = useState(false)
    const [ endingDeadlineAttachmentDeleting, setEndingDeadlineAttachmentDeleting ] = useState(false)

    const handleHapusLampiranDeadline = async (nameDeadline, fileNameAttachment) => {
        setDeadlineAttachmentUpload(true)
        setDeadlineAttachmentDeleting(true)
        const filePathToDelete = `Semester-6/${projectData.nameProject}-${projectData.labelProject}/Assignments/${nameDeadline}/${fileNameAttachment}`
        try {
            const deadlineAttachmentsCollection = collection(db, "deadlineAttachments");
    
            const querySnapshot = await getDocs(query(deadlineAttachmentsCollection,
                where("fileNameAttachment", "==", fileNameAttachment)
            ));

            if (querySnapshot.size === 0) {
                  console.log("Tidak ketemu id yang akan di hapus");
              } else if (querySnapshot.size === 1){
                // Document with the same idUsers already exists, handle accordingly
                querySnapshot.forEach(async (doc) => {
                    try {
                        await deleteDoc(doc.ref);
                        console.log("Document successfully deleted!");
                        try {
                            await deleteObject(ref(storage, filePathToDelete));                            
                            console.log("File successfully deleted!");
                            setEndingDeadlineAttachmentDeleting(true)
                            setTimeout(() => {
                                setDeadlineAttachmentUpload(false)
                            }, 1000);
                        } catch (error) {
                            console.log("Delete File Error")
                        }
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

    // Chat
    const [ inputChatChange, setInputChatChange ] = useState("")
    const [ inputChatSending, setInputChatSending ] = useState(false)
    
    const handleChatSendMessageOnChange = (e) => {
        setInputChatChange(e.target.value)
    }

    const handleSendMessageChat = async () => {
        console.log("pesan: " + inputChatChange)
        if(inputChatChange === "") {
            console.log("empty")
        } else {
            setInputChatSending(true)
            try {
                const projectMessagesCollection = collection(db, "projectMessages");

                const setIdProjectMessages = `${uuidv4()}`
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
                    const timeSent = `${padWithZero(currentDate.getHours())}:${padWithZero(currentDate.getMinutes())}, ${padWithZero(currentDate.getDate())} ${monthNames[currentDate.getMonth()]}`;
                    
                    try {
                        const docRef = await addDoc(projectMessagesCollection, {
                            idMessage: `messages-${setIdProjectMessages}`, 
                            idProject: projectData.idProject,
                            message: inputChatChange,
                            timeMessage: timeSent,
                            roleMessage: getCurrentRole,
                            emailMessage: getCurrentEmail,
                            imageMessage: getCurrentImage,
                            usernameMessage: getCurrentUsername,
                            createdAt: currentDateString ? currentDateString : "null",
                        });
                      console.log("Document written with ID: ", docRef.id);
                    } catch (e) {
                        console.error("Error adding document: ", e);
                    }
                    setInputChatSending(false)
                    setInputChatChange("")
                    
            } catch (error) {
                console.log("Error semua maszzeh: " + error)
            }
        }
    }
    
    const [ messages, setMessages ] = useState([])
    
    const messagesEndRef = useRef(null);

    // Auto Scroll Chat
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    try {
        useEffect(() => {
            try {
                const q = query (
                  collection(db, "projectMessages"),
                  where("idProject", "==", projectData.idProject),
                  orderBy("createdAt", "asc"),
                  limit(50)
                )
          
                console.log("test leak chat")
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                  const message = [];
                  querySnapshot.forEach((doc) => {
                      message.push({ ...doc.data() })
                  })
                  setMessages(message);
                })
                return () => unsubscribe;
            } catch (error) {
                console.log("error: " + error)
            }
          console.log("test leak chat")
        }, [projectData.idProject])
    } catch (error) {
        console.log("error")
    }

   
    

    if (isLoading) {
        return <BaseLoading />
    }

    return (
    <>

    {projectData ? (
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
                    {projectData.labelProject.split(" ")[0] === "Bangkit" ? "Buat Berita Bangkit" : projectData.labelProject === "MGE" ? "Buat Berita Pekerjaan" : "Buat Berita Mata Kuliah"}
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
                    {projectData.labelProject.split(" ")[0] === `Bangkit` ? "Buat Deadline Bangkit" : projectData.labelProject === "MGE" ? "Buat Deadline Pekerjaan" : `Buat Deadline Mata Kuliah - ${projectData.nameProject} ${projectData.nameProject.includes("-") ? '' : `(${projectData.labelProject})`}`}
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

    {/* Modal Bagian */}
    <Transition appear show={sectionIsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={sectionCloseModal}>
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
                    Tambah Bagian
                  </Dialog.Title>
                  <div className="divider"></div> 
                  <div className="-mt-3">
                     <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Judul Bagian
                        </label>
                            <div className="mt-2 sm:max-w-md">
                                <input
                                    autoFocus
                                    type="text"
                                    onChange={handleJudulBagian}
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="off"
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errorMessageJudulBagian ? 'ring-red-600' : 'ring-gray-300'}`}
                                    />
                                    {errorMessageJudulBagian ? (
                                        <div className="text-red-500 text-sm mt-1">
                                        {errorMessageJudulBagian}
                                    </div>
                                    ) : (
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan judul bagian yang akan dimasukkan.</p>
                                    )}
                            </div>
                       </div>
                  </div>
                  <div className="mt-4">
                     <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-xl font-medium leading-6 text-gray-700 mb-2">
                            Preview/Contoh
                        </label>
            {/* Section 2 */}
            <div className="col-span-7 row-span-3 bg-white border-2 border-gray-200 shadow-md rounded-t-md select-none hover:opacity-80">
                <div className="inline-flex bg-gray-300/40 w-full rounded-t-md p-2">
                    <div className="bg-gray-100 text-gray-800  items-center px-1.5 py-0.5 mt-0.5 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mt-0.5">
                            <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                            <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                            <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
                        </svg>
                    </div>
                    <div className="text-sm mt-1 lg:text-xl lg:mt-0 font-medium ml-1.5 text-gray-700">{previewJudulBagian ? previewJudulBagian : "Pertemuan 1"}</div>
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
                                            <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 ">Materi</h3>
                                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 ">dibuat pada 20 Februari, 2024</time>
                                            <p className="mb-4 text-base font-normal text-gray-500 lg:w-72"></p>
                                            <div className='inline-flex'>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5  text-gray-600">
                                                    <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
                                                    <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                                                </svg>
                                                    <div className='mr-2'>Materi Pemrograman.pdf</div>
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
                                            <h3 className="mb-1 text-lg font-semibold text-gray-900 ">Link Penting</h3>
                                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 ">dibuat pada 20 Februari, 2024</time>
                                            <p className="mb-4 text-base font-normal bg-gray-50 rounded-md border-2 border-slate-200 text-gray-800 w-48 overflow-x-scroll lg:overflow-hidden p-2 lg:w-auto"> Link Penting <br/> 
                                                <p className="underline text-blue-600">https://www.youtube.com/watch?v=6NsiA6GFAbU&list=RDWGH7H5qySQw&index=3</p> 
                                            </p>
                                        </li>
                                        <li className="ms-6">
                                            <span className="absolute flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full -start-3 ring-8 ring-white ">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                            </svg>
                                            </span>
                                            <h3 className="mb-1 text-lg font-semibold text-gray-900 ">Lain-Lain</h3>
                                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 ">dibuat pada 20 Februari, 2024</time>
                                        </li>
                                    </ol>


                                </div>
                            </div>
                            <div className="card-body">
                                    <h2 className="card-title mb-5 -mx-6 -mt-10">Detail Pertemuan</h2>
                                    <div className='-mt-12'></div>
                                    <div className='divider -mx-6'></div>
                                    <div className="stats stats-vertical lg:stats-horizontal -mx-6 shadow-md border-2 borderslate-200/50 -mt-4 ">
                                        <div className="stat overflow-x-scroll lg:overflow-hidden">
                                            <div className='inline-flex'>
                                            <div className="stat-title">Online Asinkron</div>
                                            <div className="stat-title">/</div>
                                            <div className="stat-title">Online Sinkron</div>
                                            <div className="stat-title">/</div>
                                            <div className="stat-title font-bold text-blue-600">Offline</div>
                                            <div className="stat-title">/</div>
                                            <div className="stat-title">Tidak Hadir</div>
                                            </div>
                                            <div className="text-xl font-extrabold ">Ruang Q-903</div>
                                            <div className="stat-desc mt-1">Deskripsi... (Opsional)</div>
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
                  <div className="divider"></div> 
                  <div className="mt-4">
                    {buatBagianText ? (
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
                            onClick={handleBuatBagian}
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

      {/* Modal Edit Bagian */}
      <Transition appear show={editBagianIsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={editBagianCloseModal}>
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
                    Ubah Judul
                  </Dialog.Title>
                  <div className="divider"></div> 
                  <div className="-mt-3">
                     <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Judul Bagian
                        </label>
                            <div className="mt-2 sm:max-w-md">
                                <input
                                    autoFocus
                                    defaultValue={`${currentJudulBagian}`}
                                    onChange={handleEditJudulBagian}
                                    type="text"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="off"
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errorMessageEditJudulBagian ? 'ring-red-600' : 'ring-gray-300'}`}
                                    />
                                    {errorMessageEditJudulBagian ? (
                                        <div className="text-red-500 text-sm mt-1">
                                        {errorMessageEditJudulBagian}
                                    </div>
                                    ) : (
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan judul bagian yang akan dimasukkan.</p>
                                    )}
                            </div>
                       </div>
                  </div>
                  <div className="divider"></div> 
                  <div className="mt-4">
                    {ubahEditJudulBagianText ? (
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
                            onClick={handleSimpanJudulBagian}
                            className={`rounded-md bg-indigo-600 px-10 py-2 text-sm font-semibold float-right
                            text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                            >
                            Ubah
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

      {/* Modal Bagian Aktivitas */}
      <Transition appear show={bagianAktivitasIsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={bagianAktivitasCloseModal}>
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
                    {judulBagianToBagianAktivitas} - Buat Aktivitas
                  </Dialog.Title>
                  <div className="divider"></div> 
                  <div className="-mt-3">
                     <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Judul Aktivitas
                        </label>
                            <div className="mt-2 sm:max-w-md">
                                <input
                                    autoFocus
                                    onChange={handleJudulBagianAktivitas}
                                    type="text"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="off"
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errorMessageJudulBagianAktivitas ? 'ring-red-600' : 'ring-gray-300'}`}
                                    />
                                    {errorMessageJudulBagianAktivitas ? (
                                        <div className="text-red-500 text-sm mt-1">
                                        {errorMessageJudulBagianAktivitas}
                                    </div>
                                    ) : (
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan judul aktivitas yang akan tambah.</p>
                                    )}
                            </div>
                       </div>
                  </div>
                  <div className="mt-4">
                     <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Deskripsi Aktivitas
                        </label>
                            <div className="mt-2 sm:max-w-md">
                                <textarea
                                    autoFocus
                                    rows="6"
                                    onChange={handleDeskripsiBagianAktivitas}
                                    type="text"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="off"
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errorMessageDeskripsiBagianAktivitas ? 'ring-red-600' : 'ring-gray-300'}`}
                                    />
                                    {errorMessageDeskripsiBagianAktivitas ? (
                                        <div className="text-red-500 text-sm mt-1">
                                        {errorMessageDeskripsiBagianAktivitas}
                                    </div>
                                    ) : (
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Tuliskan detail aktivitas di bagian ini / kosongkan untuk menghapus bagian deskripsi di bagian aktivitas nanti.</p>
                                    )}
                            </div>
                       </div>
                  </div>
                  <div className="divider"></div> 
                  <div className="mt-4">
                    {buatAktivitasText ? (
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
                            onClick={handleBuatAktivitas}
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

      {/* Modal Edit Bagian Aktivitas */}
      <Transition appear show={editBagianAktivitasIsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={editBagianAktivitasCloseModal}>
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
                    {titleSection} - Edit Aktivitas 
                    </Dialog.Title>
                    <div className="divider"></div> 
                    <div className="-mt-3">
                        <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Judul Aktivitas
                        </label>
                            <div className="mt-2 sm:max-w-md">
                                <input
                                    autoFocus
                                    onChange={handleEditJudulBagianAktivitas}
                                    defaultValue={`${editJudulBagianAktivitasInput}`}
                                    type="text"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="off"
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errorMessageEditJudulBagianAktivitas ? 'ring-red-600' : 'ring-gray-300'}`}
                                    />
                                    {errorMessageEditJudulBagianAktivitas ? (
                                        <div className="text-red-500 text-sm mt-1">
                                        {errorMessageEditJudulBagianAktivitas}
                                    </div>
                                    ) : (
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan judul aktivitas yang akan tambah.</p>
                                    )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Deskripsi Aktivitas
                        </label>
                            <div className="mt-2 sm:max-w-md">
                                <textarea
                                    autoFocus
                                    rows="6"
                                    onChange={handleEditDeskripsiBagianAktivitas}
                                    defaultValue={`${editDeskripsiBagianAktivitasInput}`}
                                    type="text"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="off"
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errorMessageDeskripsiBagianAktivitas ? 'ring-red-600' : 'ring-gray-300'}`}
                                    />
                                    {errorMessageDeskripsiBagianAktivitas ? (
                                        <div className="text-red-500 text-sm mt-1">
                                        {errorMessageDeskripsiBagianAktivitas}
                                    </div>
                                    ) : (
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Tuliskan detail aktivitas di bagian ini / kosongkan untuk menghapus bagian deskripsi.</p>
                                    )}
                            </div>
                            <label htmlFor="first-name" className="mt-2 block text-sm font-medium leading-6 text-gray-900">
                                Tambah Lampiran Baru
                            </label>
                            <div className="lg:flex lg:justify-between">
                                <input
                                onChange={handleActivityAttachment}
                                type="file" className="file-input file-input-bordered file-input-sm w-full max-w-xs" />
                                {activityAttachmentUpload ? (
                                    <>
                                    {endingActivityAttachmentUpload ? (
                                        <>
                                        <div 
                                        className={`lg:-mt-2 label justify-end`}>
                                            <span className="label-text-alt bg-indigo-500 text-white px-4 py-2 rounded-md">Uploaded</span>
                                        </div>
                                        </>
                                    ) : (
                                        <>
                                        <div 
                                        className={`lg:-mt-2 label justify-end`}>
                                            <span className="label-text-alt bg-indigo-400 text-white px-4 py-2 rounded-md animate-pulse">Uploading...</span>
                                        </div>
                                        </>
                                    )}
                                    </>
                                ) : (
                                    <>
                                        <div
                                        onClick={handleUploadActivitytAttachment}
                                        className={`lg:-mt-2 label`}>
                                            <span className="label-text-alt -ml-1 lg:-ml-0 bg-indigo-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-600">Upload</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            {errorMessageUploadActivityAttachments ? (
                                <div className="text-red-500 text-sm -mt-2">
                                    {errorMessageUploadActivityAttachments}
                                </div>
                            ) : (
                                <>
                                {selectedActivityAttachmentFile && (
                                    <div className="-mt-2.5 text-gray-600">
                                        <p>Ukuran file: {parseFloat((selectedActivityAttachmentFile.size / (1024 * 1024)).toFixed(3))} mb</p>
                                    </div>
                                )}
                                <p className="-mt-1.5 text-sm leading-6 text-gray-600">Boleh upload dengan format bebas (boleh kosong)</p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="divider"></div> 
                    <div className="mt-4">
                    {editUbahBagianAktivitas ? (
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
                            onClick={handleEditBagianAktivitas}
                            className={`rounded-md bg-indigo-600 px-10 py-2 text-sm font-semibold float-right
                            text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                            >
                            Ubah
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

    {/* Modal Tambah Pertemuan */}
    <Transition appear show={meetingIsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={meetingCloseModal}>
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
                   {titleSectionForMeeting} - Buat Detail Pertemuan
                </Dialog.Title>
                <div className="divider"></div> 
                <div className="-mt-3">
                    <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Pilih Status Pertemuan
                        </label>
                        <select
                        onChange={handleStatusPertemuan} 
                        className={`mt-2 select select-bordered w-full max-w-xs ${errorMessageStatusPertemuan ? "border-red-500" : ""}`}>
                            <option disabled selected>Pilih Status</option>
                            <option>Online Asinkron</option>
                            <option>Online Sinkron</option>
                            <option>Offline</option>
                            <option>Tidak Hadir</option>
                        </select>
                        {errorMessageStatusPertemuan ? (
                            <div className="text-red-500 text-sm mt-1">
                            {errorMessageStatusPertemuan}
                        </div>
                        ) : (
                            <p className="mt-1 text-sm leading-6 text-gray-600">Pilih status pertemuan online, offline, atau tidak hadir.</p>
                        )}
                    </div>
                </div>
                <div className="mt-4">
                    <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Tempat Pertemuan
                        </label>
                            <div className="mt-2 sm:max-w-md">
                                <input
                                    autoFocus
                                    onChange={handleNamaPertemuan}
                                    type="text"
                                    placeholder="ex: Zoom Meetings"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="off"
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errorMessageNamaPertemuan ? 'ring-red-600' : 'ring-gray-300'}`}
                                    />
                                    {errorMessageNamaPertemuan ? (
                                        <div className="text-red-500 text-sm mt-1">
                                        {errorMessageNamaPertemuan}
                                    </div>
                                    ) : (
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan nama/tempat pertemuan sesuai dengan pertemuan yang dilakukan.</p>
                                    )}
                            </div>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Deskripsi Pertemuan
                        </label>
                            <div className="mt-2 sm:max-w-md">
                                <textarea
                                    autoFocus
                                    onChange={handleTanggalPertemuan}
                                    type="text"
                                    rows="7"
                                    placeholder="format:
                                     12 Februari 2024,
                                     {lalu isikan deskripsi sesuai pertemuan, jika ada}"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="off"
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errorMessageDeskripsiPertemuan ? 'ring-red-600' : 'ring-gray-300'}`}
                                    />
                                    {errorMessageDeskripsiPertemuan ? (
                                        <div className="text-red-500 text-sm mt-1">
                                        {errorMessageDeskripsiPertemuan}
                                    </div>
                                    ) : (
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan deskripsi pertemuan dengan detail.</p>
                                    )}
                            </div>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Lama Pertemuan
                        </label>
                        <div className="inline-flex">
                            <div className="mt-2 sm:max-w-md">
                            <div className="flex mb-2 space-x-2 rtl:space-x-reverse">
                                <div>
                                    <label for="code-1" className="sr-only"></label>
                                    <input
                                    onChange={handleAwal1Pertemuan}
                                    autoComplete='off' type="text" maxLength="2" id="code-1" placeholder='00' className="block w-12 h-9 py-3 text-sm  text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" required />
                                </div>
                                <div>
                                    <label for="code-2" className="sr-only"></label>
                                    <input
                                    onChange={handleAwal2Pertemuan}
                                    autoComplete='off' type="text" maxLength="2" id="code-2" placeholder='00' className="block w-12 h-9 py-3 text-sm  text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" required />
                                </div>
                                <div  className="mt-1.5"> - </div>
                            </div>
                                
                            </div>
                            <div className="mt-2 sm:max-w-md ml-2">
                            <div className="flex mb-2 space-x-2 rtl:space-x-reverse">
                                <div>
                                    <label for="code-1" className="sr-only"></label>
                                    <input
                                    onChange={handleAkhir1Pertemuan}
                                    autoComplete='off' type="text" maxLength="2" id="code-1" placeholder='00' className="block w-12 h-9 py-3 text-sm  text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" required />
                                </div>
                                <div>
                                    <label for="code-2" className="sr-only"></label>
                                    <input
                                    onChange={handleAkhir2Pertemuan}
                                    autoComplete='off' type="text" maxLength="2" id="code-2" placeholder='00' className="block w-12 h-9 py-3 text-sm  text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" required />
                                </div>
                            </div>
                            </div>
                        </div>
                            <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan jam pertemuan, ex: 07:00 - 08:30.</p>
                    </div>
                </div>
                <div className="divider"></div> 
                <div className="mt-4">
                    {buatTambahPertemuanButton ? (
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
                                onClick={handleBuatPertemuan}
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

     {/* Edit Tambah Pertemuan */}
     <Transition appear show={editMeetingIsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={editMeetingCloseModal}>
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
                   {titleSectionForEditPertemuan} - Edit Detail Pertemuan
                </Dialog.Title>
                <div className="divider"></div> 
                <div className="-mt-3">
                    <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Deskripsi Pertemuan
                        </label>
                            <div className="mt-2 sm:max-w-md">
                                <textarea
                                    onChange={handleEditTanggalPertemuan}
                                    type="text"
                                    defaultValue={`${editCurrentDeskripsiPertemuan}`}
                                    rows="7"
                                    placeholder="format:
                                     12 Februari 2024,
                                     {lalu isikan deskripsi sesuai pertemuan, jika ada}"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="off"
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${errorMessageeditCurrentDeskripsiPertemuan ? 'ring-red-600' : 'ring-gray-300'}`}
                                    />
                                    {errorMessageeditCurrentDeskripsiPertemuan ? (
                                        <div className="text-red-500 text-sm mt-1">
                                        {errorMessageeditCurrentDeskripsiPertemuan}
                                    </div>
                                    ) : (
                                        <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan deskripsi pertemuan dengan detail.</p>
                                    )}
                            </div>
                    </div>
                </div>
                <div className="divider"></div> 
                <div className="mt-4">
                    {ubahPertemuanButton ? (
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
                                onClick={handleEditPertemuan}
                                className={`rounded-md bg-indigo-600 px-10 py-2 text-sm font-semibold float-right
                                text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
                                >
                                Ubah
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

    {/* Modal Hapus Pertemuan */}
    <Transition.Root show={openHapusPertemuan} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRefBerita} onClose={setOpenHapusPertemuan}>
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
                                 Apakah kamu yakin menghapus pertemuan di {currentTitleSectionForPertemuanDelete} ini? Proses ini tidak bisa dibatalkan.
                                </p>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            {yakinHapusPertemuanText ? (
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
                                        onClick={handleHapusPertemuan}
                                    >
                                        Yakin
                                    </button>
                                </>
                            )}
                        <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={() => setOpenHapusPertemuan(false)}
                            ref={cancelButtonRefPertemuan}
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

     {/* Modal Hapus Lampiran Aktivitas */}
     <Transition.Root show={openHapusLampiranAktivitas} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRefBerita} onClose={setOpenHapusLampiranAktivitas}>
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
                                 Apakah kamu yakin menghapus lampiran <p className="text-gray-700 underline">{namaLampiranForDelete}</p> Proses ini tidak bisa dibatalkan.
                                </p>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            {yakinHapusLampiranAktivitas ? (
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
                                        onClick={handleHapusLampiranAktivitas}
                                    >
                                        Yakin
                                    </button>
                                </>
                            )}
                        <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={() => setOpenHapusLampiranAktivitas(false)}
                            ref={cancelButtonRefLampiranAktivitas}
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
                                Informasi Mata Kuliah berhasil tersimpan, kembali dalam {count} detik
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
                              {deadline.description && deadline.description.trim() && (
                                deadline.description.split('\n').map((line, index) => (
                                    <p key={index}>
                                        {line.split(/\s+/).map((word, wordIndex) => {
                                            if (word.startsWith('https://')) {
                                                return <a className='text-blue-600 hover:underline' href={word} target='_blank' rel="noreferrer" key={wordIndex}>{word}</a>;
                                            }
                                            return word + ' ';
                                        })}
                                        {/* Add a non-breaking space if it's not the last line */}
                                        {index !== deadline.description.split('\n').length - 1 && <br />}
                                    </p>
                                ))
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
                    <div className='flex'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 invisible">
                        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
                        <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                    </svg>
                        <div className='font-extralight -mt-2 ml-0.5'>Ukuran: {attachment.sizeAttachment}</div>
                        {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                        <>
                            <div
                            onClick={() => {
                                handleHapusLampiranDeadline(nameDeadline, attachment.fileNameAttachment)
                            }}
                            className="ml-0 transition-all duration-200 scale-100 hover:scale-110 cursor-pointer lg:tooltip lg:tooltip-right" data-tip="Hapus Lampiran">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -mt-1.5 text-red-600">
                                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </>
                        )}

                        {getCurrentRole === "admin" && (
                        <>
                            <div
                            onClick={() => {
                                handleHapusLampiranDeadline(nameDeadline, attachment.fileNameAttachment)
                            }}
                            className="ml-0 transition-all duration-200 scale-100 hover:scale-110 cursor-pointer lg:tooltip lg:tooltip-right" data-tip="Hapus Lampiran">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -mt-1.5 text-red-600">
                                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </>
                        )}
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
                <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                    Tambah Lampiran Baru
                </label>
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
                     {errorMessageUploadDeadlineAttachments ? (
                        <div className="text-red-500 text-sm">
                            {errorMessageUploadDeadlineAttachments}
                        </div>
                    ) : (
                        <p className="text-sm leading-6 text-gray-600">Hanya bisa upload dengan format .pdf (boleh kosong)</p>
                    )}
                    {deadlineAttachmentUpload ? (
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
                            {deadlineAttachmentDeleting ? (
                                <>
                                {endingDeadlineAttachmentDeleting ? (
                                    <>
                                    <div 
                                    className={`mt-2 label justify-end`}>
                                        <span className="label-text-alt bg-indigo-400 text-white px-4 py-2 rounded-md">Deleted</span>
                                    </div>
                                    </>
                                ) : (
                                    <>
                                    <div 
                                    className={`mt-2 label justify-end`}>
                                        <span className="label-text-alt bg-indigo-400 text-white px-4 py-2 rounded-md animate-pulse">Deleting...</span>
                                    </div>
                                    </>
                                )}
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
                <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                    Tambah Lampiran Baru
                </label>
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
                    {errorMessageUploadDeadlineAttachments ? (
                        <div className="text-red-500 text-sm">
                            {errorMessageUploadDeadlineAttachments}
                        </div>
                    ) : (
                        <p className="text-sm leading-6 text-gray-600">Hanya bisa upload dengan format .pdf (boleh kosong)</p>
                    )}
                    {deadlineAttachmentUpload ? (
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

    {/* Modal Pendaftar */}
    <dialog id="modal_pendaftar" className="modal modal-bottom sm:modal-middle">
    <div className="modal-box">
        <h3 className="font-bold text-lg">Daftar Pengguna</h3>
        <div className="-mt-4"></div>
        <div className="divider"></div>
        <div className="flex flex-col w-full">
        <div className="-mt-2"></div>
        <div className="divider divider-start">Penanggung Jawab</div>
        {picData.map((pic) =>
            <div className="flex items-center py-2 rounded-md hover:bg-gray-100">
                <div className="flex-shrink-0 h-10 w-10 ml-3">
                <img className="h-10 w-10 rounded-full" src={pic.imageUser} alt=":/" />
                </div>
                <div className="ml-4">
                <div className="text-sm font-medium text-gray-900 inline-flex">{pic.usernameUser}
                    {pic.roleUser === "admin" && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1  text-blue-600">
                        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                    </svg>
                    )}
                </div>
                <div className="text-sm text-gray-500">{pic.positionUser}</div>
                </div>
            </div>
        )}
        </div>
        <div className="flex flex-col w-full">
            <div className="divider divider-start">Terdaftar</div>
            {fetchedUsers ? (
                <>
                    {fetchedUsers.map((user) => 
                    <div className="flex items-center py-3 rounded-md hover:bg-gray-100">
                        <div className="flex-shrink-0 h-10 w-10 ml-3">
                        <img className="h-10 w-10 rounded-full" src={user.imageUser} alt=":/" />
                        </div>
                        <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 inline-flex">{user.usernameUser}
                            {user.roleUser === "admin" && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1  text-blue-600">
                                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                            </svg>
                            )}
                        </div>
                        <div className="text-sm text-gray-500">{user.positionUser}</div>
                        </div>
                    </div>
                    )}
                </>
            ) : (
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                    <div className="flex w-0 flex-1 items-center">
                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                        <span className="truncate font-medium animate-pulse">Loading Daftar Mahasiswa</span>
                        {/* <span className="flex-shrink-0 text-gray-400">4.5mb</span> */}
                        </div>
                    </div>
                </li>
            )}
            {noDaftar && (
                <>
                    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                    <div className="flex w-0 flex-1 items-center">
                        <div className="flex min-w-0 flex-1 gap-2">
                        <span className="truncate font-medium">Belum ada yang terdaftar</span>
                        {/* <span className="flex-shrink-0 text-gray-400">4.5mb</span> */}
                        </div>
                    </div>
                        <div className="ml-4 flex-shrink-0">
                    </div>
                </li>
                </>
            )}
        </div>
    </div>
    <form method="dialog" className="modal-backdrop">
        <button>close</button>
    </form>
    </dialog>

     {/* Modal Chat */}
    {/* You can open the modal using document.getElementById('ID').showModal() method */}
    <dialog id="my_modal_4" className="modal">
    <div className="modal-box w-11/12 max-w-5xl">
        <div className="flex justify-between mb-2">
            <h3 className="font-bold text-lg">{projectData.nameProject} {projectData.nameProject.includes("-") ? '' : `- ${projectData.labelProject}`}</h3>
            <div className="">
                <form method="dialog">
                    {/* if there is a button, it will close the modal */}
                    <button className="btn -mt-3">Tutup</button>
                </form>
            </div>
        </div>
        {/* Content */}

        {/* Chat */}
        <div className="h-96 flex flex-col">
            <div className="bg-gray-50 flex-1 overflow-y-scroll rounded-t-xl">
                <div className="px-4 py-3">
                    {/* Bubble Chat */}
                    {messages.map((message) => 
                    <div className={`chat ${message.emailMessage === getCurrentEmail ? "chat-end" : "chat-start"}`}>
                        <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                            <img alt="Tailwind CSS chat bubble component" src={message.imageMessage} />
                            </div>
                        </div>
                        <div className="chat-header mb-1">
                        <div className="inline-flex">
                                {message.emailMessage === getCurrentEmail ? "" : message.usernameMessage}
                                {message.emailMessage !== getCurrentEmail && (
                                    <>
                                    {message.roleMessage === "admin" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1  text-blue-600">
                                            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    </>
                                )}
                        </div>
                            <time className="text-xs opacity-50 ml-1">{message.timeMessage}</time>
                        </div>
                        <div className="chat-bubble">{message.message}</div>
                        <div className={`chat-footer  ${message.emailMessage !== getCurrentEmail ? "opacity-50" : "mt-1"}`}>
                            <div className="inline-flex">
                                {message.emailMessage !== getCurrentEmail ? "Delivered" : message.usernameMessage}
                                {message.emailMessage === getCurrentEmail && (
                                    <>
                                    {message.roleMessage === "admin" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1  text-blue-600">
                                            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                        )}
                        <div ref={messagesEndRef}></div>
                </div>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-b-xl">
                <div className="flex items-center">
                    <textarea value={inputChatChange} onChange={handleChatSendMessageOnChange} rows="1" className="w-full border rounded-md py-2 px-4 mr-2" type="text" placeholder="Tuliskan pesan..." />
                    {inputChatSending ? (
                        <>
                        <button disabled className="bg-indigo-400  text-white font-medium py-2 px-4 rounded-full animate-pulse">
                            Kirim
                        </button>
                        </>
                    ) : (
                        <>
                        <button onClick={handleSendMessageChat} className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-full">
                            Kirim
                        </button>
                        </>
                    )}
                </div>
            </div>
        </div>
        {/* End Chat */}

    {/* End Content */}
</div>
</dialog>
        </>
    ) : (
        <>
        </>
    )}
   

    {projectData ? (
         <div className="min-h-full">
         <Navbar />
         
         <header className="bg-white drop-shadow-md">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="lg:flex lg:justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        {projectData.nameProject} {projectData.nameProject.includes("-") ? '' : `- ${projectData.labelProject}`}
                        <button className="lg:tooltip lg:tooltip-right
                         transition-all duration-200
                         scale-110 hover:scale-125 hover:bg-gray-100
                         p-1 ml-1
                         bg-gray-50 rounded-full" data-tip="Chat" onClick={()=>{
                             document.getElementById('my_modal_4').showModal()
                            }
                         }>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-600">
                                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
                            </svg>
                        </button>
                    </h1>
                    <div onClick={() =>  {
                         document.getElementById('modal_pendaftar').showModal()
                         handleCurrentPic(projectData.picProject)
                    }} className="avatar-group -space-x-5 rtl:space-x-reverse cursor-pointer transition-all duration-200 scale-100 lg:hover:scale-110">
                    {fetchedUsers.map((user, index) => 
                    <div className={`${index >= 3 ? "hidden" : ''} avatar`}>
                        <div className="w-8">
                        <img src={user.imageUser} alt='none'/>
                        </div>
                    </div>
                    )}
                    {totalUserListed >= 4 && (
                    <div className="avatar placeholder">
                        <div className="w-8 bg-neutral text-neutral-content">
                        <span>+{totalUserListed - 3}</span>
                        </div>
                    </div>
                    )}
                    </div>
                </div>
                    <div className="text-sm breadcrumbs">
                    <ul className='text-gray-600'>
                        <li>
                        <Link to='/personal'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                        </svg>
                        {projectData.labelProject.split(" ")[0] === "Bangkit" ? "Mata Kuliahku" : projectData.labelProject === "MGE" ? "Projek" : "Mata Kuliahku"}
                        </Link>
                        </li> 
                        <li>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                        </svg>
                            {projectData.nameProject} {projectData.nameProject.includes("-") ? '' : `- ${projectData.labelProject}`}
                        </li> 
                    </ul>
                    </div>
            </div>
         </header>

         {/* Start - Content */}
         <main>
         <div className="mx-auto max-w-7xl pt-6 sm:px-6 lg:px-8">

        <div className="grid grid-rows-1 md:grid-rows-3 md:grid-flow-col gap-4 px-2">
            
            {/* Section 1 */}
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
                        <div className="text-sm mt-1 lg:text-xl lg:mt-0 font-medium ml-1.5 text-gray-700">
                        {projectData.labelProject.split(" ")[0] === "Bangkit" ? "Kegiatan Bangkit" : projectData.labelProject === "MGE" ? "Kegiatan Pekerjaan" : "Kegiatan Perkuliahan"}
                        </div>
                        
                        <div data-dial-init className="flex ml-auto">
                            <div id="speed-dial-menu-horizontal" className="flex me-1 space-x-1 items-center">
                                {/* <div
                                onClick={handleDownload}
                                className="lg:tooltip tooltip-left scale-100 hover:scale-110 transition-all duration-200" data-tip="Download Materi">
                                    <button  type="button" data-tooltip-target="tooltip-share tooltip"  data-tip="Share" data-tooltip-placement="top" className="flex justify-center items-center w-[30px] h-[30px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50   focus:ring-4 focus:ring-gray-300 focus:outline-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 scale-110 text-gray-600">
                                           <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div> */}
                                {(getCurrentRole === "admin" || (projectData.picProject === getCurrentEmail && getCurrentRole === "user")) && (
                                    <>
                                        <div className="lg:tooltip scale-100 hover:scale-110 transition-all duration-200" data-tip="Berita">
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
                                        className="lg:tooltip scale-100 hover:scale-110 transition-all duration-200" data-tip="Deadline">
                                            <button type="button" data-tooltip-target="tooltip-share tooltip"  data-tip="Share" data-tooltip-placement="top" className="flex justify-center items-center w-[30px] h-[30px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50   focus:ring-4 focus:ring-gray-300 focus:outline-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 scale-110 text-gray-600">
                                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="lg:tooltip scale-100 hover:scale-110 transition-all duration-200" data-tip="Tambah Bagian">
                                            <button
                                            onClick={sectionOpenModal}
                                            type="button" data-tooltip-target="tooltip-share tooltip"  data-tip="Share" data-tooltip-placement="top" className="flex justify-center items-center w-[30px] h-[30px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50   focus:ring-4 focus:ring-gray-300 focus:outline-none">
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
                                    <h2 className="card-title mb-5 ">
                                    {projectData.labelProject.split(" ")[0] === "Bangkit" ? "Berita Bangkit" : projectData.labelProject === "MGE" ? "Berita Pekerjaan" : "Berita Mata Kuliah"}
                                    </h2>
                                    <div className='-mt-12'></div>
                                    <div className='divider'></div>
                                    {fetchedBerita.length > 0 ? (
                                    <>
                                    {fetchedBerita.map((berita) => (
                                        <>
                                        <div className="flex items-start">
                                            
                                            <img className="w-8 h-8 rounded-full hidden lg:block" alt="profile" src={berita.publisherNews.userImage} />
                                            <div className="flex flex-col gap-1 w-full ml-2">
                                                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                                                    <span className="text-sm font-semibold text-gray-900 hidden lg:block">{berita.publisherNews.userName}</span>
                                                    {berita.publisherNews.userRole === "admin" && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mt-0.5 text-blue-600 hidden lg:block">
                                                        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    <span className="text-sm font-normal text-gray-500 ">dibuat pada {berita.createdAt} WIB</span>
                                                </div>
                                                <div className="flex flex-col leading-1.5 px-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl ">
                                                    <div className="inline-flex">
                                                    <p className="text-xl font-bold py-2.5 text-gray-700 ">{berita.titleNews}</p>
                                                    {getCurrentEmail === projectData.picProject && getCurrentRole === "user" && (
                                                            <button
                                                                onClick={() => {
                                                                    setDeleteIdNews(berita.idNews)
                                                                    setOpenHapusBerita(true)
                                                                }
                                                                }
                                                                type="submit"
                                                                className={`text-sm font-semibold scale-100 transition-all duration-200 hover:scale-105 mt-2 text-red-500 lg:tooltip`}
                                                                data-tip="Hapus Berita">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-600">
                                                                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                                                                </svg>
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
                                                                className={`text-sm font-semibold scale-100 transition-all duration-200 hover:scale-105 mt-2 text-red-500 lg:tooltip`}
                                                                data-tip="Hapus Berita">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-600">
                                                                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="divider divider-error -mt-3"></div>
                                                    <p className="text-sm font-normal ml-0.5 -mt-2 text-gray-900 w-28 overflow-clip lg:w-auto">
                                                    {berita.descriptionNews && berita.descriptionNews.trim() && (
                                                        berita.descriptionNews.split('\n').map((line, index) => (
                                                            <p key={index} className=''>
                                                                {line.split(/\s+/).map((word, wordIndex) => {
                                                                    if (word.startsWith('https://')) {
                                                                        return <a className='text-blue-600 hover:underline' href={word} target='_blank' rel="noreferrer" key={wordIndex}>{word}</a>;
                                                                    }
                                                                    return word + ' ';
                                                                })}
                                                                {/* Add a non-breaking space if it's not the last line */}
                                                                {index !== berita.descriptionNews.split('\n').length - 1 && <br />}
                                                            </p>
                                                        ))
                                                    )}
                                                    </p>
                                                    <p className="mt-4"></p>
                                                </div>
                                            </div>
                                        </div>
                                        </>
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
                                    <details open>
                                    <summary className='font-bold text-lg'>
                                    {projectData.labelProject.split(" ")[0] === "Bangkit" ? "Deadline Bangkit" : projectData.labelProject === "MGE" ? "Deadline Pekerjaan" : "Deadline Tugas Mahasiswa"}
                                    </summary>
                                    <ul>
                                        <li>
                                        {fetchedDeadlines.length > 0 ?(
                                            <>
                                                {fetchedDeadlines.map((deadline, index) => (
                                                    <>
                                                    <div key={index} className={
                                                        projectData.picProject === getCurrentEmail && deadline.nameDeadline.indexOf("[hidden]") !== -1 ? "opacity-30" 
                                                        : getCurrentRole === "admin" && deadline.nameDeadline.indexOf("[hidden]") !== -1 ? "opacity-30" 
                                                        : projectData.picProject !== getCurrentEmail && deadline.nameDeadline.indexOf("[hidden]") !== -1 ? "hidden" 
                                                        : ""}>
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
                                                    </>
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                              <summary className='font-medium'>
                                              {projectData.labelProject.split(" ")[0] === "Bangkit" ? "Belum Ada Deadline Bangkit!" : projectData.labelProject === "MGE" ? "Belum Ada Deadline Pekerjaan!" : "Belum Ada Deadline!"}
                                              </summary>
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
         
         {fetchedBagian.length > 0 ? (
            <>
                {fetchedBagian.map((bagian, index)=>
                    <>
                        {/* Start - Content 2*/}
                        <main>
                        <div className="mx-auto max-w-7xl pt-6 sm:px-6 lg:px-8">

                        <div className="grid grid-rows-1 md:grid-rows-3 md:grid-flow-col gap-4 px-2">

                            {/* Section 1 */}
                            <div className={`row-span-3 ${!buttonEdit ? "h-96" : ""} ${index + 1 > 1 ? "md:invisible hidden" : ""} ${projectData.labelProject === "MGE" ? "invisible" : ""} md:block col-span-7 md:col-span-1 bg-white border-2 border-gray-300/40 shadow-md rounded-md`}>
                                <div className="inline-flex bg-gray-300/40 w-full rounded-t-md p-2">
                                    <div className="bg-gray-100 text-gray-800  items-center px-1.5 py-0.5 mt-0.5 rounded-md">
                                        <BookOpenIcon className="h-5 w-5 mt-0.5 text-gray-600" aria-hidden="true" />
                                    </div>
                                    <div className="text-xl font-medium ml-1.5 text-gray-700">
                                        {projectData.labelProject.split(" ")[0] === "Bangkit" ? "Informasi Bangkit" : projectData.labelProject === "MGE" ? "Informasi Projek" : "Informasi"}
                                    </div>
                                    {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                                    <>
                                        <div className={`${buttonEdit ? "hidden" : ""} lg:tooltip ml-auto`}>
                                            <button
                                                onClick={() => setButtonEdit(true)}
                                                className={`${buttonEdit ? "hidden" : ""} transition-all duration-100 sclae-100 hover:scale-110 mt-0.5`}>
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
                                        <div className={`${buttonEdit ? "hidden" : ""} lg:tooltip ml-auto`}>
                                            <button
                                                onClick={() => setButtonEdit(true)}
                                                className={`${buttonEdit ? "hidden" : ""} transition-all duration-100 sclae-100 hover:scale-110 mt-0.5`}>
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
                                            <dt className="text-md font-bold leading-6 text-gray-900">
                                                {projectData.labelProject.split(" ")[0] === "Bangkit" ? "Mentor" : projectData.labelProject === "MGE" ? "Penanggung Jawab" : "Dosen Pengampu"}
                                            </dt>
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
                                            <dt className="text-md font-bold leading-6 text-gray-900">Link Group</dt>
                                            {dosen.groupLinkLecturers === "null" || dosen.groupLinkLecturers === "" ? (
                                                <div
                                                className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 text-blue-700`}>
                                                    Belum ada link group
                                                </div>
                                            ) : (
                                                <a href={`${dosen.groupLinkLecturers}`} target='_blank' rel="noreferrer" className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 text-blue-700 hover:underline`}>
                                                    Link
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
                                            <dt className="text-md font-bold leading-6 text-gray-900">
                                            {projectData.labelProject.split(" ")[0] === "Bangkit" ? "Mentor" : projectData.labelProject === "MGE" ? "Penanggung Jawab" : "Dosen Pengampu"}
                                            </dt>
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
                                            <dt className="text-md font-bold leading-6 text-gray-900">Link Group</dt>
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
                                    <div className="text-lg mt-1 lg:text-xl lg:mt-0 font-medium ml-1.5 text-gray-700">{bagian.titleSection}</div>
                                    {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                                    <>
                                        <div className={`lg:tooltip ml-auto`} data-tip='Ubah Judul'>
                                            <button
                                                onClick={() => {
                                                    editBagianOpenModal(bagian.titleSection, bagian.idSection)
                                                }
                                                }
                                                className={`transition-all duration-100 sclae-100 hover:scale-110 mt-2`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-700">
                                                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                                    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </>
                                    )}

                                    {getCurrentRole === "admin" && (
                                    <>
                                        <div className={`lg:tooltip ml-auto`} data-tip='Ubah Judul'>
                                            <button
                                                onClick={() => {
                                                    editBagianOpenModal(bagian.titleSection, bagian.idSection)
                                                }
                                                }
                                                className={`transition-all duration-100 sclae-100 hover:scale-110 mt-2`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-700">
                                                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                                    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </>
                                    )}
                                </div>
                                        {/* Content */}
                                        <div className="card rounded-none w-auto border-2 border-gray-200">
                                            <div className="card-body -mx-2 -mt-2">
                                            <div className="card rounded-md w-auto">
                                                <div className="card-body">
                                                    <div className="flex justify-between">
                                                        <h2 className="card-title mb-5 -mx-6 -mt-10">Aktivitas</h2>
                                                        {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                                                            <>
                                                                 <div className="lg:tooltip tooltip-left scale-100 hover:scale-110 transition-all duration-200 -mt-10" data-tip="Tambah Aktivitas">
                                                                    <button 
                                                                    onClick={() => bagianAktivitasOpenModal(bagian.titleSection, bagian.idSection)}
                                                                    type="button" data-tooltip-target="tooltip-share tooltip"  data-tip="Share" data-tooltip-placement="top" className="flex justify-center items-center w-[35px] h-[35px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 focus:outline-none">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 scale-110 text-gray-600">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </>
                                                            )}
                                                            {getCurrentRole === "admin" && (
                                                            <>
                                                                <div className="lg:tooltip tooltip-left scale-100 hover:scale-110 transition-all duration-200 -mt-10" data-tip="Tambah Aktivitas">
                                                                    <button 
                                                                    onClick={() => bagianAktivitasOpenModal(bagian.titleSection, bagian.idSection)}
                                                                    type="button" data-tooltip-target="tooltip-share tooltip"  data-tip="Share" data-tooltip-placement="top" className="flex justify-center items-center w-[35px] h-[35px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 scale-110 text-gray-600">
                                                                            <path fillRule="evenodd" d="M19.5 21a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-5.379a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H4.5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h15Zm-6.75-10.5a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V10.5Z" clipRule="evenodd" />
                                                                        </svg>

                                                                    </button>
                                                                </div>
                                                            </>
                                                            )}
                                                    </div>
                                                    <div className='-mt-12'></div>
                                                    <div className='divider -mx-6'></div>
                                                    {fetchedBagianAktivitas.length > 0 ? (
                                                        <>
                                                            {fetchedBagianAktivitas.map((aktivitas) =>
                                                                <>
                                                                {bagian.idSection === aktivitas.idSection ? (
                                                                    <>
                                                                        <ol className={` relative border-s border-gray-200`}>                
                                                                            <li className={`mb-10 ms-6 
                                                                            ${projectData.picProject === getCurrentEmail && aktivitas.titleActivity.indexOf("[hidden]") !== -1 ? "opacity-30" 
                                                                            : getCurrentRole === "admin" && aktivitas.titleActivity.indexOf("[hidden]") !== -1 ? "opacity-30" 
                                                                            : projectData.picProject !== getCurrentEmail && aktivitas.titleActivity.indexOf("[hidden]") !== -1 ? "hidden" 
                                                                            : ""}`}>            
                                                                                <span className="absolute flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full -start-3 ring-8 ring-white ">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                                                                </svg>
                                                                                </span>
                                                                                <div className="flex justify-between lg:justify-start">
                                                                                    <h3 className="mb-1 text-sm lg:text-lg font-semibold text-gray-900 w-20 lg:w-auto">{aktivitas.titleActivity}</h3>
                                                                                    {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                                                                                    <>
                                                                                        <div
                                                                                        onClick={() => editBagianAktivitasOpenModal(aktivitas.titleActivity, aktivitas.idActivity, aktivitas.descriptionActivity, bagian.titleSection)}
                                                                                        className="ml-0 lg:ml-2 transition-all duration-200 scale-100 hover:scale-110 cursor-pointer lg:tooltip" data-tip="Ubah Aktivitas">
                                                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-600">
                                                                                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                                                                                <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                                                                                            </svg>
                                                                                        </div>
                                                                                    </>
                                                                                    )}

                                                                                    {getCurrentRole === "admin" && (
                                                                                    <>
                                                                                        <div
                                                                                        onClick={() => editBagianAktivitasOpenModal(aktivitas.titleActivity, aktivitas.idActivity, aktivitas.descriptionActivity, bagian.titleSection)}
                                                                                        className="ml-0 lg:ml-2 transition-all duration-200 scale-100 hover:scale-110 cursor-pointer lg:tooltip" data-tip="Ubah Aktivitas">
                                                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-600">
                                                                                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                                                                                <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                                                                                            </svg>
                                                                                        </div>
                                                                                    </>
                                                                                    )}
                                                                                </div>
                                                                                <time className="block mb-2 text-sm font-normal leading-none text-gray-400">dibuat pada {aktivitas.dateActivity}</time>
                                                                                <p className={`${aktivitas.descriptionActivity === "" ? "hidden" : ""}
                                                                                mb-4 text-base font-normal bg-gray-50 rounded-md border-2 border-slate-200 text-gray-800 w-48 overflow-x-scroll lg:overflow-hidden p-2 lg:w-auto`}>
                                                                                {aktivitas.descriptionActivity && aktivitas.descriptionActivity.trim() && (
                                                                                    aktivitas.descriptionActivity.split('\n').map((line, index) => (
                                                                                        <p key={index}>
                                                                                            {line.split(/\s+/).map((word, wordIndex) => {
                                                                                                if (word.startsWith('https://')) {
                                                                                                    return <a className='text-blue-600 hover:underline' href={word} target='_blank' rel="noreferrer" key={wordIndex}>{word}</a>;
                                                                                                }
                                                                                                return word + ' ';
                                                                                            })}
                                                                                            {/* Add a non-breaking space if it's not the last line */}
                                                                                            {index !== aktivitas.descriptionActivity.split('\n').length - 1 && <br />}
                                                                                        </p>
                                                                                    ))
                                                                                )}
                                                                                </p>
                                                                                {fetchedActivityAttachments.map((attachments) =>
                                                                                    <>
                                                                                        {aktivitas.idActivity === attachments.idActivity ? (
                                                                                            <div className={``}>
                                                                                                <div className='inline-flex'>
                                                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5  text-gray-600">
                                                                                                        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
                                                                                                        <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                                                                                                    </svg>
                                                                                                        <a href={attachments.urlAttachment} target='_blank' rel="noreferrer" className='mr-2 hover:underline hover:text-gray-500 truncate w-40 lg:w-auto'>{attachments.nameAttachment}</a>
                                                                                                </div>
                                                                                                <div className='flex justify-start'>
                                                                                                    <div className='font-extralight -mt-1 ml-0.5'>Ukuran file: {attachments.sizeAttachment}</div>
                                                                                                    {/* Delete Attachments */}
                                                                                                    {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                                                                                                    <>
                                                                                                        <div
                                                                                                        onClick={() => {
                                                                                                            setOpenHapusLampiranAktivitas(true)
                                                                                                            setLampiranAktivitasParameter(attachments.nameAttachment, attachments.fileNameAttachment, bagian.titleSection, aktivitas.titleActivity)
                                                                                                        }}
                                                                                                        className="ml-0 transition-all duration-200 scale-100 hover:scale-110 cursor-pointer lg:tooltip lg:tooltip-right" data-tip="Hapus Lampiran">
                                                                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600">
                                                                                                                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                                                                                                            </svg>
                                                                                                        </div>
                                                                                                    </>
                                                                                                    )}

                                                                                                    {getCurrentRole === "admin" && (
                                                                                                    <>
                                                                                                        <div
                                                                                                        onClick={() => {
                                                                                                            setOpenHapusLampiranAktivitas(true)
                                                                                                            setLampiranAktivitasParameter(attachments.nameAttachment, attachments.fileNameAttachment, bagian.titleSection, aktivitas.titleActivity)
                                                                                                        }}
                                                                                                        className="ml-0 transition-all duration-200 scale-100 hover:scale-110 cursor-pointer lg:tooltip lg:tooltip-right" data-tip="Hapus Lampiran">
                                                                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600">
                                                                                                                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                                                                                                            </svg>
                                                                                                        </div>
                                                                                                    </>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <>
                                                                                            </>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </li>
                                                                        </ol>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                    {bagian.idSection !== aktivitas.idSection ? (
                                                                        <>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <ol className={`${bagian.idSection !== aktivitas.idSection ? "hidden" : ""} relative border-s border-gray-200`}>                
                                                                                <li className="mb-10 ms-6">            
                                                                                    <span className="absolute flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full -start-3 ring-8 ring-white ">
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                                                                    </svg>
                                                                                    </span>
                                                                                    <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 ">Belum ada aktivitas</h3>
                                                                                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400 ">dibuat pada </time>
                                                                                    <p className="mb-4 text-base font-normal text-gray-500   lg:w-72">Belum ada deskripsi</p>
                                                                                </li>
                                                                            </ol>
                                                                        </>
                                                                    )}
                                                                    </>
                                                                )}
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ol className={`hidden relative border-s border-gray-200`}>                
                                                                    <li className="mb-10 ms-6">            
                                                                        <span className="absolute flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full -start-3 ring-8 ring-white ">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                                                        </svg>
                                                                        </span>
                                                                        <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 ">Belum ada aktivitas</h3>
                                                                        <time className="block mb-2 text-sm font-normal leading-none text-gray-400 ">dibuat pada </time>
                                                                        <p className="mb-4 text-base font-normal text-gray-500   lg:w-72">Belum ada deskripsi</p>
                                                                    </li>
                                                                </ol>
                                                        </>
                                                    )}
                                                    {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                                                            <>
                                                            <ol className={`relative border-s border-gray-200 tranisition-all duration-200 scale-100 hover:scale-105 hover:translate-x-5`}>                
                                                                <li className="ms-6">            
                                                                    <span className="absolute flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full -start-3 ring-8 ring-white ">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                                                    </svg>
                                                                    </span>
                                                                    <p onClick={() => bagianAktivitasOpenModal(bagian.titleSection, bagian.idSection)} className="text-base font-normal text-gray-500 lg:w-72 cursor-pointer hover:text-gray-700">Tambah Aktivitas baru</p>
                                                                </li>
                                                            </ol>
                                                            </>
                                                    )}
                                                    
                                                    {getCurrentRole === "admin" ? (
                                                            <>
                                                            <ol className={`relative border-s border-gray-200 tranisition-all duration-200 scale-100 hover:scale-105 hover:translate-x-5`}>                
                                                                <li className="ms-6">            
                                                                    <span className="absolute flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full -start-3 ring-8 ring-white ">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                                                    </svg>
                                                                    </span>
                                                                    <p onClick={() => bagianAktivitasOpenModal(bagian.titleSection, bagian.idSection)} className="text-base font-normal text-gray-500 lg:w-72 cursor-pointer hover:text-gray-700">Tambah Aktivitas baru</p>
                                                                </li>
                                                            </ol>
                                                            </>
                                                    ) : (
                                                        <>
                                                            <ol className={`relative border-s border-gray-200 invisible`}>                
                                                                <li className="ms-6">            
                                                                    <span className="absolute flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full -start-3 ring-8 ring-white ">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                                                    </svg>
                                                                    </span>
                                                                    <p  className="text-base font-normal text-gray-500 lg:w-72 cursor-pointer hover:text-gray-700">Tambah Aktivitas baru</p>
                                                                    
                                                                </li>
                                                            </ol>
                                                        </> 
                                                    )}
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                    <div className="flex justify-between">
                                                        <h2 className="card-title mb-5 -mx-6 -mt-10">Detail Pertemuan</h2>
                                                        {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                                                            <>
                                                                 <div className="lg:tooltip tooltip-left scale-100 hover:scale-110 transition-all duration-200 -mt-10" data-tip="Tambah Pertemuan">
                                                                    <button 
                                                                    onClick={() => {
                                                                        meetingOpenModal(true)
                                                                        handleTambahPertemuanModalSendingParameter(bagian.titleSection, bagian.idSection)
                                                                        }
                                                                    }
                                                                    type="button" data-tooltip-target="tooltip-share tooltip"  data-tip="Share" data-tooltip-placement="top" className="flex justify-center items-center w-[35px] h-[35px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 scale-110 text-gray-600">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </>
                                                            )}
                                                            {getCurrentRole === "admin" && (
                                                            <>
                                                                <div className="lg:tooltip tooltip-left scale-100 hover:scale-110 transition-all duration-200 -mt-10" data-tip="Tambah Pertemuan">
                                                                    <button 
                                                                    onClick={() => {
                                                                        meetingOpenModal(true)
                                                                        handleTambahPertemuanModalSendingParameter(bagian.titleSection, bagian.idSection)
                                                                        }
                                                                    }
                                                                    type="button" data-tooltip-target="tooltip-share tooltip"  data-tip="Share" data-tooltip-placement="top" className="flex justify-center items-center w-[35px] h-[35px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 scale-110 text-gray-600">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </>
                                                            )}
                                                    </div>
                                                    <div className='-mt-12'></div>
                                                    <div className='divider -mx-6'></div>
                                                    
                                                    {fetchedPertemuan.length > 0 ? (
                                                        <>
                                                        {fetchedPertemuan.map((meet) => 
                                                            <>
                                                            {bagian.idSection === meet.idSection ? (
                                                                <>
                                                                <div className={`${bagian.idSection !== meet.idSection ? "hidden" : ""} stats mt-3 lg:-mt-2 stats-vertical lg:stats-horizontal -mx-6 shadow-md border-2 borderslate-200/50`}>
                                                                    <div className="stat overflow-x-scroll lg:overflow-hidden">
                                                                        <div className='inline-flex'>
                                                                        <div className={`stat-title ${meet.statusMeeting === "Online Asinkron" ? "font-bold text-blue-600": ""}`}>Online Asinkron</div>
                                                                        <div className="stat-title">/</div>
                                                                        <div className={`stat-title ${meet.statusMeeting === "Online Sinkron" ? "font-bold text-blue-600": ""}`}>Online Sinkron</div>
                                                                        <div className="stat-title">/</div>
                                                                        <div className={`stat-title ${meet.statusMeeting === "Offline" ? "font-bold text-blue-600": ""}`}>Offline</div>
                                                                        <div className="stat-title">/</div>
                                                                        <div className={`stat-title ${meet.statusMeeting === "Tidak Hadir" ? "font-bold text-blue-600": ""}`}>Tidak Hadir</div>
                                                                        {/* Edit Pertemuan */}
                                                                        {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                                                                        <>
                                                                            <div
                                                                            onClick={() => {
                                                                                editMeetingOpenModal(meet.idMeeting, meet.descriptionMeeting, bagian.titleSection)
                                                                            }}
                                                                            className="ml-0 lg:ml-2 transition-all duration-200 scale-100 hover:scale-110 cursor-pointer lg:tooltip lg:tooltip-bottom" data-tip="Ubah Pertemuan">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-600">
                                                                                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                                                                    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                                                                                </svg>
                                                                            </div>
                                                                        </>
                                                                        )}

                                                                        {getCurrentRole === "admin" && (
                                                                        <>
                                                                            <div
                                                                            onClick={() => {
                                                                                editMeetingOpenModal(meet.idMeeting, meet.descriptionMeeting, bagian.titleSection)
                                                                            }}
                                                                            className="ml-0 lg:ml-2 transition-all duration-200 scale-100 hover:scale-110 cursor-pointer lg:tooltip lg:tooltip-bottom" data-tip="Ubah Pertemuan">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-600">
                                                                                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                                                                    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                                                                                </svg>
                                                                            </div>
                                                                        </>
                                                                        )}
                                                                        {/* Delete Pertemuan */}
                                                                        {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                                                                        <>
                                                                            <div
                                                                            onClick={() => {
                                                                                setOpenHapusPertemuan(true)
                                                                                setPertemuanParameter(meet.idMeeting, bagian.titleSection)
                                                                            }}
                                                                            className="ml-0 lg:ml-2 transition-all duration-200 scale-100 hover:scale-110 cursor-pointer lg:tooltip lg:tooltip-bottom" data-tip="Hapus Pertemuan">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-600">
                                                                                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </div>
                                                                        </>
                                                                        )}

                                                                        {getCurrentRole === "admin" && (
                                                                        <>
                                                                            <div
                                                                            onClick={() => {
                                                                                setOpenHapusPertemuan(true)
                                                                                setPertemuanParameter(meet.idMeeting, bagian.titleSection)
                                                                            }}
                                                                            className="ml-0 lg:ml-2 transition-all duration-200 scale-100 hover:scale-110 cursor-pointer lg:tooltip lg:tooltip-bottom" data-tip="Hapus Pertemuan">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-600">
                                                                                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </div>
                                                                        </>
                                                                        )}
                                                                        </div>
                                                                        <div className="text-xl font-extrabold ">{meet.nameMeeting}</div>
                                                                        <div className="stat-desc mt-1">
                                                                        {meet.descriptionMeeting && meet.descriptionMeeting.trim() && (
                                                                            meet.descriptionMeeting.split('\n').map((line, index) => (
                                                                                <p key={index} className=''>
                                                                                    {line.split(/\s+/).map((word, wordIndex) => {
                                                                                        if (word.startsWith('https://')) {
                                                                                            return <a className='text-blue-600 hover:underline' href={word} target='_blank' rel="noreferrer" key={wordIndex}>{word}</a>;
                                                                                        }
                                                                                        return word + ' ';
                                                                                    })}
                                                                                    {/* Add a non-breaking space if it's not the last line */}
                                                                                    {index !== meet.descriptionMeeting.split('\n').length - 1 && <br />}
                                                                                </p>
                                                                            ))
                                                                        )}
                                                                        </div>
                                                                        <div className="stat-desc">{meet.firstHourMeeting} - {meet.lastHourMeeting} ({meet.durationMeeting})</div>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-2"></div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                {bagian.idSection !== meet.idSection ? (
                                                                    <>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                    </>
                                                                )}
                                                                </>
                                                            )}
                                                            </>
                                                        )}
                                                        </>
                                                    ) : (
                                                        <>
                                                        <div className={`stats mt-3 lg:-mt-4 stats-vertical lg:stats-horizontal -mx-6 shadow-md border-2 borderslate-200/50`}>
                                                            <div className="stat overflow-x-scroll lg:overflow-hidden">
                                                                <div className='inline-flex'>
                                                                <div className="stat-title">Online Asinkron</div>
                                                                <div className="stat-title">/</div>
                                                                <div className="stat-title">Online Sinkron</div>
                                                                <div className="stat-title">/</div>
                                                                <div className="stat-title">Offline</div>
                                                                <div className="stat-title">/</div>
                                                                <div className="stat-title">Tidak Hadir</div>
                                                                </div>
                                                                <div className="text-xl font-extrabold ">Belum ada pertemuan</div>
                                                                <div className="stat-desc mt-1">00 bulan 0000,</div>
                                                                <div className="stat-desc">00:00 - 00:00 (0 jam 0 menit)</div>
                                                            </div>
                                                        </div>
                                                        </>
                                                    )}
                                                    <div className="stat-title hidden lg:invisible lg:block">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
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
                    </>
                )}
            </>
         ) : (
            <>
                {/* Start - Content 2*/}
                <main>
                <div className="mx-auto max-w-7xl pt-6 sm:px-6 lg:px-8">

                <div className="grid grid-rows-1 md:grid-rows-3 md:grid-flow-col gap-4 px-2">

                    {/* Section 1 */}
                    <div className={`row-span-3 ${!buttonEdit ? "h-96" : ""} ${projectData.labelProject === "MGE" ? "invisible" : ""} col-span-7 md:col-span-1 bg-white border-2 border-gray-300/40 shadow-md rounded-md`}>
                        <div className="inline-flex bg-gray-300/40 w-full rounded-t-md p-2">
                            <div className="bg-gray-100 text-gray-800  items-center px-1.5 py-0.5 mt-0.5 rounded-md">
                                <BookOpenIcon className="h-5 w-5 mt-0.5 text-gray-600" aria-hidden="true" />
                            </div>
                            <div className="text-xl font-medium ml-1.5 text-gray-700">
                                {projectData.labelProject.split(" ")[0] === "Bangkit" ? "Informasi Bangkit" : projectData.labelProject === "MGE" ? "Informasi Projek" : "Informasi Mata Kuliah"}
                            </div>
                            {projectData.picProject === getCurrentEmail && getCurrentRole === "user" && (
                            <>
                                <div className={`${buttonEdit ? "hidden" : ""} lg:tooltip ml-auto`} data-tip='Ubah'>
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
                                <div className={`${buttonEdit ? "hidden" : ""} lg:tooltip ml-auto`} data-tip='Ubah'>
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
                                    <dt className="text-md font-bold leading-6 text-gray-900">
                                    {projectData.labelProject.split(" ")[0] === "Bangkit" ? "Mentor" : projectData.labelProject === "MGE" ? "Penanggung Jawab" : "Dosen Pengampu"}
                                    </dt>
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
                                    <dt className="text-md font-bold leading-6 text-gray-900">Link Group</dt>
                                    {dosen.groupLinkLecturers === "null" || dosen.groupLinkLecturers === "" ? (
                                        <div
                                        className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 text-blue-700`}>
                                            Belum ada link group
                                        </div>
                                    ) : (
                                        <a href={`${dosen.groupLinkLecturers}`} target='_blank' rel="noreferrer" className={`${buttonEdit ? "hidden" : ""} mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0 text-blue-700 hover:underline`}>
                                            Link Group
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
                                    <dt className="text-md font-bold leading-6 text-gray-900">
                                    {projectData.labelProject.split(" ")[0] === "Bangkit" ? "Mentor" : projectData.labelProject === "MGE" ? "Penanggung Jawab" : "Dosen Pengampu"}
                                    </dt>
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
                                    <dt className="text-md font-bold leading-6 text-gray-900">Link Group</dt>
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
                    <div className="col-span-7 opacity-40 hover:opacity-60 select-none
                     transition-all duration 300 tooltip row-span-3 bg-white border-2 border-gray-200 shadow-md rounded-t-md" data-tip="Belum ada data">
                        <div className="inline-flex bg-gray-300/40 w-full rounded-t-md p-2">
                            <div className="bg-gray-100 text-gray-800  items-center px-1.5 py-0.5 mt-0.5 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mt-0.5">
                                    <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                                    <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                                    <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
                                </svg>
                            </div>
                            <div className="text-sm mt-1 lg:text-xl lg:mt-0 font-medium ml-1.5 text-gray-700">Belum ada data</div>
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
                                                    <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 ">Belum ada data</h3>
                                                </li>
                                            </ol>


                                        </div>
                                    </div>
                                    <div className="card-body">
                                            <h2 className="card-title mb-5 -mx-6 -mt-10">Detail Pertemuan</h2>
                                            <div className='-mt-12'></div>
                                            <div className='divider -mx-6'></div>
                                            <div className="stats stats-vertical lg:stats-horizontal -mx-6 shadow-md border-2 borderslate-200/50 -mt-4 ">
                                                <div className="stat overflow-x-scroll lg:overflow-hidden">
                                                    <div className='inline-flex'>
                                                    <div className="stat-title">Online</div>
                                                    <div className="stat-title">/</div>
                                                    <div className="stat-title">Offline</div>
                                                    <div className="stat-title">/</div>
                                                    <div className="stat-title">Tidak Hadir</div>
                                                    </div>
                                                    <div className="text-xl font-extrabold flex">Belum ada data</div>
                                                    <div className="stat-desc mt-1 flex">00:00 - 00:00 (0 menit)</div>
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
            </>
         )}
         
     </div>
    ) : (
        <>
             <div className="min-h-full">
                <Navbar />
                <header className="bg-white drop-shadow-md">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mata Kuliah Tidak Ditemukan</h1>
                    </div>
                </header>

                {/* Start - Content */}
                <main>
                    <div className="lg:mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 px-4">Pastikan kamu menekan tombol "Buka" di halaman mata kuliah.</div>
                </main>
                {/* End - Content */}
                
            </div>
        </>
    )}
    <Bottom />
    </>
    )
}

export default ProjekKu