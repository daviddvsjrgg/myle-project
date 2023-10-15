import React from 'react'
import Navbar from '../../../../components/Navbar/Navbar'
import Bottom from '../../../../components/BottomBar/Bottom'

const posts = [
  {
    id: 1,
    title: 'Bilingual 2021',
    href: '/toProjectTest',
    description:
      'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
    date: '24 Juli, 2021',
    datetime: '2020-03-16',
    category: { title: 'Informatika', href: '/titleTest' },
    author: {
      name: 'Joshua Ronaldo',
      role: 'Ketua Kelas',
      href: '/profileTest',
      imageUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    },
  },
  {
    id: 2,
    title: 'Aplikasi Manajemen',
    href: '/toProjectTest',
    description:
      'aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
    date: '31 Juli, 2023',
    datetime: '2020-03-16',
    category: { title: 'MGE', href: '/titleTest' },
    author: {
      name: 'Albert Evando',
      role: 'QC Intern',
      href: 'profileTest',
      imageUrl:
        'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHVzZXIlMjBwcm9maWxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    },
  },
  {
    id: 3,
    title: 'Test Automation',
    href: '/toProjectTest',
    description:
      'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
    date: 'Okt 21, 2022',
    datetime: '2023-10-10',
    category: { title: 'MGE', href: '/titleTest' },
    author: {
      name: 'David Dwiyanto',
      role: 'QC Intern',
      href: '/profileTest',
      imageUrl:
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHVzZXIlMjBwcm9maWxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    },
  },
  {
    id: 4,
    title: 'Project One',
    href: '/toProjectTest',
    description:
      'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
    date: 'Mar 16, 2023',
    datetime: '2020-03-16',
    category: { title: 'Public', href: '/titleTest' },
    author: {
      name: 'Veronica',
      role: 'Produk Manager',
      href: '/profileTest',
      imageUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    },
  },
  // More posts...
]

const Projek = () => {
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
              {posts.map((post) => (
              <div className="group block mx-auto rounded-lg p-6 bg-white ring-1 ring-slate-900/5 drop-shadow-lg space-y-3 hover:bg-gray-100 hover:ring-gray-200">
              <div className="flex items-center space-x-3">
                <article key={post.id} className="flex max-w-xl flex-col items-start justify-between">
                  <div className="flex items-center gap-x-4 text-xs">
                    <time dateTime={post.datetime} className="text-gray-500">
                      {post.date}
                    </time>
                    <a
                      href={post.category.href}
                      className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                    >
                      {post.category.title}
                    </a>
                  </div>
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900">
                      <a href={post.href}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </a>
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{post.description}</p>
                  </div>
                  <div className="relative mt-8 flex items-center gap-x-4">
                    <img src={post.author.imageUrl} alt="" className="h-10 w-10 rounded-full bg-gray-50" />
                    <div className="text-sm leading-6">
                      <p className="font-semibold text-gray-900">
                        <a href={post.author.href}>
                          <span className="absolute inset-0" />
                          {post.author.name}
                        </a>
                      </p>
                      <p className="text-gray-600">{post.author.role}</p>
                    </div>
                  </div>
                </article>
             </div>
             </div>
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