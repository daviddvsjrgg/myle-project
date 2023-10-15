import React from 'react'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import Navbar from '../../../../../components/Navbar/Navbar'
import Bottom from '../../../../../components/BottomBar/Bottom'

const AddUser = () => {
  return (

    <div className="min-h-full">
      <Navbar />
      <header className="bg-white drop-shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tambah Akun</h1>
        </div>
      </header>

      {/* Start - Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">

        <form className='m-4'>
            <div className="space-y-12">

                <div className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base font-semibold leading-7 text-gray-900">Informasi Personal</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">Masukkan informasi akun kamu di form berikut.</p>

                <div className="col-span-full mt-8">
                    <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900">
                        Photo
                    </label>
                    <div className="mt-2 flex items-center gap-x-3">
                        <UserCircleIcon className="h-12 w-12 text-gray-300" aria-hidden="true" />
                        <button
                        type="button"
                        className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                        Ubah
                        </button>
                    </div>
                    </div>

                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                    <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                        Username
                    </label>
                    <div className="mt-2">
                        <input
                        autoFocus
                        type="text"
                        name="first-name"
                        id="first-name"
                        autoComplete="given-name"
                        className="block mb-1 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <p className="mt-1 mb-1 text-sm leading-6 text-gray-600">Username akan tampil dan dilihat oleh user lain.</p>
                    </div>
                    </div>

                    <div className="sm:col-span-3">

                    </div>

                    <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                        Email address
                    </label>
                    <div className="mt-2">
                        <input
                        placeholder='ex:example@gmail.com'
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <p className="mt-1 mb-1 text-sm leading-6 text-gray-600">Email ini akan digunakan untuk login aplikasi ini.</p>
                    </div>
                    </div>

                    <div className="sm:col-span-3">
                  
                    </div>

                    <div className="col-span-full">
                    <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
                        Masukkan Password
                    </label>
                    <div className="mt-2">
                        <input
                        type="password"
                        name="user-password"
                        id="user-password"
                        autoComplete="user-password"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                    </div>

                    <div className="col-span-full">
                    <label htmlFor="user-password1" className="block text-sm font-medium leading-6 text-gray-900">
                        Masukkan password Yang Sama
                    </label>
                    <div className="mt-2">
                        <input
                        type="password"
                        name="user-password1"
                        id="user-password1"
                        autoComplete="user-password1"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                    </div>

                <div className="sm:col-span-full">
                <label htmlFor="akses" className="block text-sm font-medium leading-6 text-gray-900">
                        Akses
                    </label>
                    <div className="mt-2">
                        <select
                        id="akses"
                        name="akses"
                        autoComplete="akses"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                        <option>User</option>
                        <option>Admin</option>
                        </select>
                        <p className="mt-1 mb-1 text-sm leading-6 text-gray-600">Berikan level akses untuk akun ini.</p>
                    </div>
                </div>
                  
                </div>
                </div>

               
            </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                    Tambahkan
                    </button>
                </div>
            </form>

        </div>
      </main>
      {/* End - Content */}
      
      <Bottom />
    </div>

    
  )
}

export default AddUser