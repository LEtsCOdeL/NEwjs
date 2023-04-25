require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
let data = '';

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://accounts.zoho.in/oauth/v2/token?refresh_token=1000.4611192342ea904404138db35bde5122.5b90d014d9e855e979ef2b4d8720abbb&client_id=1000.QOWO0XMYJCMFER0LS7UGU3MKFRKJNI&client_secret=f1e42bd92714a2251ab1730acf64e9618ba370c99a&grant_type=refresh_token',
  headers: { 
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data.access_token));
  global.access_token =response.data.access_token;
  console.log("access data ="+ access_token);
})
.catch((error) => {
  console.log(error);
});

////////////////
const { TOKEN, SERVER_URL } = process.env
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const URI = `/webhook/${TOKEN}`
const WEBHOOK_URL = SERVER_URL + URI

const app = express()
app.use(bodyParser.json())

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    console.log(res.data);
}


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
    const contact_id = "496297000000270715"; 
    
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
      url: `https://www.zohoapis.in/bigin/v1/Deals/${contact_id}/Notes?`,
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer ' + access_token
      },
      data : data
    };
    
    axios.request(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data));
      console.log("Data successfully pushed to Bigin")
    })
    .catch((error) => {
      console.log(error);
    });

    // end of insert record 




    // await axios.post(`${TELEGRAM_API}/sendMessage`, {
    //     chat_id: chatId,
    //     text: text
    // })
    return res.send()

})

app.listen(process.env.PORT || 10000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 10000)
    await init()
})