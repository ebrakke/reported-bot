const restify = require('restify');
const builder = require('botbuilder');

let server = restify.createServer();
server.listen(3978, () => {
  console.log(`${server.name} is listening on port ${server.url}`)
});


let connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.enc.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());
let intents = new builder.IntentDialog();
let bot = new builder.UniversalBot(connector);
bot.dialog('/', intents);

intents.matches(/^change name/i, [
  session => { session.beginDialog('/profile'); },
  (session, results) => { session.send('Okay... Changed your name to %s', session.userData.name); }
]);

intents.onDefault([
  (session, args, next) => {
    if (!session.userData.name) {
      return session.beginDialog('/profile');
    }
    next();
  },
  (session, results) => { session.send('Hello, %s', session.userData.name); }
]);

bot.dialog('/profile', [
  session => { builder.Prompts.text(session, 'Hi, whats your name?'); },
  (session, result) => {
    session.userData.name = result.response;
    session.endDialog();
  }
])