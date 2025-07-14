
import SideBar from '@/components/SideBar'
import React from 'react'
import { Outlet } from 'react-router-dom'

const Admin = () => {
  return (
    <div className='min-h-screen bg-gray-200 flex pt-16'>
     <SideBar/>
     <div className='flex-1'>
      <Outlet/>
     </div>
    </div>
  )
}

export default Admin