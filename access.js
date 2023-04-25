const axios = require('axios');
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
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
