import { Link } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-navy-primary border-b border-gold-800 relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gold-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-navy-primary" fill="currentColor" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">Sello Saka</div>
              <div className="text-gold-600 text-sm">Foundation</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-white hover:text-gold-400 transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-white hover:text-gold-400 transition-colors">
              About
            </Link>
            <Link to="/programs" className="text-white hover:text-gold-400 transition-colors">
              Programs
            </Link>
            <Link to="/impact" className="text-white hover:text-gold-400 transition-colors">
              Impact Stories
            </Link>
            <Link to="/contact" className="text-white hover:text-gold-400 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="border-gold-600 text-gold-600 bg-transparent hover:bg-white hover:text-navy-primary hover:border-white"
            >
              <Link to="/apply">Apply for Assistance</Link>
            </Button>
            <Button asChild className="bg-gold-600 hover:bg-gold-400 text-navy-primary">
              <Link to="/donate">
                <Heart className="w-4 h-4 mr-2" />
                Donate Now
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-navy-primary border-b border-gold-800 shadow-xl animate-in slide-in-from-top-5">
          <nav className="flex flex-col p-4 space-y-4">
            <Link
              to="/"
              className="text-white hover:text-gold-400 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-gold-400 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/programs"
              className="text-white hover:text-gold-400 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Programs
            </Link>
            <Link
              to="/impact"
              className="text-white hover:text-gold-400 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Impact Stories
            </Link>
            <Link
              to="/contact"
              className="text-white hover:text-gold-400 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="flex flex-col gap-3 pt-4 border-t border-gold-800/30">
              <Button
                asChild
                variant="outline"
                className="w-full border-gold-600 text-gold-600 bg-transparent hover:bg-white hover:text-navy-primary hover:border-white"
              >
                <Link to="/apply" onClick={() => setIsMenuOpen(false)}>Apply for Assistance</Link>
              </Button>
              <Button asChild className="w-full bg-gold-600 hover:bg-gold-400 text-navy-primary">
                <Link to="/donate" onClick={() => setIsMenuOpen(false)}>
                  <Heart className="w-4 h-4 mr-2" />
                  Donate Now
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
