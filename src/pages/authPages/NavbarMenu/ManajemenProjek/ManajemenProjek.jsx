import React from 'react'
import Navbar from '../../../../components/Navbar/Navbar'

const people = [
  {
    number : '1',
    namaProjek: 'Test Automation',
    nama: 'David Dwiyanto',
    department: 'QC Intern',
    role: 'Researcher',
    email: 'jane.cooper@example.com',
  },
  {
    number : '2',
    namaProjek: 'John Doe',
    nama: 'Regional Paradigm Technician',
    department: 'Optimization',
    role: 'Tester',
    email: 'john.doe@example.com',
  },
  {
    number : '3',
    namaProjek: 'Veronica Lodge',
    nama: 'Regional Paradigm Technician',
    department: 'Optimization',
    role: ' Software Engineer',
    email: 'veronica.lodge@example.com',
  },
  // More people...
];

const ManajemenProjek = () => {
  return (
    <div className="min-h-full">
      <Navbar />
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manajemen Projek</h1>
        </div>
      </header>

      {/* Start - Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          
        <div className="flex flex-col ml-1 mr-1">
                        <div className="relative max-w-xs py-3">
                            <label htmlFor="hs-table-search" className="sr-only">
                                Search
                            </label>
                            <input
                                type="text"
                                namaProjek="hs-table-search"
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
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
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
                    Nama Projek
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Penanggung Jawab
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {people.map(person => (
                  <tr key={person.email}>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-5">
                          <div className="text-sm font-medium text-gray-900">{person.number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{person.namaProjek}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{person.nama}</div>
                      <div className="text-sm text-gray-500">{person.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 inline-flex text-xs leading-5
                      font-semibold rounded-full bg-green-100 text-green-800"
                      >
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="/manajemen-projek" className="text-indigo-600 hover:text-indigo-900">
                        Detail
                      </a>
                    </td>
                  </tr>
                ))}
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

export default ManajemenProjek