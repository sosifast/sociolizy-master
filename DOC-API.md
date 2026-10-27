## Balance
const axios = require('axios');
const FormData = require('form-data');
let data = new FormData();
data.append('key', '$api_key');
data.append('action', 'balance');

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

Contoh Response:
{
  "balance": "100.84292",
  "currency": "USD"
}