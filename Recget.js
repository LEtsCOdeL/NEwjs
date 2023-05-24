const fs = require('fs');
require('dotenv').config();
const axios = require('axios');
const { response } = require('express');

let data = '';
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
    // console.log(JSON.stringify(access_token));
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
    // console.log(responsedata);
    // Store the IDs in an array
    // Fetch only the IDs from the response
    const idsArray = responsedata.data.map(item => item.id);
    fs.writeFile('idsArray.json', JSON.stringify(idsArray), 'utf8', (err) => {
      if (err) {
        console.error('Error writing idsArray to file:', err);
      } else {
        console.log('idsArray has been exported to idsArray.json');
      }
    });
    // console.log(idsArray);
    // doSomethingWithIdsArray(idsArray);
  })

  .catch((error) => {
    console.log(error);
  });

