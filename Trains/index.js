const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 4000;

// Add a CSS file
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/numbers?url=primes');
});

app.get('/numbers', async (req, res) => {
  const baseUrl = 'http://104.211.219.98/numbers/';
  const urls = req.query.url;

  if (!urls) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  const urlArray = Array.isArray(urls) ? urls : [urls];
  const requests = urlArray.map(url => axios.get(baseUrl + url + `?_=${Date.now()}`, { timeout: 500 }));

  try {
    const responses = await Promise.allSettled(requests);
    let numbers = [];

    responses.forEach(response => {
      if (response.status === 'fulfilled') {
        const data = response.value.data;
        if (Array.isArray(data.numbers)) {
          numbers = [...numbers, ...data.numbers];
        }
      }
    });

    numbers = [...new Set(numbers)]; // Remove duplicates
    numbers.sort((a, b) => a - b);

    // Generate HTML response with buttons and styling
    const htmlResponse = `
      <html>
      <head>
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <style>
          /* styles.css */
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            margin: 0;
            padding: 20px;
          }

          h1 {
            color: #333;
            text-align: center;
          }

          .buttons {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
          }

          .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            text-decoration: none;
            color: #fff;
            background-color: #4caf50;
            border-radius: 5px;
            margin-right: 10px;
            transition: background-color 0.3s ease;
          }

          .button:hover {
            background-color: #45a049;
          }

          .number-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            grid-gap: 10px;
            margin-top: 20px;
          }

          .number-card {
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 10px;
          }

          .number-card p {
            margin: 0;
            text-align: center;
            font-size: 18px;
          }

          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Numbers</h1>
        <div class="buttons">
          <a class="button" href="/numbers?url=primes">Primes</a>
          <a class="button" href="/numbers?url=fibo">Fibo</a>
          <a class="button" href="/numbers?url=rand">Rand</a>
          <a class="button" href="/numbers?url=odd">Odd</a>
        </div>
        <div class="number-list">
          ${numbers.map(number => `
            <div class="number-card">
              <p>${number}</p>
            </div>
          `).join('')}
        </div>
        <p class="footer">Created by Palagiri Ganesh Harsha (Roll No: 209E1A05G0) | &copy; 2023 Palagiri Ganesh Harsha</p>
      </body>
      </html>
    `;

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.send(htmlResponse);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
