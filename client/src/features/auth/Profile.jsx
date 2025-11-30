import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useGetMeQuery, useUpdateProfileMutation, useGetDepartmentsQuery } from './authApi.js'
import { setCredentials, logout } from './authSlice.js'
import { RefreshCw } from 'lucide-react'

const Profile = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user: userFromStore, accessToken } = useSelector((state) => state.auth)

    // Fetch user data with refetch on mount to ensure freshness
    const { data: meData, isLoading, error, refetch } = useGetMeQuery(undefined, {
        skip: !accessToken,
        refetchOnMountOrArgChange: true,
    })

    // Fetch departments for the dropdown
    const { data: departmentsData } = useGetDepartmentsQuery()
    const departments = departmentsData?.data || []

    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()

    const user = meData?.data || userFromStore

    const [formData, setFormData] = useState({
        name: '',
        department: '',
    })
    const [errors, setErrors] = useState({})
    const [isEditing, setIsEditing] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                department: user.department || '',
            })
            if (user.profileImage) {
                // Construct full URL for image
                const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'
                setImagePreview(`${baseUrl}${user.profileImage}`)
            }
        }
    }, [user])

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' })
        }
        setSuccessMessage('')
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.name || formData.name.trim() === '') {
            newErrors.name = 'Name is required'
        }
        if (!formData.department || formData.department.trim() === '') {
            newErrors.department = 'Department is required'
        }
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        try {
            const formDataToSend = new FormData()
            formDataToSend.append('name', formData.name.trim())
            formDataToSend.append('department', formData.department.trim())
            if (imageFile) {
                formDataToSend.append('image', imageFile)
            }

            const result = await updateProfile(formDataToSend).unwrap()

            // Update Redux store with new user data
            const currentToken = accessToken || sessionStorage.getItem('accessToken')
            dispatch(
                setCredentials({
                    user: result.data,
                    accessToken: currentToken || '',
                })
            )

            setSuccessMessage('Profile updated successfully!')
            setIsEditing(false)
            setErrors({})
            setImageFile(null)

            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage('')
            }, 5000)

            // Refetch to ensure data is up to date
            refetch()
        } catch (err) {
            setErrors({
                submit: err.data?.message || 'Failed to update profile. Please try again.',
            })
            setSuccessMessage('')
        }
    }

    const handleCancel = () => {
        // Reset form to original values
        if (user) {
            setFormData({
                name: user.name || '',
                department: user.department || '',
            })
            if (user.profileImage) {
                const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'
                setImagePreview(`${baseUrl}${user.profileImage}`)
            } else {
                setImagePreview(null)
            }
        }
        setImageFile(null)
        setIsEditing(false)
        setErrors({})
        setSuccessMessage('')
    }

    const hasChanges = () => {
        if (!user) return false
        return formData.name !== user.name || formData.department !== user.department || imageFile !== null
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        // Handle 401 Unauthorized - redirect to login
        if (error.status === 401 || error.status === 'FETCH_ERROR') {
            return (
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <p className="text-red-800 font-semibold mb-2">Authentication Error</p>
                            <p className="text-red-600 text-sm mb-4">
                                Your session has expired. Please log in again.
                            </p>
                            <button
                                onClick={() => {
                                    dispatch(logout())
                                    navigate('/')
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <p className="text-red-800 font-semibold mb-2">Error Loading Profile</p>
                        <p className="text-red-600 text-sm">{error.data?.message || 'Failed to load profile'}</p>
                        <button
                            onClick={() => refetch()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <button
                        onClick={() => refetch()}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>

                {/* ... (success/error messages) */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 font-medium flex items-center">
                            <span className="mr-2">✓</span>
                            {successMessage}
                        </p>
                    </div>
                )}

                {errors.submit && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 font-medium">{errors.submit}</p>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Image */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative h-32 w-32 mb-4">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Profile"
                                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                                    />
                                ) : (
                                    <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-white shadow-lg">
                                        <span className="text-4xl text-indigo-500 font-bold">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                                        </span>
                                    </div>
                                )}
                                {isEditing && (
                                    <label
                                        htmlFor="image-upload"
                                        className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 shadow-md transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            {isEditing && <p className="text-sm text-gray-500">Click the pencil icon to upload a new photo</p>}
                        </div>

                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${isEditing
                                    ? 'border-gray-300'
                                    : 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                    } ${errors.name ? 'border-red-500' : ''}`}
                                placeholder="Enter your full name"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* Email Field - Read Only */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        {/* Employee ID - Read Only */}
                        <div>
                            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                                Employee ID
                            </label>
                            <input
                                id="employeeId"
                                name="employeeId"
                                type="text"
                                value={user?.employeeId || ''}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Employee ID cannot be changed</p>
                        </div>

                        {/* Department Field */}
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                Department <span className="text-red-500">*</span>
                            </label>
                            {isEditing && departments.length > 0 ? (
                                <select
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.department ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept._id} value={dept.name}>
                                            {dept.name}
                                        </option>
                                    ))}
                                    {/* Fallback if current department is not in list */}
                                    {formData.department && !departments.some(d => d.name === formData.department) && (
                                        <option value={formData.department}>{formData.department}</option>
                                    )}
                                </select>
                            ) : (
                                <input
                                    id="department"
                                    name="department"
                                    type="text"
                                    value={formData.department}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${isEditing
                                        ? 'border-gray-300'
                                        : 'border-gray-300 bg-gray-50 cursor-not-allowed'
                                        } ${errors.department ? 'border-red-500' : ''}`}
                                    placeholder="Enter your department"
                                />
                            )}
                            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                        </div>

                        {/* Role - Read Only */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <input
                                type="text"
                                value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                            />
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex gap-4 pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={isUpdating || !hasChanges()}
                                    className={`px-6 py-2 rounded-md font-medium transition-colors ${isUpdating || !hasChanges()
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                >
                                    {isUpdating ? (
                                        <span className="inline-flex items-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isUpdating}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {!isEditing && !hasChanges() && (
                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 italic">
                                    Click "Edit Profile" to update your information
                                </p>
                            </div>
                        )}
                    </form>
                </div>

                {/* Account Information Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Account Information</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600 font-medium">User ID:</span>
                            <span className="text-gray-900 font-mono text-xs">{user?._id || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600 font-medium">Account Created:</span>
                            <span className="text-gray-900">
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : 'N/A'}
                            </span>
                        </div>
                        {user?.updatedAt && (
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 font-medium">Last Updated:</span>
                                <span className="text-gray-900">
                                    {new Date(user.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
