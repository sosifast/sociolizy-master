const axios = require('axios');
const FormData = require('form-data');
let data = new FormData();
data.append('key', '$api_key');
data.append('action', 'services');

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: '$url',
  headers: { 
    'Content-Type': 'multipart/form-data; boundary=<calculated when request is sent>', 
    ...data.getHeaders()
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

Example response:
[
  {
      "service": "5",
      "name": "Instagram Followers [15K] ",
      "category": "Instagram - Followers [Guaranteed\/Refill] - Less Drops \u2b50",
      "rate": "1.02",
      "min": "500",
      "max": "10000"
      "type": default
      "desc": usernames
      "dripfeed": 1
  },
  {
      "service": "9",
      "name": "Instagram Followers - Max 300k - No refill - 30-40k\/Day",
      "category": "Instagram - Followers [Guaranteed\/Refill] - Less Drops \u2b50",
      "rate": "0.04",
      "min": "500",
      "max": "300000"
      "type": default
      "desc": usernames
      "dripfeed": 1
  },
  {
      "service": "10",
      "name": "Instagram Followers ( 30 days auto refill ) ( Max 350K ) (Indian Majority )",
      "category": "Instagram - Followers [Guaranteed\/Refill] - Less Drops \u2b50",
      "rate": "1.2",
      "min": "100",
      "max": "350000"
      "type": default
      "desc": usernames
      "dripfeed": 1
  }
]
            