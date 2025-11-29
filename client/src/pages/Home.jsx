import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice.js'

import Orb from '../components/Orb'

const Home = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleLoginClick = (role) => {
        dispatch(logout())
        navigate('/login', { state: { role } })
    }

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
            {/* Background Orb */}
            <div className="absolute inset-0 z-0 pointer-events-auto">
                <Orb
                    hoverIntensity={0.4}
                    rotateOnHover={true}
                    hue={0}
                    forceHoverState={false}
                />
            </div>

            {/* Content Overlay - Minimal interference to let Orb show */}
            <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
                {/* Navbar - Transparent */}
                <nav className="w-full py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center pointer-events-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-lg">T</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">TAP Academy</span>
                    </div>
                    {/* Manager Portal button removed as requested */}
                </nav>

                {/* Hero Section - Centered */}
                <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pointer-events-auto">

                    {/* Badge */}
                    <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-medium text-gray-300 mb-8">
                        <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                        System Operational
                    </div>

                    {/* Heading */}
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                        Employee Attendance <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                            Management
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Streamline your workforce management with our efficient, automated, and secure attendance tracking system.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
                        <button
                            onClick={() => handleLoginClick('employee')}
                            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 active:scale-95"
                        >
                            Employee Login
                        </button>
                        <button
                            onClick={() => handleLoginClick('manager')}
                            className="w-full sm:w-auto px-8 py-3.5 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                        >
                            Manager Login
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <footer className="py-8 text-center text-gray-500 text-sm pointer-events-auto">
                    <p>&copy; {new Date().getFullYear()} Tap Academy. All rights reserved.</p>
                </footer>
            </div>
        </div>
    )
}

export default Home
