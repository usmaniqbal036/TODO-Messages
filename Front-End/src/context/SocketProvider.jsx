import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SocketContext } from './socketContext';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || undefined; 
const EVENTS = ['connect', 'message:new', 'message:deleted'];
const TOAST_MS = 6000;
const MAX_TOASTS = 3;

const ToastItem = ({ toast, onOpen, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className="toast" role="status">
      <button className="toast-body" onClick={() => onOpen(toast)}>
        <span className="conv-avatar">{toast.sender.name.charAt(0).toUpperCase()}</span>
        <span className="toast-text">
          <strong>{toast.sender.name}</strong>
          <span>{toast.text}</span>
        </span>
      </button>
      <button className="toast-close" aria-label="Dismiss notification" onClick={() => onDismiss(toast.id)}>
        ×
      </button>
    </div>
  );
};



const SocketProvider = ({ children }) => {
  const navigate = useNavigate();
  useLocation(); 
  const token = sessionStorage.getItem('token');

  const [toasts, setToasts] = useState([]);

  
  const listeners = useRef(Object.fromEntries(EVENTS.map((e) => [e, new Set()])));
  const activeChatUserId = useRef(null); 

  const subscribe = useCallback((event, handler) => {
    listeners.current[event].add(handler);
    return () => listeners.current[event].delete(handler);
  }, []);

  const setActiveChatUserId = useCallback((id) => {
    activeChatUserId.current = id;
    
    if (id) setToasts((prev) => prev.filter((t) => t.sender._id !== id));
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message) => {
    setToasts((prev) =>
      [
        
        ...prev.filter((t) => t.sender._id !== message.sender._id),
        { id: message._id, sender: message.sender, text: message.text },
      ].slice(-MAX_TOASTS)
    );
  }, []);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });

    EVENTS.forEach((event) => {
      socket.on(event, (...args) => listeners.current[event].forEach((fn) => fn(...args)));
    });

    
    socket.on('message:new', (message) => {
      const me = JSON.parse(sessionStorage.getItem('user') || 'null');
      const myId = me?.id || me?._id;
      if (message.receiver._id !== myId) return; 
      if (activeChatUserId.current === message.sender._id) return;
      showToast(message);
    });

    socket.on('connect_error', (err) => console.warn('Socket:', err.message));

    return () => socket.disconnect();
  }, [token, showToast]);

  const openFromToast = (toast) => {
    dismiss(toast.id);
    navigate('/messages', { state: { openUser: toast.sender } });
  };

  const value = useMemo(() => ({ subscribe, setActiveChatUserId }), [subscribe, setActiveChatUserId]);

  return (
    <SocketContext.Provider value={value}>
      {children}

      {toasts.length > 0 && (
        <div className="toast-stack">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onOpen={openFromToast} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
