import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile, getProfile } from '@store/slices/authSlice'
import { authService } from '@services/authService'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const dispatch = useDispatch()
  const { user, isLoading } = useSelector((state) => state.auth)

  // Profile Form State
  const [username, setUsername] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')

  // Password Form State
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  // Active Tab
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    dispatch(getProfile())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      setUsername(user.username || '')
      setPhoneNumber(user.phone_number || '')
      setAddress(user.address || '')
    }
  }, [user])

  const handleUpdateProfile = (e) => {
    e.preventDefault()
    dispatch(updateProfile({ username, phone_number: phoneNumber, address }))
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long')
      return
    }

    setPwdLoading(true)
    try {
      await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      })
      toast.success('Password changed successfully!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      const serverErr = error.response?.data
      toast.error(serverErr?.old_password || serverErr?.detail || 'Failed to change password')
    } finally {
      setPwdLoading(false)
    }
  }

  return (
    <div className="container-custom py-10 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-left">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Navigation Tabs */}
        <div className="w-full md:w-1/4 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-primary-600 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'password'
                ? 'bg-primary-600 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Right Tab Contents */}
        <div className="w-full md:w-3/4 bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 text-left">
          {activeTab === 'profile' ? (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Settings</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email Address (Cannot Change)</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-field bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    id="phone"
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input-field"
                    placeholder="e.g. +2519..."
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Default Shipping Address</label>
                  <textarea
                    id="address"
                    rows="3"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field"
                    placeholder="Addis Ababa, Bole..."
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary py-2.5 px-6 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving Changes...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="old-pass" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    id="old-pass"
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="new-pass" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    id="new-pass"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-new-pass" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    id="confirm-new-pass"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={pwdLoading}
                    className="btn-primary py-2.5 px-6 disabled:opacity-50"
                  >
                    {pwdLoading ? 'Updating Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
