import { HiTrash } from 'react-icons/hi';

const MessageBubble = ({ message, currentUserId, onDelete }) => {
  const isSent = message.sender?._id === currentUserId || message.sender === currentUserId;

  return (
    <div className={`msg-bubble-row ${isSent ? 'sent' : 'received'}`}>
      <div className="msg-bubble">
        {isSent && (
          <button
            type="button"
            className="msg-delete"
            aria-label="Delete message"
            onClick={() => onDelete(message._id)}
          >
            <HiTrash />
          </button>
        )}
        <div>{message.text}</div>
        <div className="msg-time">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
