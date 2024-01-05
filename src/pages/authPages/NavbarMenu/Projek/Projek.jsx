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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mata Kuliah</h1>
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


            <section className="text-gray-600 body-font ">
              <div className="container py-8">
                <div className="flex flex-wrap -m-4">
                  {data.map((project) => 
                    <div key={project.id} className="p-4 md:w-1/3 scale-100 transition-all duration-400 hover:scale-105">
                      <div className="h-full rounded-xl shadow-cla-blue bg-gradient-to-tr from-gray-50 to-indigo-50 overflow-hidden hover:shadow-md">
                        <a href="/toProject">
                          <img className="lg:h-44 md:h-32 w-screen object-center scale-110 transition-all duration-400 hover:scale-100  hover:opacity-75" src={project.imageUrlProject} alt="blog" />
                        </a>
                        <div className="p-6">
                          <div className="flex justify-between">        
                            <a href="/toProject">
                              <h1 className="title-font text-lg font-medium text-gray-600 mb-3 scale-100">
                                {project.nameProject} {project.nameProject.includes("-") ? '' : `- ${project.labelProject}`}
                              </h1>
                            </a>
                          </div>
                          <div className="flex float-right">
                            <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 m-1 ">{project.createdAt}</h2>
                          </div>
                          <p className="leading-relaxed mb-3 text-gray-500">{project.descriptionProject !== "" ? project.descriptionProject : "Belum ada berita..."}</p>
                          {/* <div className="flex items-center flex-wrap ">
                            <button className="bg-gradient-to-r from-cyan-400 to-blue-400 hover:scale-105 drop-shadow-md  shadow-cla-blue px-4 py-1 rounded-lg">Learn more</button>
                          </div> */}
                            <div className="relative mt-3 flex items-center bottom-0 gap-x-4">
                              <img src={project.userData.imageUser} alt="" className="h-10 w-10 rounded-full bg-gray-50" />
                              <div className="text-sm leading-6">
                                <p className="font-semibold text-gray-900">
                                  <a href="/user-profile-projek">
                                    <span className="absolute inset-0" />
                                    {project.userData.usernameUser}
                                  </a>
                                </p>
                                <p className="text-gray-600">{project.userData.positionUser !== "" ? project.userData.positionUser : "Belum ada Jabatan"}</p>
                              </div>
                            </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* <div className="p-4 md:w-1/3">
                      <div className="h-full rounded-xl shadow-cla-violate bg-gradient-to-r from-pink-50 to-red-50 overflow-hidden">
                        <img className="lg:h-48 md:h-36 w-full object-cover object-center scale-110 transition-all duration-400 hover:scale-100" src="https://images.unsplash.com/photo-1624628639856-100bf817fd35?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8M2QlMjBpbWFnZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60" alt="blog" />
                        <div className="p-6">
                          <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">CATEGORY-1</h2>
                          <h1 className="title-font text-lg font-medium text-gray-600 mb-3">The Catalyzer</h1>
                          <p className="leading-relaxed mb-3">Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.</p>
                          <div className="flex items-center flex-wrap ">
                            <button className="bg-gradient-to-r from-orange-300 to-amber-400 hover:scale-105 drop-shadow-md shadow-cla-violate px-4 py-1 rounded-lg">Learn more</button>
                          
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 md:w-1/3">
                      <div className="h-full rounded-xl shadow-cla-pink bg-gradient-to-r from-fuchsia-50 to-pink-50 overflow-hidden">
                        <img className="lg:h-48 md:h-36 w-full object-cover object-center scale-110 transition-all duration-400 hover:scale-100" src="https://images.unsplash.com/photo-1631700611307-37dbcb89ef7e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1yZWxhdGVkfDIwfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=600&q=60" alt="blog" />
                        <div className="p-6">
                          <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">CATEGORY-1</h2>
                          <h1 className="title-font text-lg font-medium text-gray-600 mb-3">The Catalyzer</h1>
                          <p className="leading-relaxed mb-3">Photo booth fam kinfolk cold-pressed sriracha leggings jianbing microdosing tousled waistcoat.</p>
                          <div className="flex items-center flex-wrap ">
                            <button className="bg-gradient-to-r from-fuchsia-300 to-pink-400 hover:scale-105  shadow-cla-blue px-4 py-1 rounded-lg">Learn more</button>
                          
                          </div>
                        </div>
                      </div>
                    </div> */}
                </div>
              </div>
            </section>

            {/* <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
              {data.map((project) => (
              <>
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
                        <span className="absolute inset-0" />
                        {project.nameProject}
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
                      <p className="text-gray-600">{project.userData.positionUser !== "" ? project.userData.positionUser : "Belum ada Jabatan"}</p>
                    </div>
                  </div>
                </article>
             </div>
             </a>
             </>
              ))}
            </div> */}

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