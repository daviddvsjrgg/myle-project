import React, { useState } from 'react'

const Bottom = () => {

  const [showBottom, setShowBottom] = useState(false)

  setTimeout(() => {
      setShowBottom(true)
  }, 1500);

  return (
    <>
    {showBottom && (
      <>
      <div className="min-h-screen -mt-60">
        <div className="sticky top-[100vh]">
        <footer className="footer footer-center p-4 bg-gray-900/90 text-gray-100">
          <aside>
            <p>Copyright © 2024 - All right reserved by David Dwiyanto</p>
          </aside>
        </footer>
        </div>
      </div>

      </>
    )}
    </>
  )
}

export default Bottom