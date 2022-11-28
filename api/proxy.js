const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.get('/api/token', async (req, res) => {
  try {
    const { tokenId, baseUrl } = req.query;
    const { data } = await axios.get(
      `${decodeURIComponent(baseUrl)}${tokenId}`,
    );
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(data));
  } catch (error) {
    console.error(error);
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(500);
    res.end(JSON.stringify({ msg: 'server error' }));
  }
});

module.exports = app;
