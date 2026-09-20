import mongoose from 'mongoose';
import User from '../models/User.js';
import Message from '../models/Message.js';

const isValidId = (id) => mongoose.isValidObjectId(id);


const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return res.status(400).json({ message: 'A valid user id is required' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    await Message.updateMany(
      { sender: userId, receiver: req.user.id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('GetMessages error:', error.message);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};


const getConversations = async (req, res) => {
  try {
    const me = req.user.id;

    const sentTo = await Message.distinct('receiver', { sender: me });
    const receivedFrom = await Message.distinct('sender', { receiver: me });

    const partnerIds = [
      ...new Set([...sentTo, ...receivedFrom].map((id) => id.toString())),
    ];

    const rows = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const partner = await User.findById(partnerId).select('name email');
        if (!partner) return null;

        const [unreadCount, lastMessage] = await Promise.all([
          Message.countDocuments({ sender: partnerId, receiver: me, read: false }),
          Message.findOne({
            $or: [
              { sender: me, receiver: partnerId },
              { sender: partnerId, receiver: me },
            ],
          }).sort({ createdAt: -1 }),
        ]);

        if (!lastMessage) return null;

        return {
          user: partner,
          unreadCount,
          lastMessage: lastMessage.text,
          lastMessageAt: lastMessage.createdAt,
        };
      })
    );

    const conversations = rows
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    res.json(conversations);
  } catch (error) {
    console.error('GetConversations error:', error.message);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};


const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return res.status(400).json({ message: 'A valid user id is required' });
    }

    await Message.updateMany(
      { sender: userId, receiver: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('MarkAsRead error:', error.message);
    res.status(500).json({ message: 'Server error updating messages' });
  }
};


const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const receiver = req.body.receiver || req.body.recipient;

    if (!text || !text.trim() || !receiver) {
      return res.status(400).json({ message: 'Text and receiver are required' });
    }

    if (!isValidId(receiver)) {
      return res.status(400).json({ message: 'Receiver id is not valid' });
    }

    if (receiver === req.user.id) {
      return res.status(400).json({ message: 'You cannot message yourself' });
    }

    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const message = await Message.create({
      text,
      sender: req.user.id,
      receiver,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message: msg });
    }
    console.error('SendMessage error:', error.message);
    res.status(500).json({ message: 'Server error sending message' });
  }
};


const deleteMessage = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Message id is not valid' });
    }

    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      sender: req.user.id,
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or not authorized' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('DeleteMessage error:', error.message);
    res.status(500).json({ message: 'Server error deleting message' });
  }
};

export { getMessages, getConversations, sendMessage, deleteMessage, markAsRead };