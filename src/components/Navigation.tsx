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
  X,
  LucideIcon 
} from 'lucide-react';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import AppLogo from '../assets/vite.webp';

// Types
interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
}

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isMobile?: boolean;
  onClick?: () => void;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => Promise<void>;
}

// Constants
const NAV_ITEMS: NavItem[] = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/accounts', icon: CreditCard, label: 'Accounts' },
  { path: '/transactions', icon: DollarSign, label: 'Transactions' },
  { path: '/budgets', icon: PieChart, label: 'Budgets' },
];

// NavLink Component
const NavLink: React.FC<NavLinkProps> = ({ 
  to, 
  icon: Icon, 
  children, 
  isMobile = false,
  onClick 
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn("w-full", !isMobile && "w-auto")}
    >
      <Link
        to={to}
        onClick={onClick}
        className={cn(
          "inline-flex items-center w-full px-4 py-3 font-medium rounded-xl transition-all duration-200",
          isActive
            ? "text-white bg-indigo-600 shadow-lg shadow-indigo-200/50" 
            : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50",
          isMobile ? "text-lg" : "text-sm lg:text-base",
          "group"
        )}
      >
        <Icon className={cn(
          "transition-transform group-hover:scale-110 duration-200",
          isMobile ? "h-5 w-5 mr-3" : "h-4 w-4 lg:h-5 lg:w-5 mr-2.5"
        )} />
        {children}
      </Link>
    </motion.div>
  );
};

// Logo Component
const Logo: React.FC = () => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="flex-shrink-0"
  >
    <Link to="/" className="flex items-center">
      <img 
        src={AppLogo} 
        alt="ExpenseTracker" 
        className="h-8 w-auto lg:h-10 lg:w-auto"
      />
      <span className="ml-2.5 text-lg lg:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        ExpenseTracker
      </span>
    </Link>
  </motion.div>
);

// Mobile Menu Component
const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onLogout }) => {
  // Animation variants
  const containerVariants = {
    closed: { opacity: 0 },
    open: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="closed"
          variants={containerVariants}
          className="fixed inset-0 z-40 lg:hidden bg-white/95 backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
            <Logo />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>

          {/* Navigation Items */}
          <motion.div className="h-[calc(100vh-4rem)] px-4 py-6 overflow-y-auto">
            <div className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <motion.div
                  key={item.path}
                  variants={itemVariants}
                >
                  <NavLink
                    to={item.path}
                    icon={item.icon}
                    isMobile
                    onClick={onClose}
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}

              <motion.div variants={itemVariants}>
                <NavLink
                  to="/profile"
                  icon={User}
                  isMobile
                  onClick={onClose}
                >
                  Profile
                </NavLink>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-3">
                <Button
                  onClick={onLogout}
                  variant="danger"
                  className="w-full justify-center text-lg py-3 h-auto rounded-xl shadow-lg shadow-red-100 hover:shadow-red-200"
                >
                  <LogOut className="h-5 w-5 mr-2.5" />
                  Logout
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Nav Container Props
interface NavContainerProps {
  isScrolled: boolean;
  children: React.ReactNode;
}

// Nav Container Component
const NavContainer: React.FC<NavContainerProps> = ({ isScrolled, children }) => (
  <motion.nav
    initial={false}
    animate={{
      backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 1)",
      backdropFilter: isScrolled ? "blur(8px)" : "none",
      boxShadow: isScrolled 
        ? "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
        : "none"
    }}
    className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100"
  >
    {children}
  </motion.nav>
);

// Main Navigation Component
const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  if (!user) return null;

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <NavContainer isScrolled={isScrolled}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center flex-1">
              <Logo />
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex lg:items-center lg:ml-10 lg:space-x-2">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    icon={item.icon}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Desktop Right section */}
            <div className="hidden lg:flex lg:items-center lg:space-x-3">
              <NavLink to="/profile" icon={User}>Profile</NavLink>
              <Button
                onClick={handleLogout}
                variant="danger"
                className="px-4 py-3 h-auto text-base rounded-xl shadow-lg shadow-red-100 hover:shadow-red-200 group"
              >
                <LogOut className="h-5 w-5 mr-2.5 transition-transform group-hover:scale-110" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden rounded-xl"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </NavContainer>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
};

export default Navigation;