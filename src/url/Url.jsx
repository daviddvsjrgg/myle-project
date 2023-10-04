import React from 'react'

const Url = () => {
  return (
    <div>
        <h3>{'Urlnya ->'}</h3>
        <ul>
            <li>
                <a href='/'>/ {'(Dashboard)'}</a>
            </li>
            <li>
                <a href='/login'>/login</a>
            </li>
            <li>
                <a href='/register'>/register</a>
            </li>
            <li>
                <a href='/manajemen-projek'>/manajemen-projek</a>
            </li>
            <li>
                <a href='/manajemen-user'>/manajemen-user</a>
            </li>
            <li>
                <a href='/projek'>/projek</a>
            </li>
            <li>
                <a href='/laporan'>/laporan</a>
            </li>
            <li>
                <a href='/kalkulasi'>/kalkulasi</a>
            </li>
            <li>
                <a href='/404'>/404</a>
            </li>
        </ul>
    </div>
  )
}

export default Url