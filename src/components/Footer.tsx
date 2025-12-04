import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, MessageCircle } from "lucide-react";
import logo from "@/assets/brand/svg/logo no background bigger.svg";

const Footer = () => {
  return (
    <footer className="bg-navy-primary border-t border-gold-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Sello Saka Foundation" className="h-12 w-auto" />
              <div>
                <div className="text-white font-bold text-lg">Sello Saka</div>
                <div className="text-gold-600 text-sm">Foundation</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Supporting survivors of early childhood cancer through comprehensive medical,
              psychological, educational, and social assistance.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-gold-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-gold-600 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-gold-600 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-gray-400 hover:text-gold-600 transition-colors text-sm">
                  Programs
                </Link>
              </li>
              <li>
                <Link to="/impact" className="text-gray-400 hover:text-gold-600 transition-colors text-sm">
                  Impact Stories
                </Link>
              </li>
              <li>
                <Link to="/competition" className="text-gray-400 hover:text-gold-600 transition-colors text-sm">
                  Competitions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/donate" className="text-gray-400 hover:text-gold-600 transition-colors text-sm">
                  Donate
                </Link>
              </li>
              <li>
                <Link to="/apply" className="text-gray-400 hover:text-gold-600 transition-colors text-sm">
                  Apply for Assistance
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-gold-600 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-gold-600 mt-0.5" />
                <a href="mailto:sellosaka.care@gmail.com" className="text-gray-400 hover:text-gold-600 transition-colors text-sm">
                  sellosaka.care@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-gold-600 mt-0.5" />
                <a href="tel:+27658324028" className="text-gray-400 hover:text-gold-600 transition-colors text-sm">
                  +27 65 832 4028
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gold-600 mt-0.5" />
                <span className="text-gray-400 text-sm">10 Sonate, Langenhoven Park, Bloemfontein, Free-state 9301</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-400/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 Sello Saka Foundation. All rights reserved. NPO Registration: 123-456-NPO
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-gray-400 hover:text-gold-600 transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-gold-600 transition-colors text-sm">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-gray-400 hover:text-gold-600 transition-colors text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/27658324028"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-14 h-14 bg-gold-600 hover:bg-gold-400 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-50"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-navy-primary" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
      </a>
    </footer>
  );
};

export default Footer;
