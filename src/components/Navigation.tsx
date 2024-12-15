import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  Home, 
  CreditCard, 
  DollarSign, 
  PieChart, 
  User, 
  LogOut,
  Menu,
  X 
} from 'lucide-react';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';


const MobileMenuToggle: React.FC<{ isOpen: boolean; onClick: () => void }> = ({ isOpen, onClick }) => (
  <motion.div whileTap={{ scale: 0.95 }}>
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="h-9 w-9 p-0 inline-flex items-center justify-center rounded-xl hover:bg-indigo-50"
    >
      <AnimatePresence>
        {isOpen ? (
          <X className="h-5 w-5 text-indigo-600" />
        ) : (
          <Menu className="h-5 w-5 text-indigo-600" />
        )}
      </AnimatePresence>
    </Button>
  </motion.div>
);

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems: NavItem[] = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/accounts', icon: CreditCard, label: 'Accounts' },
    { path: '/transactions', icon: DollarSign, label: 'Transactions' },
    { path: '/budgets', icon: PieChart, label: 'Budgets' },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  const NavLink: React.FC<{ item: NavItem; isMobile?: boolean }> = ({ item, isMobile = false }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full sm:w-auto"
    >
      <Link
        to={item.path}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
        className={cn(
          "inline-flex items-center w-full px-3 sm:px-4 py-2.5 font-medium rounded-xl transition-all duration-200",
          isActivePath(item.path)
            ? "text-white bg-indigo-600 shadow-lg shadow-indigo-200" 
            : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50",
          isMobile ? "text-base" : "text-sm lg:text-base"
        )}
      >
        <item.icon className={cn(
          "mr-2.5",
          isMobile ? "h-5 w-5" : "h-4 w-4 lg:h-5 lg:w-5"
        )} />
        {item.label}
      </Link>
    </motion.div>
  );

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      height: "100vh",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: { x: -16, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center flex-1">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <Link to="/" className="flex items-center">
                  <Layout className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600" />
                  <span className="ml-2 text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ExpenseTracker
                  </span>
                </Link>
              </motion.div>

              <div className="hidden md:flex md:items-center md:ml-6 lg:ml-8 md:space-x-2 lg:space-x-3">
                {navItems.map((item) => (
                  <NavLink key={item.path} item={item} />
                ))}
              </div>
            </div>

            <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/profile"
                  className={cn(
                    "inline-flex items-center px-3 lg:px-4 py-2.5 text-sm lg:text-base font-medium rounded-xl transition-all duration-200",
                    isActivePath('/profile')
                      ? "text-white bg-indigo-600 shadow-lg shadow-indigo-200"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                  )}
                >
                  <User className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  Profile
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                  className="text-sm lg:text-base rounded-xl shadow-lg shadow-red-100 hover:shadow-red-200"
                >
                  <LogOut className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  Logout
                </Button>
              </motion.div>
            </div>

            <div className="flex items-center md:hidden">
             <MobileMenuToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="fixed inset-0 z-40 md:hidden bg-white/95 backdrop-blur-sm pt-14"
            >
              <div className="flex  items-center justify-end px-3 sm:px-4 py-2.5 border-b border-gray-100">
                 <MobileMenuToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
              </div>
              <motion.div 
                className="h-full px-3 py-4 space-y-2 overflow-y-auto"
                variants={menuVariants}
              >
                {navItems.map((item) => (
                  <motion.div key={item.path} variants={itemVariants}>
                    <NavLink item={item} isMobile />
                  </motion.div>
                ))}
                <motion.div variants={itemVariants}>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "inline-flex w-full items-center px-3 sm:px-4 py-2.5 text-base font-medium rounded-xl transition-all duration-200",
                      isActivePath('/profile')
                        ? "text-white bg-indigo-600 shadow-lg shadow-indigo-200"
                        : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                    )}
                  >
                    <User className="h-5 w-5 mr-2.5" />
                    Profile
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Button
                    variant="danger"
                    onClick={handleLogout}
                    className="w-full justify-start text-base rounded-xl shadow-lg shadow-red-100 hover:shadow-red-200"
                  >
                    <LogOut className="h-5 w-5 mr-2.5" />
                    Logout
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {/* Spacer for fixed navbar */}
      <div className="h-14 sm:h-16" />
    </>
  );
};

export default Navigation;