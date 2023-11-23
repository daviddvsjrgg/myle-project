import React from 'react'

const Url = () => {
  return (
    <div className='p-48'>
        <h3>{'Urlnya ->'}</h3>
        <ul>
            <li>
                <a href='/'>1. /</a>
            </li>
            <li>
                <a href='/login'>2. /login</a>
            </li>
            <li>
                <a href='/register'>3. /register</a>
            </li>
            <li>
                <a href='/manajemen-projek'>4. /manajemen-projek</a>
            </li>
            <li>
                <a href='/manajemen-projek/projek-baru'>5. /manajemen-projek/projek-baru</a>
            </li>
            <li>
                <a href='/manajemen-user'>6. /manajemen-user</a>
            </li>
            <li>
                <a href='/manajemen-user/user-baru'>7. /manajemen-user/user-baru</a>
            </li>
            <li>
                <a href='/projek'>8. /projek</a>
            </li>
            <li>
                <a href='/personal'>9. /personal</a>
            </li>
            <li>
                <a href='/personal/projek-baru'>10. /personal/projek-baru</a>
            </li>
            <li>
                <a href='/laporan'>11. /laporan</a>
            </li>
            <li>
                <a href='/kalkulasi'>12. /kalkulasi</a>
            </li>
            <li>
                <a href='/404'>13. /all-unspecified-url</a>
            </li>
            <li>
                <a href='/Url'>14. /Url</a>
            </li>
        </ul>
    </div>
  )
}

export default Url