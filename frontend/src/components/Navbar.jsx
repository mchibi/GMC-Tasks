import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        ✓ GMC Tasks
      </Link>
      {isAuthenticated && (
        <div className="navbar-user">
          <span className="navbar-name">Bonjour, {user.name}</span>
          <button className="btn btn-outline" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;
