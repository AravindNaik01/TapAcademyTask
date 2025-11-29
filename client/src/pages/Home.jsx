import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice.js'

const Home = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleLoginClick = (role) => {
        dispatch(logout())
        navigate('/login', { state: { role } })
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 flex items-center">

                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => handleLoginClick('manager')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                            >
                                Manager Login
                            </button>
                            <button
                                onClick={() => handleLoginClick('employee')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                            >
                                Employee Login
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="flex-grow flex items-center justify-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Employee Attendance Management
                    </h2>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                        Streamline your workforce management with our efficient attendance tracking system.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <button
                            onClick={() => handleLoginClick('employee')}
                            className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Tap Academy. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default Home
