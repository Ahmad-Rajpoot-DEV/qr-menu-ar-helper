
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface NavBarProps {
  title?: string;
  showBackButton?: boolean;
  className?: string;
}

const NavBar: React.FC<NavBarProps> = ({
  title,
  showBackButton = false,
  className = '',
}) => {
  const navigate = useNavigate();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 glass-morphism px-4 py-3 ${className}`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 rounded-full hover:bg-secondary transition-colors duration-200"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {title && (
            <h1 className="text-lg font-medium font-display tracking-tight">{title}</h1>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
