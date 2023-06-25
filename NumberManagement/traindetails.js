const express = require('express');
const axios = require('axios');

const app = express();
const API_BASE_URL = 'http://104.211.219.98/train';
const CLIENT_ID = 'd561eeb9-ea14-43ef-a0c7-d949aae2d454';
const CLIENT_SECRET = 'dhUvtMBlfUoZYLEd';
const accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODc2Nzg0NDMsImNvbXBhbnlOYW1lIjoiVHJhaW4gQ2VudHJhbCIsImNsaWVudElEIjoiZDU2MWVlYjktZWExNC00M2VmLWEwYzctZDk0OWFhZTJkNDU0Iiwib3duZXJOYW1lIjoiIiwib3duZXJFbWFpbCI6IiIsInJvbGxObyI6IjQyMCJ9.HHfsdJvfu9OnDHUl2v65QsYOkmtmK7h12TY_tPJvIUg';
// Authentication
axios
  .post(`${API_BASE_URL}/auth`, {
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    accessToken: accessToken,
    ownerName: 'Harsha',
    ownerEmail: 'ganeshharsha2024@gmail.com',
    rollNo: '420',
    companyName: 'Train Central',
  })
  .then(() => {
    // Starting the server after successful authentication
    app.listen(3001, () => {
      console.log('Server is listening on port 3001');
    });
  })
  .catch((error) => {
    console.error('Error occurred:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  });

// Route to fetch train data
app.get('/trains', (req, res) => {
  const currentTime = new Date();
  const next12Hours = new Date();
  next12Hours.setHours(currentTime.getHours() + 12);

  axios
    .get(`${API_BASE_URL}/trains`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      const trains = response.data;
      if (Array.isArray(trains)) {
        const filteredTrains = trains.filter((train) => {
          const departureTime = new Date();
          departureTime.setHours(train.departureTime.Hours);
          departureTime.setMinutes(train.departureTime.Minutes);
          departureTime.setSeconds(train.departureTime.Seconds);
          const delayInMinutes = train.delayedBy || 0;

          return (
            departureTime >= currentTime.setMinutes(currentTime.getMinutes() + 30) &&
            departureTime <= next12Hours.setMinutes(next12Hours.getMinutes() + delayInMinutes)
          );
        });

        const sortedTrains = filteredTrains.sort((a, b) => {
          const aPrice = a.price.sleeper + a.price.AC;
          const bPrice = b.price.sleeper + b.price.AC;
          const aTotalSeats = a.seatsAvailable.sleeper + a.seatsAvailable.AC;
          const bTotalSeats = b.seatsAvailable.sleeper + b.seatsAvailable.AC;

          if (aPrice === bPrice) {
            return bTotalSeats - aTotalSeats;
          }

          return aPrice - bPrice;
        });

        const html = `
          <style>
            body {
              font-family: Arial, sans-serif;
            }

            h1 {
              text-align: center;
              margin-top: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th,
            td {
              padding: 10px;
              border: 1px solid #ddd;
              text-align: left;
            }

            th {
              background-color: #f2f2f2;
            }

            .details-btn {
              padding: 5px 10px;
              background-color: #4caf50;
              color: white;
              border: none;
              cursor: pointer;
            }

            .details-btn:hover {
              background-color: #45a049;
            }

            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
              color: #000; /* Updated color to black */
            }
          </style>
          <h1>Available Trains</h1>
          <table>
            <tr>
              <th>Train Number</th>
              <th>Train Name</th>
              <th>Departure Time</th>
              <th>Sleeper Price</th>
              <th>AC Price</th>
              <th>Sleeper Seats Available</th>
              <th>AC Seats Available</th>
              <th>Actions</th>
            </tr>
            ${sortedTrains
              .map(
                (train) => `
                  <tr>
                    <td>${train.trainNumber}</td>
                    <td>${train.trainName}</td>
                    <td>${train.departureTime.Hours}:${train.departureTime.Minutes}</td>
                    <td>${train.price.sleeper}</td>
                    <td>${train.price.AC}</td>
                    <td>${train.seatsAvailable.sleeper}</td>
                    <td>${train.seatsAvailable.AC}</td>
                    <td><button class="details-btn" onclick="viewDetails('${train.trainNumber}')">View Details</button></td>
                  </tr>
                `
              )
              .join('')}
          </table>
          <p class="footer">Created by Palagiri Ganesh Harsha (Roll No: 209E1A05G0 ) | &copy; 2023 Palagiri Ganesh Harsha</p>
          <script>
            function viewDetails(trainNumber) {
              window.location.href = '/trains/' + trainNumber;
            }
          </script>
        `;

        res.send(html);
      } else {
        console.error('Invalid train data');
        res.status(500).json({ error: 'Failed to fetch train data' });
      }
    })
    .catch((error) => {
      console.error('Error occurred while fetching train data:', error.message);
      res.status(500).json({ error: 'Failed to fetch train data' });
    });
});

// Route to fetch train details
app.get('/trains/:trainNumber', (req, res) => {
  const trainNumber = req.params.trainNumber;

  axios
    .get(`${API_BASE_URL}/trains/${trainNumber}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      const train = response.data;
      if (train) {
        const delayInSeconds = train.delayedBy || 0;

        const html = `
          <style>
            .details {
              margin-top: 20px;
              border: 1px solid black;
              padding: 10px;
            }

            table {
              border-collapse: collapse;
              width: 100%;
            }

            th,
            td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }

            th {
              background-color: #f2f2f2;
            }

            .details-btn {
              margin-top: 10px;
              padding: 5px 10px;
              background-color: #4caf50;
              color: white;
              border: none;
              cursor: pointer;
            }

            .details-btn:hover {
              background-color: #45a049;
            }

            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
              color: #000; /* Updated color to black */
            }
          </style>
          <div class="details">
            <h1>Train Details</h1>
            <table>
              <tr>
                <th>Train Number</th>
                <th>Train Name</th>
                <th>Departure Time</th>
                <th>Sleeper Price</th>
                <th>AC Price</th>
                <th>Sleeper Seats Available</th>
                <th>AC Seats Available</th>
                <th>Delay (Seconds)</th>
              </tr>
              <tr>
                <td>${train.trainNumber}</td>
                <td>${train.trainName}</td>
                <td>${train.departureTime.Hours}:${train.departureTime.Minutes}</td>
                <td>${train.price.sleeper}</td>
                <td>${train.price.AC}</td>
                <td>${train.seatsAvailable.sleeper}</td>
                <td>${train.seatsAvailable.AC}</td>
                <td>${delayInSeconds}</td>
              </tr>
            </table>
            <button class="details-btn" onclick="goBack()">Go Back</button>
          </div>
          <p class="footer">Created by Palagiri Ganesh Harsha (Roll No: 209E1A05G0 ) | &copy; 2023 Palagiri Ganesh Harsha</p>
          <script>
            function goBack() {
              window.history.back();
            }
          </script>
        `;

        res.send(html);
      } else {
        console.error('Train not found');
        res.status(404).json({ error: 'Train not found' });
      }
    })
    .catch((error) => {
      console.error('Error occurred while fetching train data:', error.message);
      res.status(500).json({ error: 'Failed to fetch train data' });
    });
});
