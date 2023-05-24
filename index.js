const fs = require('fs');
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let data = '';

// Obtain Zoho access token
let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://accounts.zoho.com/oauth/v2/token?refresh_token=1000.63eea01115414f39221f6d325e1d875b.e6e623bcf6b9b1d2629c14831c7b6484&client_id=1000.G73LKHN42126L4O4L6AGP0Y57B48UA&client_secret=b24d8b4b3a7fe61ca795fa59d29c28af2c3d578223&grant_type=refresh_token',
  headers: {},
  data: data
};

axios.request(config)
  .then((response) => {
    const access_token = response.data.access_token;
    let configg = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://www.zohoapis.com/bigin/v1/Contacts',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + access_token
      }
    };

    return axios.request(configg);
  })
  .then((response) => {
    const responsedata = JSON.parse(JSON.stringify(response.data));
    const idsArray = responsedata.data.map(item => item.id);
    console.log(idsArray);
    fs.writeFile('idsArray.json', JSON.stringify(idsArray), 'utf8', (err) => {
      if (err) {
        console.error('Error writing idsArray to file:', err);
      } else {
        console.log('idsArray has been exported to idsArray.json');
      }
    });
  })
  .catch((error) => {
    console.log(error);
  });

// Rest of the code for Telegram webhook and Zoho Bigin integration
const { TOKEN, SERVER_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

const init = async () => {
  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  console.log(res.data);
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
  const dateTimeObj = new Date(unixDate*1000);
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
  

  if(user_name){
    content =`${group_name} | ${user_name} | ${finalDate} ${finalTime} - ${message}`;
  }
  else if (typeof(last_name) === 'undefined' || last_name === null){
    content =`${group_name} | ${first_name} | ${finalDate} ${finalTime} - ${message}`;
  }
  else{
    content =`${group_name} | ${first_name} ${last_name} | ${finalDate} ${finalTime} - ${message}`;
  }


  // module.exports(data2);
  // const chatId = req.body.message.chat.id
  // const text = req.body.message.text



  // insert record in Zoho Bigin
    // Iterate over each contact ID and perform insert operation
    idsArray.forEach((contactId) => {
 
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
  
        axios.request(config)
          .then((response) => {
            console.log('Data successfully pushed to Bigin for contact ID:', contactId);
          })
          .catch((error) => {
            console.log('Error inserting data for contact ID:', contactId, error);
          });
      });
      return res.send();
    })

    // });
  // end of insert record 



app.listen(process.env.PORT || 10000, async () => {
  console.log('🚀 app running on port', process.env.PORT || 10000);
  await init();
});
