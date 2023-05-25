const fs = require('fs');
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
let idsArray = [];

// Obtain Zoho access token
let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://accounts.zoho.com/oauth/v2/token?refresh_token=1000.63eea01115414f39221f6d325e1d875b.e6e623bcf6b9b1d2629c14831c7b6484&client_id=1000.G73LKHN42126L4O4L6AGP0Y57B48UA&client_secret=b24d8b4b3a7fe61ca795fa59d29c28af2c3d578223&grant_type=refresh_token',
  headers: {},
  data: ''
};

axios.request(config)
  .then(async (responseToken) => {
    const access_token = responseToken.data.access_token;
    let configg = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://www.zohoapis.com/bigin/v1/Contacts',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token
      }
    };

    const responseContacts = await axios.request(configg);
    const responsedata = JSON.parse(JSON.stringify(responseContacts.data));
    idsArray = responsedata.data.map(item => item.id);

    // Write idsArray to file
    await new Promise((resolve, reject) => {
      fs.writeFile('idsArray.json', JSON.stringify(idsArray), 'utf8', (err) => {
        if (err) {
          console.error('Error writing idsArray to file:', err);
          reject(err);
        } else {
          console.log('idsArray has been exported to idsArray.json');
          resolve();
        }
      });
    });
console.log('Hello', idsArray);
    // Start the Express server and set up webhook
    const { TOKEN, SERVER_URL } = process.env;
    const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
    const URI = `/webhook/${TOKEN}`;
    const WEBHOOK_URL = SERVER_URL + URI;

    const init = async () => {
      const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
      console.log(res.data);
    };

    const performInsertOperation = (access_token, contactId, content) => {
      let data = JSON.stringify({
        "data": [
          {
            "Note_Content": content
          }
        ]
      });

      let config = {
        method: 'POST',
        maxBodyLength: Infinity,
        url: `https://www.zohoapis.in/bigin/v1/Deals/${contactId}/Notes?`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + access_token
        },
        data: data
      };

      return axios.request(config)
        .then(() => {
          console.log('Data successfully pushed to Bigin for contact ID:', contactId);
        })
        .catch((error) => {
          console.log('Error inserting data for contact ID:', contactId, error);
        });
    };

    app.post(URI, async (req, res) => {
      console.log("response obj", req.body);
      var content = "";
    
      const group_name = req?.body?.message?.chat?.title;
      const user_name = req?.body?.message?.from?.username;
      const first_name = req?.body?.message?.from?.first_name;
      const last_name = req?.body?.message?.from?.last_name;
      const unixDate = req?.body?.message?.date;
      const message = req?.body?.message?.text;
    
      // setting up dateTime into required format
      const dateTimeObj = new Date(unixDate * 1000);
      const dateTimeString = dateTimeObj.toLocaleString('en-US');
      console.log(dateTimeString);
    
      const dateTimeArr = dateTimeString.split(",");
    
      // setting up Date format
      const dateArr = dateTimeArr[0].trim().split("/");
      const date = dateArr[0];
      const month = dateArr[1];
      const year = dateArr[2];
      const finalDate = `${month}-${date}-${year}`;
      console.log("FinalDate is ", finalDate);
    
      // setting up Time format
      const timeString = dateTimeArr[1].trim();
      const timeArr = timeString.split(" ");
      const timeArr1 = timeArr[0].split(":");
      timeArr1.pop();
      const finalTime = `${timeArr1.join(":")}${timeArr[1]}`;
      console.log("FinalTime is ", finalTime);
    
      if (user_name) {
        content = `${group_name} | ${user_name} | ${finalDate} ${finalTime} - ${message}`;
      } else if (typeof (last_name) === 'undefined' || last_name === null) {
        content = `${group_name} | ${first_name} | ${finalDate} ${finalTime} - ${message}`;
      } else {
        content = `${group_name} | ${first_name} ${last_name} | ${finalDate} ${finalTime} - ${message}`;
      }
    
      // Define the recursive function for processing each contact ID
      console.log('Hello check again', idsArray);
      const processContact = async (index) => {
        if (index >= idsArray.length) {
          return;
        }
    
        const contactId = idsArray[index];
        console.log('Processing contact ID:', contactId);
        await performInsertOperation(access_token, contactId, content);
        console.log('Finished processing contact ID:', contactId);
    
        // Process the next contact ID recursively
        await processContact(index + 1);
      };
    
      // Start processing the contact IDs recursively from index 0
      await processContact(0);
    
      return res.send();
    });
    
    app.listen(process.env.PORT || 10000, async () => {
      console.log('🚀 app running on port', process.env.PORT || 10000);
      await init();
    });
  })
  .catch((error) => {
    console.log(error);
  });
