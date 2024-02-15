import React, { useEffect, useState } from 'react'
import Navbar from '../../../../components/Navbar/Navbar'
import Bottom from '../../../../components/BottomBar/Bottom';
import { auth, db } from '../../../../config/firebase/firebase';
import { collection, endBefore, getDocs, limit, limitToLast, orderBy, query, startAfter, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const loadBait = [
  {id : 1},
  {id : 2},
  {id : 3},
  {id : 4},
  {id : 5},
]

const limitData = 5;
let firstDocument = null;
let lastDocument = null;

const ManajemenUser = () => {
 
  const [ data, setData ] = useState([])

  // Get Role & Check PIC 
  const [ email, setEmail ] = useState('');



  const [ searchQuery, setSearchQuery ] = useState('');

   // Total Projek
   const [ totalProjects, setTotalProjects ] = useState(0);
   const [ totalProjectsLoading, setTotalProjectsLoading ] = useState(0);

   // disabled Pagination 
   const  [disabledPagination, setDisabledPagination ] = useState(false)
 
   const [ addFive, setAddFive ] = useState(0)
   const [ disabledSebelumnya, setDisabledSebelumnya ] = useState(true)
   const [ disabledSelanjutnya, setDisabledSelanjutnya ] = useState(true)

   useEffect(() => {
    localStorage.setItem('navbarClicked', "manajemenUserClicked");
    const fetchData = async () => {

      const user = auth.currentUser;
      setEmail(user.email);
      
      if (totalProjects < 6) {
        setDisabledSelanjutnya(false)
      } else {
        setDisabledSelanjutnya(true)
      }
      setDisabledSebelumnya(false);
      setDisabledSelanjutnya(false)

      const usersCollection = collection(db, "users");
      const queryTotal = query(usersCollection);
  
      const snapshotTotalLoading = await getDocs(queryTotal);
      setTotalProjectsLoading(snapshotTotalLoading.size)
  
      setTimeout(async () => {
        const snapshotTotal = await getDocs(queryTotal);
        setTotalProjects(snapshotTotal.size)
        if (totalProjects >= 6 ) {
          setDisabledSelanjutnya(true)
        }
      }, 1400);
     
  
      if (searchQuery) {
        setDisabledPagination(true);
        setAddFive(0);
        
        setTimeout(() => {
          setDariAwal(1);
          setDariAkhir(5);
          setDisabledSebelumnya(false);
          setDisabledSelanjutnya(true);
        }, 500);
        
        console.log("search dijalankan: " + searchQuery);
        const usersCollection = collection(db, "users");

        const capitalFirstWord = searchQuery.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        const searchVariations = [`${searchQuery.toUpperCase()}`, `${searchQuery.toLowerCase()}`, `${capitalFirstWord}`, `${searchQuery}`]

        const searchName = query(usersCollection,
          where("usernameUser", "in", searchVariations),
        );

        const searchEmail = query(usersCollection,
          where("emailUser", "in", searchVariations),
        );

        const searchJabatan = query(usersCollection,
          where("positionUser", "in", searchVariations),
        );

        const searchRole = query(usersCollection,
          where("roleUser", "in", searchVariations),
        );

        try {
          const [snapshotName, snapshotEmail, snapshotJabatan, snapshotRole] = await Promise.all([
            getDocs(searchName),
            getDocs(searchEmail),
            getDocs(searchJabatan),
            getDocs(searchRole)
          ]);

         
          if (!snapshotName.empty) {
             // First query
              const fetchedData = snapshotName.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));
              setData(fetchedData);
            }  if (!snapshotEmail.empty) {
             // Second query
              const fetchedData = snapshotEmail.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));
              setData(fetchedData);
            }  if (!snapshotJabatan.empty) {
            // Third query
              const fetchedData = snapshotJabatan.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));
              setData(fetchedData);
            }  if (!snapshotRole.empty) {
             // Fourth query
              const fetchedData = snapshotRole.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));
              setData(fetchedData);
            }


        } catch (error) {
          console.log("error search!")
        }


      } else if (!searchQuery) {
        setDisabledPagination(false);
        console.log("tidak search dijalankan")
        const usersCollection = collection(db, "users");
        const orderedQuery = query(usersCollection, orderBy("roleUser"), limit(limitData));
  
        try {
          const snapshot = await getDocs(orderedQuery);
          const fetchedData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setData(fetchedData);
        } catch (error) {
          console.log("Error fetching data: ", error);
        }

      }


     
    };
    
    fetchData();
  }, [searchQuery, totalProjects]);

  const [ dariAwal, setDariAwal ] = useState(1)
  const [ dariAkhir, setDariAkhir ] = useState(5)

  const fetchNextData = async () => {
      try {
        const projectsCollection = collection(db, "users");
    
        // If lastDocument exists, use it as the starting point for the next query
        const orderByStatus = lastDocument
          ? query(projectsCollection, orderBy("roleUser"), startAfter(lastDocument), limit(limitData))
          : query(projectsCollection, orderBy("roleUser"), limit(limitData));
    
        const snapshot = await getDocs(orderByStatus);
        const fetchedData = [];
    
        for (const doc of snapshot.docs) {
          const projectData = doc.data();

            fetchedData.push({
              id: doc.id,
              ...projectData,
            });
        }
    
        // Update firstDocument and lastDocument for the next iteration
        firstDocument = snapshot.docs[0];
        lastDocument = snapshot.docs[snapshot.docs.length - 1];
        setData(fetchedData);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
  };
  
  const fetchPreviousData = async () => {
    
      try {
        const projectsCollection = collection(db, "users");
    
        // If firstDocument exists, use it as the starting point for the previous query
        const orderByStatus = firstDocument
          ? query(projectsCollection, orderBy("roleUser"), endBefore(firstDocument), limitToLast(limitData))
          : query(projectsCollection, orderBy("roleUser"), limit(limitData));
    
        const snapshot = await getDocs(orderByStatus);
        const fetchedData = [];
    
        for (const doc of snapshot.docs) {
          const projectData = doc.data();

            fetchedData.push({
              id: doc.id,
              ...projectData,
          });
        }
    
        // Update firstDocument and lastDocument for the next iteration
        firstDocument = snapshot.docs[0];
        lastDocument = snapshot.docs[snapshot.docs.length - 1];
    
        setData(fetchedData);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
   
  };

  
  const handleSelanjutnya = async () => {
    setDisabledSebelumnya(false)
    setDisabledSelanjutnya(false)
    setTimeout(() => {
      setDisabledSelanjutnya(false);
      if (totalProjects === dariAkhir) {
        setDisabledSelanjutnya(false);
      }
      setAddFive((prev) => prev + 5)
      
      if (dariAwal + 5 > totalProjects) {
        setDariAwal(totalProjects)
        setDisabledSelanjutnya(false);
      } else {
        setDisabledSebelumnya(true);
        setDariAwal((prev) => prev + 5)
      }

      if (dariAkhir + 5 > totalProjects || dariAkhir + 5 === totalProjects) {
        setDariAkhir(totalProjects)
      } else {
        setDisabledSelanjutnya(true);
        setDariAkhir((prev) => prev + 5)
      }
    }, 500);
    
    fetchNextData();
};

const handleSebelumnya = () => {
    setDisabledSebelumnya(false)
    setDisabledSelanjutnya(false)
    setTimeout(() => {
      setDisabledSelanjutnya(true)
      setDisabledSebelumnya(true)
      setAddFive((prev) => prev - 5)
  
      if (dariAwal - 5 < 5) {
        setDisabledSebelumnya(false);
      }
      
      setDariAwal((prev) => prev - 5)
  
      if (dariAkhir - 5 < 5) {
        setDisabledSebelumnya(false);
        setDariAkhir(5)
      } else {
        setDariAkhir((prev) => prev - 5)
      }
    }, 500);
    
    fetchPreviousData();
};

useEffect(() => {
  // Call fetchNextData initially to load the first set of data
  // fetchNextData();
}, []);

useEffect(() => {
  // Call fetchNextData initially to load the first set of data
  fetchPreviousData();
}, []);


  return (
    <div className="min-h-full">
      <Navbar />
      <header className="bg-white drop-shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manajemen User</h1>
        </div>
      </header>

      {/* Start - Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">

        <div className="flex flex-col ml-1 -mt-2">
        <div className="flex justify-between ...">
              {/* <div className="order-last">
                <a href="/manajemen-user/user-baru" className="mb-3 group block max-w-sm rounded-lg p-2.5 bg-gray-50 ring-1 ring-slate-900/5 shadow-sm space-y-3 hover:bg-indigo-600 hover:ring-indigo-600">
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                    <h3 className="text-slate-900 group-hover:text-white text-sm font-semibold">User Baru</h3>
                  </div>
                </a>
              </div> */}
              <div>
                         
              <div className="relative max-w-xs mb-3">
                    <label htmlFor="hs-table-search" className="sr-only">
                      Search
                    </label>
                    <input
                      type="text"
                      nama_projek="hs-table-search"
                      id="hs-table-search"
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full p-3 pl-10 text-sm border-gray-300/75 rounded-md focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Cari... (ex:email, role)"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <svg
                        className="h-3.5 w-3.5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                      </svg>
                    </div>
                  </div>
            </div>
          </div>
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 mt-1">
        
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="drop-shadow-md overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nama User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Jabatan
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              {totalProjects !== 0 ? (
                 <tbody className="bg-white divide-y divide-gray-200">
                 {data.map((item, index) => (
                   <tr key={item.id} className={`${item.emailUser === email ? "bg-indigo-100 hover:bg-indigo-50" : "hover:bg-gray-100"}`}>
                      <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-5">
                          <div className="text-sm font-medium text-gray-900">{index+ 1 + addFive}</div>
                        </div>
                      </div>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center">
                         <div className="flex-shrink-0 h-10 w-10">
                           <img className="h-10 w-10 rounded-full" src={item.imageUser} alt=":/" />
                         </div>
                         <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 inline-flex">{item.usernameUser}
                              {item.roleUser === "admin" && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mt-0.5 ml-0.5 text-blue-600">
                                  <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                           <div className="text-sm text-gray-500">{item.emailUser}</div>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">{item.positionUser !== "" ? item.positionUser : 'Belum ada jabatan'}</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {item.roleUser === 'admin' ? 'Admin' : (item.roleUser === 'user' ? 'User' : 'Belum ada akses')}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <Link to="/user-profile-admin" state={{userData: item, clicked: "true"}} className="text-indigo-600 hover:text-indigo-900">
                       Detail
                     </Link>
                     </td>
                   </tr>
                 ))}
               </tbody>
              ) : (
                <>
                  {totalProjects === 0 && (
                    <tbody>
                      {loadBait.map((p) => (
                      <tr key={p.id} className={`${totalProjectsLoading === 0 ? "hidden" : ""} bg-white`}>
                        <td className="px-2 py-4 whitespace-nowrap animate-pulse ">
                          <div className="flex items-center">
                            <div className="ml-5">
                              <div className="text-sm font-medium text-gray-900">
                              <div className="h-2 bg-gray-200 rounded-full w-8"></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap animate-pulse ">
                          <div className="flex items-center">
                            <div className="ml-4">
                            <div className="h-2.5 bg-gray-200 rounded-full w-48"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap animate-pulse ">
                        <div className="flex items-center mt-4 animate-pulse ">
                          <svg className="w-8 h-8 me-3 text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                            </svg>
                            <div>
                                <div className="h-2 bg-gray-200 rounded-full w-32 mb-2"></div>
                                <div className="w-48 h-1.5 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap animate-pulse ">
                        <div className="h-2.5 bg-gray-200 rounded-full w-48"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium animate-pulse ">
                        <div className="h-2 bg-gray-200 rounded-full w-10"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  )}
                </>
              )}
             
            </table>
          </div>
        </div>
      </div>
    </div>

    <div className={`flex flex-col items-center float-right mt-2 p-2 ${disabledPagination ? "hidden" : ""}`}>
              <span className="text-sm text-gray-700 ">
                  Menampilkan data ke
                  <span className="font-semibold text-gray-900 ml-1">{dariAwal}</span> dari total,
                  <span className="font-semibold text-gray-900 ml-1">{totalProjects ? totalProjects : '...'}</span> data
              </span>
              
              <div className="flex mt-2">
                {disabledSebelumnya ? (
                  <button
                  onClick={handleSebelumnya}
                  className="flex items-center justify-center px-3 h-8 me-3 text-sm font-medium text-gray-100 bg-gray-700 border border-gray-300 rounded-lg hover:bg-gray-800 hover:text-gray-100 ">
                    <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                    </svg>
                    Sebelumnya
                  </button>
                ) : (
                  <button
                  disabled
                  onClick={handleSebelumnya}
                  className="flex items-center justify-center px-3 h-8 me-3 text-sm font-medium text-gray-100 bg-gray-400 border border-gray-300 rounded-lg ">
                    <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
                    </svg>
                    Sebelumnya
                  </button>
                )}
                {disabledSelanjutnya ? (
                  <button 
                  onClick={handleSelanjutnya}
                  className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-100 bg-gray-700 border border-gray-300 rounded-lg hover:bg-gray-800 hover:text-white">
                    Selanjutnya
                    <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                  </button>
                ) : (
                  <button 
                  disabled
                  onClick={handleSelanjutnya}
                  className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-100 bg-gray-400 border border-gray-300 rounded-lg">
                    Selanjutnya
                    <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>


        </div>
      </main>
      {/* End - Content */}
      
      <Bottom />
    </div>
  )
}

export default ManajemenUser