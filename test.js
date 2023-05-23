require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const imageDownloader = require('image-downloader');
const fs = require('fs');
const path = require('path');

// generating Access Token from refresh token
let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://accounts.zoho.in/oauth/v2/token?refresh_token=1000.af28db274d84e4200cdf588a4a71d89f.b09802551fb52b2432d9d60c99db8960&client_id=1000.QOWO0XMYJCMFER0LS7UGU3MKFRKJNI&client_secret=f1e42bd92714a2251ab1730acf64e9618ba370c99a&grant_type=refresh_token',
  headers: {
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

let configg = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://www.zohoapis.in/bigin/v1/settings/modules',
  headers: { 
    'Authorization':'Bearer'+ access_token
  }
};

axios.request(configg)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
