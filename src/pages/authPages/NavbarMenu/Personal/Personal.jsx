import React from 'react'
import Navbar from '../../../../components/Navbar/Navbar'
import Bottom from '../../../../components/BottomBar/Bottom'

const posts = [
    {
      id: 1,
      title: 'My Project 1',
      href: '/toProjectTest',
      description:
        'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
      date: '24 Juli, 2021',
      datetime: '2020-03-16',
      category: { title: 'Private', href: '/titleTest' },
      author: {
        name: 'David Dwiyanto',
        role: 'User',
        href: '/profileTest',
        imageUrl:
          'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    },
    
    // More posts...
  ]

const Personal = () => {
  return (
        <div className="min-h-full">
            <Navbar />
            <header className="bg-white drop-shadow-md">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Personal</h1>
                </div>
            </header>

            {/* Start - Content */}
            <main>

            <div className="mx-auto max-w-7xl mt-8">
                <div className="bg-white">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex justify-between ...">
                            <div className="order-first">
                                <a href="/personal/projek-baru" className="mb-3 group block max-w-sm rounded-lg p-2.5 bg-gray-50 ring-1 ring-slate-900/5 shadow-sm space-y-3 hover:bg-indigo-600 hover:ring-indigo-600">
                                <div className="flex items-center space-x-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                                    </svg>
                                    <h3 className="text-slate-900 group-hover:text-white text-sm font-semibold">Projek Baru</h3>
                                </div>
                                </a>
                            </div>
                             <div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl">

                <div className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">

                    {/* Header */}

                    {/* End Header */}

                </div>
                <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
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

export default Personal