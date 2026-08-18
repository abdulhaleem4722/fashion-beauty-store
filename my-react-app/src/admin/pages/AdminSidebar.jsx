import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';

function AdminSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        signOut(auth).then(() => navigate('/admin/login'));
    };

    const navItems = [
        {
            to: '/admin/dashboard',
            label: 'Dashboard',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            to: '/admin/products',
            label: 'Products',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" />
                </svg>
            ),
        },
        {
            to: '/admin/add-product',
            label: 'Add Product',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            to: '/admin/sales',
            label: 'Sales',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V10M11 19V4M18 19v-7" />
                </svg>
            ),
        },
        {
            to: '/admin/sales-detail',
            label: 'Add sele',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V10M11 19V4M18 19v-7" />
                </svg>
            ),
        }
    ];

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
            isActive
                ? 'bg-[#C9A227] text-[#0B1220] shadow'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
        } ${collapsed ? 'justify-center' : ''}`;

    const SidebarNav = ({ onItemClick }) => (
        <div className="flex h-full flex-col">

            {/* Brand + Collapse Toggle — desktop only */}
            <div className={`hidden lg:flex items-center px-4 py-5 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed && (
                    <div className="min-w-0">
                        <span className="font-mono text-[10px] tracking-[0.3em] text-[#C9A227]">ADMIN</span>
                        <p className="truncate text-sm font-semibold text-white">Fashion Beauty</p>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(v => !v)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile brand header inside drawer */}
            <div className="lg:hidden flex items-center justify-between px-4 py-5">
                <div>
                    <span className="font-mono text-[10px] tracking-[0.3em] text-[#C9A227]">ADMIN</span>
                    <p className="text-sm font-semibold text-white">Fashion Beauty</p>
                </div>
                <button
                    onClick={onItemClick}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                    aria-label="Close menu"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="mx-4 mb-4 h-px bg-white/10" />

            {/* Nav Items */}
            <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onItemClick}
                        title={collapsed ? item.label : undefined}
                        className={navLinkClass}
                    >
                        {item.icon}
                        {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-5 mt-4">
                <div className="mb-4 h-px bg-white/10" />
                <button
                    onClick={handleLogout}
                    title={collapsed ? 'Log out' : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center' : ''}`}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {!collapsed && <span>Log out</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* ===== DESKTOP SIDEBAR ===== */}
            <aside
                className={`hidden lg:flex flex-col bg-[#0B1220] transition-all duration-300 h-screen sticky top-0 shrink-0 ${
                    collapsed ? 'w-[68px]' : 'w-56'
                }`}
            >
                <SidebarNav onItemClick={() => {}} />
            </aside>

            {/* ===== MOBILE: TOP BAR ===== */}
            <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-[#0B1220] px-4 py-3 shadow-md">
                <div>
                    <span className="font-mono text-[10px] tracking-[0.3em] text-[#C9A227]">ADMIN</span>
                    <p className="text-sm font-semibold text-white leading-tight">Fashion Beauty</p>
                </div>
                <button
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open navigation"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* ===== MOBILE: DRAWER OVERLAY ===== */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-[999] flex">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Drawer slides in from left */}
                    <aside className="relative z-10 w-64 max-w-[80vw] bg-[#0B1220] h-full shadow-2xl flex flex-col">
                        <SidebarNav onItemClick={() => setMobileOpen(false)} />
                    </aside>
                </div>
            )}
        </>
    );
}

export default AdminSidebar;