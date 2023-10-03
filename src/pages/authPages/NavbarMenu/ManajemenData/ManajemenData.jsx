import React from 'react'
import Navbar from '../../../../components/Navbar/Navbar'

const ManajemenData = () => {
  return (
    <div className="min-h-full">
      <Navbar />
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manajemen Data</h1>
        </div>
      </header>

      {/* Start - Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          
        <div className="flex flex-col">
            <div className="overflow-x-auto">
                    <div className="py-3 pl-2">
                        <div className="relative max-w-xs">
                            <label htmlFor="hs-table-search" className="sr-only">
                                Search
                            </label>
                            <input
                                type="text"
                                name="hs-table-search"
                                id="hs-table-search"
                                className="block w-full p-3 pl-10 text-sm border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                                placeholder="Search..."
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
                <div className="p-1.5 w-full inline-block align-middle">
                    <div className="overflow-hidden border rounded-lg">
                      

                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                    >
                                        No
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                    >
                                        Nama
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                    >
                                        Penanggung Jawab
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-bold text-right text-gray-500 uppercase "
                                    >
                                        Edit
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-bold text-right text-gray-500 uppercase "
                                    >
                                        Delete
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                        1
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                        Jone Doe
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                        jonne62@gmail.com
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                        <a
                                            className="text-green-500 hover:text-green-700"
                                            href="/manajemen-data"
                                        >
                                            Edit
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                        <a
                                            className="text-red-500 hover:text-red-700"
                                            href="/manajemen-data"
                                        >
                                            Delete
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                        2
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                        Jone Doe
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                        jonne62@gmail.com
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                        <a
                                            className="text-green-500 hover:text-green-700"
                                            href="/manajemen-data"
                                        >
                                            Edit
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                        <a
                                            className="text-red-500 hover:text-red-700"
                                            href="/manajemen-data"
                                        >
                                            Delete
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                        3
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                        Jone Doe
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                        jonne62@gmail.com
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                        <a
                                            className="text-green-500 hover:text-green-700"
                                            href="/manajemen-data"
                                        >
                                            Edit
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                        <a
                                            className="text-red-500 hover:text-red-700"
                                            href="/manajemen-data"
                                        >
                                            Delete
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        </div>
      </main>
      {/* End - Content */}
      
    </div>
  )
}

export default ManajemenData