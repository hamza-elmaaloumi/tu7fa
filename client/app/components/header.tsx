'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  Bell, 
  Hammer, 
  ShoppingBag, 
  LayoutDashboard,
  Gem,
  LogOut
} from 'lucide-react';
import axios from 'axios';

export default function Header() {
  const { user, setUser, logout } = useUser();
  const pathname = usePathname();
  
  // State
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isCheckingNotifications, setIsCheckingNotifications] = useState(false);

  // Click outside handlers
  const authRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Function to check for unread notifications
  const checkUnreadNotifications = async () => {
    if (!user || user.id === null) {
      setHasUnreadNotifications(false);
      return;
    }

    setIsCheckingNotifications(true);
    try {
      const url = user.type === 'client' 
        ? `http://192.168.1.110:8000/notify/unread-notifications/client/${user.id}`
        : `http://192.168.1.110:8000/notify/unread-notifications/maalem/${user.id}`;
      
      const res = await axios.get(url);
      setHasUnreadNotifications(res.data.unread_count > 0);
    } catch (error) {
      console.error('Error checking notifications:', error);
      setHasUnreadNotifications(false);
    } finally {
      setIsCheckingNotifications(false);
    }
  };

  // Set up interval to check for notifications
  useEffect(() => {
    if (!user || user.id === null) {
      setHasUnreadNotifications(false);
      return;
    }

    // Initial check
    checkUnreadNotifications();

    // Set up interval to check every 30 seconds
    const intervalId = setInterval(checkUnreadNotifications, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [user]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (authRef.current && !authRef.current.contains(event.target as Node)) {
        setAuthDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check notifications when user dropdown is opened
  const handleUserDropdownToggle = () => {
    if (!userDropdownOpen) {
      checkUnreadNotifications();
    }
    setUserDropdownOpen(!userDropdownOpen);
  };

  // --- Components ---

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors duration-200 ${
          isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
        }`}
      >
        {children}
      </Link>
    );
  };

  const MobileNavLink = ({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) => (
    <Link
      href={href}
      onClick={onClick}
      className="block py-3 px-4 text-neutral-300 hover:bg-neutral-800 rounded-xl transition-colors"
    >
      {children}
    </Link>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* 1. Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white rotate-3 group-hover:rotate-0 transition-transform duration-300">
            <span className="font-serif font-bold text-lg">T</span>
          </div>
          <span className="font-serif text-2xl font-semibold text-white tracking-tight">
            Turath
          </span>
        </Link>

        {/* 2. Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink href="/home">Home</NavLink>
          <NavLink href="/products">Inventory</NavLink>
          <NavLink href="/maalem">Artisans</NavLink>
        </nav>

        {/* 3. Actions / User Menu */}
        <div className="hidden md:flex items-center gap-4">
          
          {user.id === null ? (
            /* Unauthenticated State */
            <div className="relative" ref={authRef}>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                  className="text-sm font-medium text-neutral-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  Log in <ChevronDown className={`w-3 h-3 transition-transform ${authDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <Link 
                  href="/register"
                  className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Get Started
                </Link>
              </div>

              {/* Auth Dropdown */}
              {authDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 p-1">
                  <div className="p-2 border-b border-neutral-800/50">
                    <span className="text-xs font-semibold text-neutral-500 uppercase px-2">Client Access</span>
                    <Link href="/login" className="flex items-center gap-2 px-2 py-2 mt-1 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors">
                      <ShoppingBag className="w-4 h-4" /> Client Login
                    </Link>
                  </div>
                  <div className="p-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase px-2">Artisan Access</span>
                    <Link href="/login/maalem" className="flex items-center gap-2 px-2 py-2 mt-1 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors">
                      <Hammer className="w-4 h-4" /> Maalem Login
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Authenticated State */
            <div className="flex items-center gap-4">
              {/* Notification Bell with dynamic indicator */}
              <a 
                href="/notifications" 
                className="relative p-2 text-neutral-400 hover:text-white transition-colors group"
                onClick={checkUnreadNotifications}
              >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                
                {/* Unread notification indicator */}
                {hasUnreadNotifications && (
                  <>
                    {/* Pulsing background effect */}
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></span>
                    
                    {/* Solid indicator */}
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-neutral-900"></span>
                    
                    {/* Pulse animation on hover */}
                    <span className="absolute inset-0 rounded-full group-hover:bg-red-500/10 group-hover:animate-pulse"></span>
                  </>
                )}
                
                {/* Loading state */}
                {isCheckingNotifications && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse border border-neutral-900"></span>
                )}
              </a>

              {/* User Profile Dropdown */}
              <div className="relative" ref={userRef}>
                <button 
                  onClick={handleUserDropdownToggle}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-neutral-800 hover:border-neutral-600 bg-neutral-900/50 transition-all group"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white group-hover:scale-110 transition-transform">
                    {user.type === 'maalem' ? 'M' : 'C'}
                  </div>
                  <span className="text-sm font-medium text-neutral-200 max-w-[100px] truncate">
                    {user.type === 'client' ? 'Client' : user.type === 'maalem' ? 'Maalem' : 'Admin'}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-neutral-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-neutral-800">
                      <p className="text-sm font-medium text-white">Welcome back</p>
                      <p className="text-xs text-neutral-500 capitalize">{user.type} Account</p>
                    </div>
                    
                    <div className="p-1 space-y-0.5">
                      {user.type === 'client' && (
                        <>
                          <Link 
                            href="/client/profile" 
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <User className="w-4 h-4" /> Profile
                          </Link>
                          <Link 
                            href="/client/my-offers" 
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <Gem className="w-4 h-4" /> My Offers
                          </Link>
                        </>
                      )}

                      {user.type === 'maalem' && (
                        <>
                          <Link 
                            href="/maalem/products" 
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link 
                            href="/maalem/products" 
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <Hammer className="w-4 h-4" /> My Products
                          </Link>
                        </>
                      )}

                      {user.type === 'admin' && (
                        <>
                          <Link 
                            href="/admin/offers" 
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" /> offers
                          </Link>
                          <Link 
                            href="/admin/analysis" 
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <Hammer className="w-4 h-4" /> analysis
                          </Link>
                        </>
                      )}
                      
                      {/* Notifications link with badge */}
                      <Link 
                        href="/notifications" 
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setHasUnreadNotifications(false); // Mark as read when clicked
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4" /> Notifications
                        </div>
                        {hasUnreadNotifications && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </Link>
                    </div>

                    <div className="border-t border-neutral-800 mt-1 p-1">
                       <button 
                         onClick={() => {
                           logout();
                           setUserDropdownOpen(false);
                         }} 
                         className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-950/30 transition"
                       >
                          <LogOut className="w-4 h-4" /> Sign Out
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Mobile Toggle */}
        <button 
          className="md:hidden text-neutral-300"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* 5. Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black md:hidden animate-in slide-in-from-right duration-300">
          <div className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <span className="font-serif text-2xl font-semibold text-white">Tu7fa</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-neutral-400">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <MobileNavLink href="/products" onClick={() => setMobileMenuOpen(false)}>Inventory</MobileNavLink>
              <MobileNavLink href="/maalem" onClick={() => setMobileMenuOpen(false)}>Artisans</MobileNavLink>
              
              <div className="border-t border-neutral-800 my-4 pt-4"></div>
              
              {user.id === null ? (
                <>
                  <MobileNavLink href="/login" onClick={() => setMobileMenuOpen(false)}>Client Login</MobileNavLink>
                  <MobileNavLink href="/login/maalem" onClick={() => setMobileMenuOpen(false)}>Maalem Login</MobileNavLink>
                  <MobileNavLink href="/register" onClick={() => setMobileMenuOpen(false)}>Register</MobileNavLink>
                </>
              ) : (
                <>
                  <p className="px-4 text-xs font-semibold text-neutral-500 uppercase mb-2">My Account</p>
                  {user.type === 'client' ? (
                     <>
                      <MobileNavLink href="/client/profile" onClick={() => setMobileMenuOpen(false)}>Profile</MobileNavLink>
                      <MobileNavLink href="/client/my-offers" onClick={() => setMobileMenuOpen(false)}>My Offers</MobileNavLink>
                     </>
                  ) : (
                     <MobileNavLink href="/maalem/products" onClick={() => setMobileMenuOpen(false)}>My Products</MobileNavLink>
                  )}
                  
                  {/* Notifications in mobile menu */}
                  <div className="relative">
                    <Link 
                      href="/notifications" 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setHasUnreadNotifications(false);
                      }}
                      className="flex items-center justify-between py-3 px-4 text-neutral-300 hover:bg-neutral-800 rounded-xl transition-colors"
                    >
                      <span>Notifications</span>
                      {hasUnreadNotifications && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </Link>
                  </div>
                  
                  <button 
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }} 
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-neutral-800 rounded-xl mt-4"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}