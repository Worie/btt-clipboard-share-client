const BTT = require('btt');

// get configuration from dotenv
require('dotenv').config();

// get the data that we need from the env (desctructure)
const {
  API_URL,
  BTT_SHARED_KEY,
  BTT_PROTOCOL,
  BTT_DOMAIN,
  BTT_PORT,
} = process.env;

const btt = new BTT.Btt({
  domain: BTT_DOMAIN,
  port: BTT_PORT,
  protocol: BTT_PROTOCOL,
  sharedKey: BTT_SHARED_KEY,
}); 


module.exports = btt.state.get('selected_text');