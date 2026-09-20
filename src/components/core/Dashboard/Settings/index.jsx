import React from 'react'
import ChangeProfilePicture from './ChangeProfilePicture'
import EditProfile from './EditProfile'
import UpdatePassword from './UpdatePassword'
import DeleteAccount from './DeleteAccount'

const Settings = () => {
  return (
    <div>
      <h1 className='mb-14 text-3xl font-medium text-global-text-primary'>
        Edit Profile
      </h1>

      <ChangeProfilePicture />

      <EditProfile />

      <UpdatePassword />

      <DeleteAccount />
    </div>
  )
}

export default Settings