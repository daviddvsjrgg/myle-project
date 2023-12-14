import React, { useEffect, useState } from 'react'
import Navbar from '../../../../components/Navbar/Navbar'
import Bottom from '../../../../components/BottomBar/Bottom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../../config/firebase/firebase'

const Projek = () => {

  const [ data, setData ] = useState([]);

  const fetchData = async () => {
    const projectsCollection = collection(db, "projects");
  
    try {
      const snapshot = await getDocs(projectsCollection);
      const fetchedData = [];
  
      for (const doc of snapshot.docs) {
        const projectData = doc.data();
        const emailUser = projectData.picProject;
  
        const usersCollection = collection(db, "users");
        const userQuery = query(usersCollection, where("emailUser", "==", emailUser));
        const userSnapshot = await getDocs(userQuery);
  
        if (!userSnapshot.empty) {
          fetchedData.push({
            id: doc.id,
            ...projectData,
            userData: userSnapshot.docs[0].data(),
          });
        }
      }
  
      setData(fetchedData);
    } catch (error) {
      console.log("Error fetching data: ", error);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-full">
      <Navbar />
      <header className="bg-white drop-shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Projek</h1>
        </div>
      </header>

      {/* Start - Content */}
      <main>
        <div className="mx-auto max-w-7xl">

            <div className="bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:mx-0">

                  {/* Header */}

                  {/* End Header */}

              </div>
            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
              {data.map((project) => (
              <a href='/toProject' className="group block rounded-lg p-6 bg-white ring-1 ring-slate-900/5 drop-shadow-lg space-y-3 hover:bg-gray-100 hover:ring-gray-200">
              <div className="flex items-center space-x-3">
                <article key={project.id} className="flex max-w-xl flex-col items-start justify-between">
                  <div className="flex items-center gap-x-4 text-xs">
                    <time dateTime={project.datetime} className="text-gray-500">
                      {project.createdAt}
                    </time>
                    <div
                      className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600">
                      {project.labelProject}
                    </div>
                  </div>
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900">
                      <a href={project.nameProject}>
                        <span className="absolute inset-0" />
                        {project.nameProject}
                      </a>
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{project.descriptionProject !== "" ? project.descriptionProject : "Projek ini belum ada deskripsi..."}</p>
                  </div>
                  <div className="relative mt-8 flex items-center gap-x-4">
                    <img src={project.userData.imageUser} alt="" className="h-10 w-10 rounded-full bg-gray-50" />
                    <div className="text-sm leading-6">
                      <p className="font-semibold text-gray-900">
                        <a href="/user-profile">
                          <span className="absolute inset-0" />
                          {project.userData.usernameUser}
                        </a>
                      </p>
                      <p className="text-gray-600">{project.userData.positionUser ?? "Belum ada Jabatan"}</p>
                    </div>
                  </div>
                </article>
             </div>
             </a>
              ))}
            </div>
          </div>
        </div>

        </div>
      </main>
      {/* End - Content */}
      
      <Bottom />
    </div>

  )
}

export default Projek