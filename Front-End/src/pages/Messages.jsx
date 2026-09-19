import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiChat, HiPlus, HiX } from 'react-icons/hi';
import api from '../api/axios';
import MessageBubble from '../components/MessageBubble';
import { getErrorMessage } from '../utils/getErrorMessage';

const CONVERSATIONS_POLL_MS = 5000;
const MESSAGES_POLL_MS = 3000;

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const chatEndRef = useRef(null);
  const activeChatRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null');
  const currentUserId = currentUser?.id || currentUser?._id;

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/api/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load conversations'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Sidebar ko baar baar refresh karo (naye conversations/unread counts ke liye)
  useEffect(() => {
    fetchConversations();
    const id = setInterval(fetchConversations, CONVERSATIONS_POLL_MS);
    return () => clearInterval(id);
  }, [fetchConversations]);

  const openConversation = async (partner) => {
    try {
      const res = await api.get(`/api/messages/${partner._id}`);
      setActiveChat({ user: partner, messages: res.data });
      setShowModal(false);
      setSearchTerm('');
      fetchConversations();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load messages'));
    }
  };

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const openUserFromPopup = location.state?.openUser;
  useEffect(() => {
    if (!openUserFromPopup) return;

    api
      .get(`/api/messages/${openUserFromPopup._id}`)
      .then((res) => {
        setActiveChat({ user: openUserFromPopup, messages: res.data });
        fetchConversations();
      })
      .catch((err) => setError(getErrorMessage(err, 'Failed to load messages')));

    navigate('/messages', { replace: true, state: null });
  }, [openUserFromPopup, navigate, fetchConversations]);

  // Active chat ke messages ko poll karo — naye messages aane par merge karo
  useEffect(() => {
    if (!activeChat) return;

    const partnerId = activeChat.user._id;

    const poll = async () => {
      try {
        const res = await api.get(`/api/messages/${partnerId}`);
        const latest = res.data;

        const current = activeChatRef.current;
        if (!current || current.user._id !== partnerId) return;

        const existingIds = new Set(current.messages.map((m) => m._id));
        const incoming = latest.filter((m) => !existingIds.has(m._id));

        if (incoming.length > 0) {
          setActiveChat((prev) =>
            prev && prev.user._id === partnerId ? { ...prev, messages: latest } : prev
          );

          const hasUnreadIncoming = incoming.some(
            (m) => m.receiver._id === currentUserId
          );
          if (hasUnreadIncoming) {
            try {
              await api.put(`/api/messages/${partnerId}/read`);
            } catch {
              // ignore read-marking failures silently
            }
          }
          fetchConversations();
        }
      } catch {
        // silent fail on individual poll tick
      }
    };

    const id = setInterval(poll, MESSAGES_POLL_MS);
    return () => clearInterval(id);
  }, [activeChat?.user?._id, currentUserId, fetchConversations]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !activeChat) return;

    try {
      const res = await api.post('/api/messages', {
        receiver: activeChat.user._id,
        text,
      });
      setActiveChat((prev) =>
        prev.messages.some((m) => m._id === res.data._id)
          ? prev
          : { ...prev, messages: [...prev.messages, res.data] }
      );
      setMessageText('');
      fetchConversations();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send message'));
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await api.delete(`/api/messages/${messageId}`);
      setActiveChat((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m._id !== messageId),
      }));
      fetchConversations();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete message'));
    }
  };

  const openNewChatModal = async () => {
    setShowModal(true);
    setUsersLoading(true);
    try {
      const res = await api.get('/api/auth/users');
      setUsers(res.data.filter((u) => u._id !== currentUserId));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load users'));
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages?.length]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container messages-page">
      <h1 className="page-title">Messages</h1>

      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError('')} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <div className="messages-layout">
        <aside className="conv-sidebar">
          <div className="conv-header">
            <h3>Chats</h3>
            <button
              className="btn-icon"
              title="New chat"
              aria-label="New chat"
              onClick={openNewChatModal}
            >
              <HiPlus />
            </button>
          </div>

          {loading ? (
            <div className="spinner">Loading…</div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">
              <HiChat size={32} />
              <p>No conversations yet. Press + to start one.</p>
            </div>
          ) : (
            <ul className="conv-list">
              {conversations.map((c) => (
                <li
                  key={c.user._id}
                  className={`conv-item ${activeChat?.user?._id === c.user._id ? 'active' : ''}`}
                  onClick={() => openConversation(c.user)}
                >
                  <div className="conv-avatar">{c.user.name.charAt(0).toUpperCase()}</div>
                  <div className="conv-info">
                    <span className="conv-name">{c.user.name}</span>
                    <span className="conv-last">{c.lastMessage}</span>
                  </div>
                  {c.unreadCount > 0 && <span className="conv-unread">{c.unreadCount}</span>}
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="chat-area">
          {activeChat ? (
            <>
              <div className="chat-header">
                <div className="chat-avatar">
                  {activeChat.user.name.charAt(0).toUpperCase()}
                </div>
                <h3>{activeChat.user.name}</h3>
              </div>

              <div className="chat-messages">
                {activeChat.messages.length === 0 && (
                  <div className="empty-state">No messages yet. Say hi!</div>
                )}
                {activeChat.messages.map((msg) => (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    currentUserId={currentUserId}
                    onDelete={handleDelete}
                  />
                ))}
                <div ref={chatEndRef} />
              </div>

              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Type a message…"
                  aria-label="Message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  maxLength={1000}
                  className="chat-input"
                />
                <button type="submit" className="btn btn-primary" disabled={!messageText.trim()}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="chat-placeholder">
              <HiChat size={48} />
              <p>Select a conversation or start a new one</p>
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="New chat"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>New chat</h3>
              <button
                className="btn-icon"
                aria-label="Close"
                onClick={() => setShowModal(false)}
              >
                <HiX />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search users…"
              aria-label="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modal-search"
              autoFocus
            />

            <ul className="modal-user-list">
              {usersLoading ? (
                <li className="modal-empty">Loading users…</li>
              ) : filteredUsers.length === 0 ? (
                <li className="modal-empty">
                  {users.length === 0
                    ? 'No other users yet. Register a second account to start chatting.'
                    : 'No users match your search.'}
                </li>
              ) : (
                filteredUsers.map((u) => (
                  <li
                    key={u._id}
                    className="modal-user-item"
                    onClick={() => openConversation(u)}
                  >
                    <div className="conv-avatar">{u.name.charAt(0).toUpperCase()}</div>
                    <span>{u.name}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;