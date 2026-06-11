import { Link } from 'react-router-dom';

const Footer = () => {
  const links = {
    Product: [
      { label: 'Home', to: '/' },
      { label: 'Doctors', to: '/doctors' },
      { label: 'Book Appointment', to: '/doctors' },
      { label: 'About Us', to: '/about' },
    ],
    Account: [
      { label: 'Login', to: '/login' },
      { label: 'Sign Up', to: '/signup' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'My Profile', to: '/my-profile' },
    ],
    Support: [
      { label: 'Contact', to: '/contact' },
      { label: 'FAQ', to: '/contact' },
      { label: 'Privacy Policy', to: '/' },
      { label: 'Terms of Service', to: '/' },
    ],
  };

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="font-bold text-white text-lg">DocQueue</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Smart appointment & queue booking system. Skip the wait, book smarter.
            </p>
            {/* Social */}
            <div className="flex gap-3 mt-5">
              {['Twitter', 'LinkedIn', 'GitHub'].map(s => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition text-xs font-bold"
                >
                  {s.charAt(0)}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-white font-bold text-sm mb-4">{group}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} DocQueue. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-slate-600">Built with</span>
            <span className="text-red-400">♥</span>
            <span className="text-slate-600">using React + TypeScript</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;