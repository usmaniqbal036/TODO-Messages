import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import SocketProvider from './context/SocketProvider';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Todos from './pages/Todos';
import Messages from './pages/Messages';


const AppLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);


const RequireAuth = () => {
  const token = sessionStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};


const GuestRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  return token ? <Navigate to="/" replace /> : children;
};


const HomeRoute = () => {
  useLocation(); 
  return sessionStorage.getItem('token') ? <Home /> : <Landing />;
};

const App = () => {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomeRoute />} />

            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />

            <Route element={<RequireAuth />}>
              <Route path="/todos" element={<Todos />} />
              <Route path="/messages" element={<Messages />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
};

export default App;
