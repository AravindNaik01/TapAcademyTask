import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, CheckCircle, Terminal as TerminalIcon, MoreHorizontal } from 'lucide-react';

/**
 * TAP Academy - Internal Dev Portal
 * * Updates:
 * * - Imported real Tap Academy Logo.
 * * - Removed redundant "System Operational" badge.
 * * - Refined "New" badge to be subtle gray (Professional).
 * * - Added "Live" blinking cursor and glow to Terminal.
 */

const Home = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

    // Professional "Grid Spotlight" Animation
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const spacing = 40;
        const dots = [];

        const initGrid = () => {
            dots.length = 0;
            for (let x = 0; x < width; x += spacing) {
                for (let y = 0; y < height; y += spacing) {
                    dots.push({ x, y, baseRadius: 1, activeRadius: 2.5 });
                }
            }
        };

        let animationFrameId;
        let currentMouse = { x: -1000, y: -1000 };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            dots.forEach(dot => {
                const dx = currentMouse.x - dot.x;
                const dy = currentMouse.y - dot.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 200;

                let alpha = 0.1;
                let radius = dot.baseRadius;

                if (distance < maxDistance) {
                    const intensity = 1 - (distance / maxDistance);
                    alpha = 0.1 + (intensity * 0.5);
                    radius = dot.baseRadius + (intensity * (dot.activeRadius - dot.baseRadius));

                    if (distance < 50) {
                        ctx.beginPath();
                        ctx.moveTo(dot.x, dot.y);
                        ctx.lineTo(currentMouse.x, currentMouse.y);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${intensity * 0.2})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        initGrid();
        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initGrid();
        };

        const handleMouseMove = (e) => {
            currentMouse.x = e.clientX;
            currentMouse.y = e.clientY;
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        const handleMouseLeave = () => {
            currentMouse.x = -1000;
            currentMouse.y = -1000;
        }

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 overflow-hidden">

            {/* Background Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
            />

            {/* Navbar */}
            <nav className="relative z-20 w-full px-6 py-5 flex justify-between items-center max-w-7xl mx-auto bg-white/80 backdrop-blur-md sticky top-0 border-b border-slate-100/50">
                {/* Logo Section */}
                <div className="flex items-center gap-3">
                    {/* Imported Tap Academy Logo via Favicon Service for Reliability */}
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 bg-white overflow-hidden">
                        <img
                            src="https://www.google.com/s2/favicons?domain=thetapacademy.com&sz=128"
                            alt="Tap Academy Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-extrabold text-xl text-slate-900 tracking-tight">TAP Academy</span>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Internal Dev Portal</span>
                    </div>
                </div>

                {/* Right Actions - Removed "System Operational" Badge */}
                <div className="flex items-center gap-6">
                    <a href="#" className="hidden md:block text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
                        Documentation
                    </a>

                    <button
                        onClick={() => navigate('/login')}
                        className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-md"
                    >
                        Log in
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col lg:flex-row items-center justify-between pt-16 pb-20 px-6 max-w-7xl mx-auto h-full min-h-[calc(100vh-80px)]">

                {/* Left Content */}
                <div className="flex-1 text-center lg:text-left max-w-2xl mt-8 lg:mt-0">

                    {/* Badge - Muted Gray (Professional) */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium mb-8 border border-slate-200 shadow-sm self-start hover:border-slate-300 transition-colors cursor-default">
                        <span className="bg-slate-600 text-white px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-bold">New</span>
                        Q4 Engineering Roadmap released
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
                        Build faster, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            manage better.
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                        The central hub for TAP Academy developers and staff. Access deployment pipelines, attendance logs, and HR resources in one unified platform.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
                        {/* Developer Login (Purple) */}
                        <button
                            onClick={() => navigate('/login', { state: { role: 'employee' } })}
                            className="bg-indigo-600 text-white h-14 px-8 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-3"
                        >
                            <User size={20} />
                            Developer Login
                        </button>

                        {/* Manager Console (Green) */}
                        <button
                            onClick={() => navigate('/login', { state: { role: 'manager' } })}
                            className="bg-emerald-600 text-white h-14 px-8 rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-3"
                        >
                            <Briefcase size={20} />
                            Manager Console
                        </button>
                    </div>

                    {/* Bottom Text */}
                    <div className="mt-20 text-xs font-bold text-slate-300 uppercase tracking-widest hidden md:block">
                        Internal Modules
                    </div>
                </div>

                {/* Right Visual: Terminal Mockup */}
                <div className="flex-1 relative w-full flex items-center justify-center lg:justify-end mt-12 lg:mt-0">
                    {/* Terminal Window */}
                    <div className="w-full max-w-lg bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden transform hover:scale-[1.005] transition-transform duration-500 group relative z-10">
                        {/* Terminal Header */}
                        <div className="bg-slate-800/50 px-4 py-3 flex items-center gap-4 border-b border-slate-700/50">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            </div>
                            <div className="text-xs font-mono text-slate-400 flex items-center gap-2 group-hover:text-slate-300 transition-colors">
                                <TerminalIcon size={12} />
                                tap-internal-cli -- -zsh
                            </div>
                        </div>

                        {/* Terminal Body */}
                        <div className="p-6 font-mono text-sm">
                            {/* Command 1 */}
                            <div className="flex items-center gap-2 text-slate-300 mb-4">
                                <span className="text-emerald-400 font-bold">➜</span>
                                <span className="text-blue-400 font-bold">~</span>
                                <span>tap-cli status --verbose</span>
                            </div>

                            <div className="text-slate-500 text-xs uppercase tracking-widest mb-4 font-bold">System Diagnostics</div>

                            {/* Status Checks */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-emerald-400">
                                    <CheckCircle size={16} />
                                    <span className="text-slate-300">Attendance Service: <span className="text-white font-bold">Online</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-emerald-400">
                                    <CheckCircle size={16} />
                                    <span className="text-slate-300">Payroll Engine: <span className="text-white font-bold">Active</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-emerald-400">
                                    <CheckCircle size={16} />
                                    <span className="text-slate-300">LMS Gateway: <span className="text-white font-bold">Connected (12ms)</span></span>
                                </div>
                            </div>

                            {/* Active Prompt with Blinking Cursor */}
                            <div className="flex items-center gap-2 text-slate-300">
                                <span className="text-emerald-400 font-bold">➜</span>
                                <span className="text-blue-400 font-bold">~</span>
                                <span className="w-2.5 h-5 bg-slate-400 animate-pulse"></span>
                            </div>
                        </div>
                    </div>

                    {/* Live Glow behind terminal */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-indigo-500/10 blur-3xl -z-10 rounded-full pointer-events-none animate-pulse-slow"></div>
                </div>
            </main>

            {/* Floating Action Button (Bottom Right) */}
            <div className="fixed bottom-6 right-6 z-50">
                <button className="w-12 h-12 bg-white text-slate-700 border border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all cursor-pointer hover:border-indigo-200 hover:text-indigo-600">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse-slow {
           0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
           50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
        }
        .animate-pulse {
          animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-slow {
           animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>

        </div>
    );
};

export default Home;
