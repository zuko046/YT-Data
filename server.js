const express = require('express');
const { google } = require('googleapis');
const axios = require('axios'); // Import Axios

const app = express();
const PORT = 3000;

let totoken;
let rereftoken;
let ownerID= "Jgrl-IYF1196ZxijRcZLXQ"

const REDIRECT_URL = 'https://yt-data.onrender.com/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  //'703037131815-2u8326gq9o4pn00pl2f8linrovjac2t6.apps.googleusercontent.com',
  //'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',
  '327277406160-7oddheciuo5m459o6cfqqobf7cclhnmp.apps.googleusercontent.com',
  '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',
  REDIRECT_URL
);

const scopes = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube',
];

const refreshAccessToken = async () => {
  try {
    const { tokens } = await oauth2Client.refreshToken(rereftoken);
    oauth2Client.setCredentials(tokens);
    totoken = tokens.access_token;
    console.log('New Access Token:', tokens.access_token);
  } catch (error) {
    console.error('Error refreshing access token:', error);
  }
};




const checkAccessToken = async (req, res, next) => {

  const now = Date.now();
  if (!totoken || (oauth2Client.credentials.expiry_date || 0) < now) {
    // Token doesn't exist or has expired, refresh it
    await refreshAccessToken();
  }
  next();
};






app.get('/auth-url', (req, res) => {
   console.log("Google Auth");
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.send({ url: authUrl });
});

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log(tokens)
    
    oauth2Client.setCredentials(tokens);
    totoken = tokens.access_token;
    rereftoken = tokens.refresh_token;

    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);

    res.send('Authorization successful!');

  } catch (error) {
    
    console.error('Error retrieving tokens:', error);
    
    res.status(500).send('Authorization failed!');
  
  }
});




// app.get('/youtube-analytics', checkAccessToken, async (req, res) => {
//   try {
//     const accessToken = totoken;

//     const response = await axios.get('https://youtubeanalytics.googleapis.com/v2/reports', {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//       params: {
//         ids: 'channel==MINE',
//         startDate: '2021-01-01',
//         endDate: '2023-10-30',
//         metrics: 'subscribersGained,views,likes,comments,averageViewDuration,watchTime,estimatedRevenue,cardImpressions,annotationImpressions,annotationClicks,uniqueViewers,subscriberCount',
//         //metrics: 'subscribersGained',
//         dimensions: 'day',
//         sort: 'day',
//       },
//     });

//     console.log('YouTube Analytics Data:', response.data);
//     res.json(response.data);
//   } catch (error) {
//     console.error('Error fetching YouTube Analytics data:', error.response.data);
//     res.status(500).json({ error: 'Failed to fetch YouTube Analytics data' });
//   }
// });

// app.get('/ads-revenue', checkAccessToken, async (req, res) => {
//   try {
//     const accessToken = totoken;

//     const response = await axios.get('https://youtubeanalytics.googleapis.com/v2/reports', {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//       params: {
//         ids: 'channel==MINE',
//         startDate: '2022-01-01',
//         endDate: '2022-12-30',
//         metrics: 'estimatedRevenue,adImpressions,monetizedPlaybacks',
//         dimensions: 'day,country,video',
//       },
//     });

//     console.log('Ads Revenue Data:', response.data);
//     res.json(response.data);
//   } catch (error) {
//     console.error('Error fetching Ads Revenue data:', error.response.data);
//     res.status(500).json({ error: 'Failed to fetch Ads Revenue data' });
//   }
// });







app.get('/analytics', checkAccessToken, async (req, res) => {

  try {
    const accessToken = totoken;
    let ids= "Jgrl-IYF1196ZxijRcZLXQ"  
    const response = await axios.get('https://youtubeanalytics.googleapis.com/v2/reports', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        ids:ownerID,
        startDate: '2023-11-01',
        endDate: '2023-11-30',
        metrics: 'subscribersGained,views,likes,comments,shares,videosAddedToPlaylists,averageViewDuration',  
        dimensions: 'day',
        sort: 'day',
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch YouTube Analytics data' });
  }
});








app.get('/revenue', checkAccessToken, async (req, res) => {
  try {
    const accessToken = totoken;
    const startDate = '2023-11-01';
    const endDate = '2023-11-30';
    const currency = 'USD'; // Change this to your desired currency
    

    const response = await axios.get('https://youtube.googleapis.com/youtube/analytics/v1/reports', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        dimensions: 'day',
        endDate,
        ids:ownerID,                  
        //'channel==MINE', // Replace 'MINE' with your channel ID or content owner ID
        metrics: 'estimatedRevenue',
        startDate,
        currency,
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});






app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
