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
        </ul>
    </div>
  )
}

export default Url