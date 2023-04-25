require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const imageDownloader = require('image-downloader');
const fs = require('fs');
const path = require('path');

// generating Access Token from refresh token
// let config2 = {
//   method: 'post',
//   maxBodyLength: Infinity,
//   url: 'https://accounts.zoho.com/oauth/v2/token?refresh_token=1000.a3fb77f4e49ead40b07d7a5e8bba1c36.75a3623e59bd37a058f5dafd91f5e7f5&client_id=1000.G73LKHN42126L4O4L6AGP0Y57B48UA&client_secret=b24d8b4b3a7fe61ca795fa59d29c28af2c3d578223&grant_type=refresh_token',
//   headers: {
//   }
// };

// axios.request(config2)
// .then((response) => {
//      global.access_token = response.data.access_token
//   console.log(access_token);
// })
// .catch((error) => {
//   console.log(error);
// });

const access_token = '1000.bb3c91e059ad0527b58e26fe57f96af7.cbd96c0bdd364d26dff2fdc735be3260';


////////////////
const { TOKEN, SERVER_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

const app = express()
app.use(bodyParser.json())

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
    console.log(res.data);
}

console.log("I am outside");

app.post(URI, async (req, res) => {

    var content = "";
    var image_url = "";

    console.log("response obj", req?.body?.message);

    const last_name = req?.body?.message?.from?.last_name;
    const first_name = req?.body?.message?.from?.first_name;
    const user_name = req?.body?.message?.from?.username;
    const message = req?.body?.message?.text;
    const photo = req?.body?.message?.photo?.[0];
    function getFilePath(file_id) {
        var download = function(uri, filename, callback){
            request.head(uri, function(err, res, body){    
              request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
            });
          };
        
        return new Promise((resolve, reject) => {
          download(`${TELEGRAM_API}/getFile?file_id=${file_id}`,function(){
            console.log('done');
          })
            .then(response => {
              const file_path = response?.data?.result?.file_path;
              resolve(`https://api.telegram.org/file/bot${TOKEN}/${file_path}`);
            })
            .catch(error => reject(error));
        });
      }
      
      async function uploadImageToZohoBigin(file_path) {
        const options = {
          url: file_path,
          dest: './images'
        };
      
        try {
          const { filename } = await imageDownloader.image(options);
          const image_data = fs.readFileSync(filename);
          const image_base64 = image_data.toString('base64');
          const data = JSON.stringify({
            "data": [
              {
                "Attachment_Name": path.basename(filename),
                "File_Data": image_base64,
                "Attachment_Type": "jpg"
              }
            ]
          });
          const config = {
            method: 'POST',
            url: `https://www.zohoapis.in/bigin/v1/Deals/${contact_id}/Attachments`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${access_token}`
            },
            data: data
          };
          const response = await axios(config);
          return response.data.data[0].Attachment_Link;
        } catch (error) {
          console.error(error);
          return null;
        }
      }
      

    if (photo) {
        const file_id = photo?.file_id;
        const file_path = await getFilePath(file_id);
        image_url = await uploadImageToZohoBigin(file_path);
        content = `${user_name} : ${message} ${image_url}`;
    } else {
        if (user_name) {
            content = `${user_name} : ${message}`;
        } else if (typeof (last_name) === 'undefined' || last_name === null) {
            content = `${first_name} : ${message}`;
        } else {
            content = `${first_name} ${last_name} : ${message}`;
        }
    }

    console.log(`received message :  ${message}`);
    console.log("message", Object.keys(req.body));

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
              'Authorization': 'Bearer '+access_token
            },
            data : data
          };
          
          axios.request(config)
          .then((response) => {
            // console.log(JSON.stringify(response.data));
            console.log("Data successfully pushed to Bigin");
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
  
  app.listen(process.env.PORT || 6900, async () => {
      console.log('🚀 app running on port', process.env.PORT || 6900);
      await init()
  })
  
