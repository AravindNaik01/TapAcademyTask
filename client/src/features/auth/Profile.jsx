import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useGetMeQuery, useUpdateProfileMutation, useGetDepartmentsQuery } from './authApi.js'
import { setCredentials, logout } from './authSlice.js'
import {
    RefreshCw,
    Mail,
    Briefcase,
    BadgeCheck,
    Calendar,
    Camera,
    Pencil,
    Save,
    X
} from 'lucide-react'

const Profile = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isSidebarOpen } = useOutletContext()
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-gray-600 font-medium">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (error) {
        if (error.status === 401 || error.status === 'FETCH_ERROR') {
            return (
                <div className="p-8 flex justify-center">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
                        <p className="text-red-800 font-bold text-lg mb-2">Authentication Error</p>
                        <p className="text-red-600 mb-6">Your session has expired. Please log in again.</p>
                        <button
                            onClick={() => {
                                dispatch(logout())
                                navigate('/')
                            }}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            )
        }
        return (
            <div className="p-8 flex justify-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
                    <p className="text-red-800 font-bold text-lg mb-2">Error Loading Profile</p>
                    <p className="text-red-600 mb-6">{error.data?.message || 'Failed to load profile'}</p>
                    <button
                        onClick={() => refetch()}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            {/* Header with Title and Refresh */}
            <div className="flex justify-between items-center mb-8">
                <div className={`flex items-center gap-3 transition-all duration-300 ${!isSidebarOpen ? 'ml-12' : ''}`}>
                    <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
                </div>
                <button
                    onClick={() => refetch()}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Refresh Data"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Main Profile Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                {/* Banner */}
                <div className="h-48 bg-[#0f172a] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-indigo-900/20"></div>
                    {/* Decorative patterns */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                <div className="px-8 pb-8">
                    <form onSubmit={handleSubmit}>
                        {/* Profile Header Row */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 mb-12 gap-6">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                                {/* Profile Image */}
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 text-4xl font-bold">
                                                {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 shadow-md transition-colors border-4 border-white">
                                            <Pencil size={16} />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                {/* Name & Role */}
                                <div className="text-center md:text-left mb-2">
                                    {isEditing ? (
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="text-3xl font-bold text-gray-900 border-b-2 border-indigo-200 focus:border-indigo-600 focus:outline-none bg-transparent w-full md:w-auto"
                                                placeholder="Enter your name"
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>
                                    ) : (
                                        <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
                                    )}
                                    <p className="text-gray-500 font-medium">Employee</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                {isEditing ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
                                        >
                                            <X size={18} />
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isUpdating || !hasChanges()}
                                            className="px-6 py-2.5 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUpdating ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2.5 rounded-xl font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        {successMessage && (
                            <div className="mb-8 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 border border-green-100">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="font-medium">{successMessage}</span>
                            </div>
                        )}

                        {errors.submit && (
                            <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <span className="font-medium">{errors.submit}</span>
                            </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email Card */}
                            <div className="p-6 bg-gray-50 rounded-2xl flex items-center gap-5 border border-gray-100 hover:border-gray-200 transition-colors group">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                                    <p className="text-gray-900 font-semibold text-lg">{user?.email}</p>
                                </div>
                            </div>

                            {/* Department Card */}
                            <div className="p-6 bg-gray-50 rounded-2xl flex items-center gap-5 border border-gray-100 hover:border-gray-200 transition-colors group">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <Briefcase size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Department</p>
                                    {isEditing ? (
                                        <div>
                                            {departments.length > 0 ? (
                                                <select
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    <option value="">Select Department</option>
                                                    {departments.map((dept) => (
                                                        <option key={dept._id} value={dept.name}>
                                                            {dept.name}
                                                        </option>
                                                    ))}
                                                    {formData.department && !departments.some(d => d.name === formData.department) && (
                                                        <option value={formData.department}>{formData.department}</option>
                                                    )}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Enter department"
                                                />
                                            )}
                                            {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                                        </div>
                                    ) : (
                                        <p className="text-gray-900 font-semibold text-lg">{user?.department || 'Not Assigned'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Employee ID Card */}
                            <div className="p-6 bg-gray-50 rounded-2xl flex items-center gap-5 border border-gray-100 hover:border-gray-200 transition-colors group">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <BadgeCheck size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Employee ID</p>
                                    <p className="text-gray-900 font-semibold text-lg font-mono">{user?.employeeId || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Join Date Card */}
                            <div className="p-6 bg-gray-50 rounded-2xl flex items-center gap-5 border border-gray-100 hover:border-gray-200 transition-colors group">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Join Date</p>
                                    <p className="text-gray-900 font-semibold text-lg">
                                        {user?.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Profile
