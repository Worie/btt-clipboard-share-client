const SocketIo = require('socket.io-client');
const BTT = require('btt');

// get configuration from dotenv
require('dotenv').config();

// get the data that we need from the env (desctructure)
const {
  API_URL,
  API_PROTOCOL,
  BTT_SHARED_KEY,
  BTT_PROTOCOL,
  BTT_DOMAIN,
  BTT_PORT,
  DISPLAY_NAME,
} = process.env;

const btt = new BTT.Btt({
  domain: BTT_DOMAIN,
  port: Number(BTT_PORT),
  protocol: BTT_PROTOCOL,
  sharedKey: BTT_SHARED_KEY,
}); 

const socket = SocketIo(API_URL);

socket.on('clipboard', async (data) => {
  await btt.state.set('btt_shared_clipboard', data.content, true);
  if (data.from !== DISPLAY_NAME) {
    await btt.showNotification({ title: `New shared CB entry from ${data.from}`, content: data.content}).invoke();
  }
  console.log(data);
});

// this should be in install or something
// ~/.btt/btt-clipboard-share/.env

// add an action to save the shared state
(async () => {
  btt.addTriggerAction('ctrl+cmd+c', (ev) => {
    ev.comment = "Sets up shared clipboard value to currently selected text";
    ev.actions.push(
      btt.saveSelectedText(),
      btt.executeScript(`
        // make sure that process is run within proper directory (btt runs in / by default)
        process.chdir('${process.cwd()}');
        const http = require('${API_PROTOCOL}');
        const selectedText = require('${process.cwd()}/getSharedClipboardState.js');

        // this is a promise because we need to fetch the data from btt webserver
        selectedText.then(v => {
          // let server know that we want to save the clipboard state to our new value
          http.get('${API_URL}/set?clipboard='+encodeURIComponent(v)+'&from=${DISPLAY_NAME}');
          console.log(v);
        });
      `),
    );
  });
})();

// add an action to retrieve the shared state
(async () => {
  btt.addTriggerAction('ctrl+cmd+v', (ev) => {
    ev.comment = "Pastes value from shared clipboard";
    ev.actions.push(
      btt.executeScript(`
        // make sure that process is run within proper directory (btt runs in / by default)
        process.chdir('${process.cwd()}');
        const BTT = require('${process.cwd()}/node_modules/btt');

        // get configuration from dotenv
        require('${process.cwd()}/node_modules/dotenv').config();

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
        

        // this is a promise because we need to fetch the data from btt webserver
        btt.state.get('btt_shared_clipboard').then(clipboard => {
          btt.sendText({text: clipboard, moveCursorLeft: 0}).invoke();
        });
      `),
    );
  });
})();

// for some reason this is needed for actions to work
btt.restart().invoke();