const fs = require('fs');
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

const idsArray = require('./idsArray.json');

let data = '';

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://accounts.zoho.in/oauth/v2/token?refresh_token=1000.4611192342ea904404138db35bde5122.5b90d014d9e855e979ef2b4d8720abbb&client_id=1000.QOWO0XMYJCMFER0LS7UGU3MKFRKJNI&client_secret=f1e42bd92714a2251ab1730acf64e9618ba370c99a&grant_type=refresh_token',
  headers: {},
  data: data
};

axios.request(config)
  .then(async (response) => {
    const access_token = response.data.access_token; // Define access_token here
    console.log(JSON.stringify(access_token));
    global.access_token = access_token;
    console.log("access data =" + access_token);
    console.log(idsArray);

    // Pass the access_token to the initialize function or any other functions that require it
    await initialize(access_token);
  })
  .catch((error) => {
    console.log(error);
  });

async function initialize(access_token) {
  const { TOKEN, SERVER_URL } = process.env;
  const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
  const URI = `/webhook/${TOKEN}`;
  const WEBHOOK_URL = SERVER_URL + URI;

  const app = express();
  app.use(bodyParser.json());

  const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
    // console.log(res.data);
    // const idsArray = await getContactIds();
    // console.log(idsArray);

    // Set up webhooks for each contact ID
    for (let i = 0; i < idsArray.length; i++) {
      const contactId = idsArray[i];
      const contactWebhookUrl = `${WEBHOOK_URL}/contact/${contactId}`;
      await delay(1000); // Delay 1 second between each request
      await axios.get(`${TELEGRAM_API}/setWebhook?url=${contactWebhookUrl}`);
      console.log(`Webhook set for contact ID ${contactId}`);
    }
  };

  app.post(URI, async (req, res) => {
    console.log("response obj", req.body);
    let content = "";

    const group_name = req?.body?.message?.chat?.title;
    const user_name = req?.body?.message?.from?.username;
    const first_name = req?.body?.message?.from?.first_name;
    const last_name = req?.body?.message?.from?.last_name;
    const unixDate = req?.body?.message?.date;
    const message = req?.body?.message?.text;

    // setting up dateTime into required format
    const dateTimeObj = new Date(unixDate * 1000);
    const dateTimeString = dateTimeObj.toLocaleString('en-US');
    const dateTimeArr = dateTimeString.split(',');

    // setting up Date format
    const date = dateTimeArr[0].trim();
    const [month, day, year] = date.split("/");
    const finalDate = `${year}-${month}-${day}`;

    // setting up Time format
    const time = dateTimeArr[1].trim();
    const [hour, minute, second] = time.split(":");
    const finalTime = `${hour}:${minute}:${second}`;

    if (user_name) {
      content = `${user_name} (${first_name} ${last_name}) sent a message in ${group_name} group at ${finalTime} on ${finalDate}.\n\n`;
    } else {
      content = `${first_name} ${last_name} sent a message in ${group_name} group at ${finalTime} on ${finalDate}.\n\n`;
    }

    content += `Message: ${message}\n\n`;

    const fileContent = JSON.stringify(content);
    fs.writeFile('messageData.json', fileContent, (err) => {
      if (err) {
        console.log('Error writing to file:', err);
      } else {
        console.log('Data written to file successfully!');
      }
    });

    res.sendStatus(200);
  });

  await init();

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 app running on port ${port}`);
  });
}

// Delay function to introduce a delay between requests
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
