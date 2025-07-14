import Pusher from 'pusher';
import { Message } from '../models/message.model.js';

const pusher = new Pusher({
  appId: "1982836",
  key: "9a791dd3efec9f7b78bc",
  secret: "44af75d190d0f1c8ef5f",
  cluster: "ap2",
  useTLS: true
});

export const sendMessage = async (req, res) => {
  try {
    const { message, userId, username, isMeetLink } = req.body;

    // Store the message in the database
    const newMessage = await Message.create({
      userId,
      username,
      message,
      isMeetLink: isMeetLink || false,
      timestamp: new Date() // Explicitly set the timestamp
    });

    // Trigger the event with the stored message
    pusher.trigger('my-channel', 'my-event', {
      _id: newMessage._id,
      message: newMessage.message,
      userId: newMessage.userId,
      username: newMessage.username,
      timestamp: newMessage.timestamp,
      isMeetLink: newMessage.isMeetLink
    });

    // Return the complete message object to the client
    res.status(200).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    // Get the last 50 messages, sorted by timestamp
    const messages = await Message.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    // Reverse the array to show oldest messages first
    const reversedMessages = messages.reverse();

    res.status(200).json({
      success: true,
      messages: reversedMessages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
}; 