import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { HiClipboardList, HiChat, HiHome } from 'react-icons/hi';

const Navbar = () => {
  const navigate = useNavigate();
  useLocation(); 

  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  const token = sessionStorage.getItem('token');

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <HiClipboardList /> Todo&Chat
        </Link>

        {token ? (
          <>
            <div className="navbar-links">
              <NavLink to="/" end>
                <HiHome /> Home
              </NavLink>
              <NavLink to="/todos">
                <HiClipboardList /> Todos
              </NavLink>
              <NavLink to="/messages">
                <HiChat /> Messages
              </NavLink>
            </div>

            <div className="navbar-user">
              <span>{user?.name || 'User'}</span>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="navbar-links">
              <NavLink to="/" end>
                <HiHome /> Home
              </NavLink>
              {}
              <a href="/#features">Features</a>
              <a href="/#how-it-works">How it works</a>
            </div>

            <div className="navbar-auth">
              <NavLink to="/login" className="navbar-login">
                Log in
              </NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
