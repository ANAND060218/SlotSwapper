import React, { useContext, useState, useEffect, useRef } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { AuthContext, IAuthContext } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import {
  LayoutDashboard,
  GanttChartSquare,
  ArrowRightLeft,
  Bell,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react'

const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const Layout: React.FC = () => {
  const { token, logout } = useContext(AuthContext) as IAuthContext
  const { notifications, hasUnread, clearUnread } = useSocket();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const nav = useNavigate();
  
  // Refs for click-outside logic
  const popoverRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    logout()
    nav('/login')
  }

  const handleBellClick = () => {
    setIsPopoverOpen(prev => !prev);
    if (!isPopoverOpen) {
      clearUnread();
    }
  };

  // Click-outside listener
  useEffect(() => {
    if (!isPopoverOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        bellRef.current && 
        !bellRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopoverOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-secondary/50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto h-16 flex items-center px-4">
          <Link to="/" className="font-bold text-xl text-primary mr-6">
            SlotSwapper
          </Link>
          
          <nav className="flex items-center space-x-4 lg:space-x-6">
            {token && (
              <>
                <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link to="/marketplace" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  <GanttChartSquare className="h-4 w-4" /> Marketplace
                </Link>
                <Link to="/requests" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  <ArrowRightLeft className="h-4 w-4" /> Requests
                </Link>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center space-x-4">
            {token ? (
              <>
                <div className="relative">
                  <button 
                    ref={bellRef} // Attach ref
                    onClick={handleBellClick} 
                    className="relative text-muted-foreground transition-colors hover:text-primary"
                  >
                    <BellIcon className="h-5 w-5" />
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </button>

                  {isPopoverOpen && (
                    <div 
                      ref={popoverRef} // Attach ref
                      className="absolute right-0 top-full mt-2 w-72 bg-card border rounded-lg shadow-lg z-10"
                    >
                      <div className="p-3"><h4 className="font-semibold text-sm">Notifications</h4></div>
                      <div className="border-t">
                        {notifications.length > 0 ? (
                          <ul className="py-2 max-h-60 overflow-y-auto">
                            {notifications.map((msg, index) => (
                              <li key={index} className="px-3 py-2 text-sm text-foreground border-b last:border-b-0">{msg}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="py-4 text-center text-sm text-muted-foreground">No new notifications</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  <LogIn className="h-4 w-4" /> Login
                </Link>
                <Link to="/signup" className="flex items-center gap-2 text-sm font-medium text-primary">
                  <UserPlus className="h-4 w-4" /> Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-7xl mx-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout;