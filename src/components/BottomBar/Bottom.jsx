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
      <div className='mt-28 bottom-0'>
      <footer className="footer footer-center p-4 bg-gray-900/90 text-gray-100">
        <aside>
          <p>Copyright © 2024 - All right reserved by David Dwiyanto</p>
        </aside>
      </footer>
      </div>
      </>
    )}
    </>
  )
}

export default Bottom