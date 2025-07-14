const Pusher = require('pusher');

const pusher = new Pusher({
  appId: "1982836",
  key: "9a791dd3efec9f7b78bc",
  secret: "44af75d190d0f1c8ef5f",
  cluster: "ap2",
  useTLS: true
});

exports.sendMessage = async (req, res) => {
  try {
    const { message, userId, username } = req.body;

    // Trigger the event
    pusher.trigger('my-channel', 'my-event', {
      message,
      userId,
      username,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
}; 