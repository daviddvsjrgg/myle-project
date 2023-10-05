import Bottom from '../../../../components/BottomBar/Bottom';
import Navbar from '../../../../components/Navbar/Navbar';


const dashboard = () => {
  return (
    <div className="min-h-full">
      <Navbar />
      <header className="bg-white drop-shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        </div>
      </header>

      {/* Start - Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8"></div>
      </main>
      {/* End - Content */}

     <Bottom />
    </div>
  )
}

export default dashboard