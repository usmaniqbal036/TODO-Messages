import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiClipboardList, HiChat } from 'react-icons/hi';
import api from '../api/axios';

const Home = () => {
  const [stats, setStats] = useState({ totalTodos: 0, completedTodos: 0, conversations: 0 });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [todoRes, msgRes] = await Promise.all([
          api.get('/api/todos'),
          api.get('/api/messages/conversations'),
        ]);

        const todos = todoRes.data;
        setStats({
          totalTodos: todos.length,
          completedTodos: todos.filter((t) => t.completed).length,
          conversations: msgRes.data.length,
        });
      } catch {
        
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Welcome back, {user?.name || 'User'}</p>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="dashboard-cards">
          <Link to="/todos" className="dash-card">
            <div className="dash-card-icon">
              <HiClipboardList />
            </div>
            <div className="dash-card-body">
              <h3>Todos</h3>
              <p>
                <strong>{stats.totalTodos}</strong> total · <strong>{stats.completedTodos}</strong> done
              </p>
              <div className="dash-card-bar">
                <div
                  className="dash-card-fill"
                  style={{
                    width: stats.totalTodos
                      ? `${(stats.completedTodos / stats.totalTodos) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </Link>

          <Link to="/messages" className="dash-card">
            <div className="dash-card-icon">
              <HiChat />
            </div>
            <div className="dash-card-body">
              <h3>Messages</h3>
              <p>
                <strong>{stats.conversations}</strong> conversation{stats.conversations !== 1 ? 's' : ''}
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
