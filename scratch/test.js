const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 1 }, 'qlue-super-secret');
const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  console.log('Connected to ws');
  const payload = {
    question: "how many users?",
    schema: "users(id, name)",
    datasetId: "123",
    token: token
  };
  ws.send(JSON.stringify(payload));
  console.log('Sent payload');
});

ws.on('message', (data) => {
  console.log('Received:', data.toString());
});

ws.on('close', () => {
  console.log('Disconnected');
});

ws.on('error', (err) => {
  console.error('WS Error:', err);
});
