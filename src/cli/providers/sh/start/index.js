import getConfig from '../../shared/getConfig';
import { createServer } from '../../../../express';

const help = () => {
  console.log(`
    bottender start <dir> -p <port>

    <dir> is the directory that contains the handler.
    If no directory is provided, the current directory will be assumed.

    ${chalk.dim('Options:')}

      -p, --port    A port number on which to start the application.
      -h, --help    Displays this message.

    ${chalk.dim('Examples:')}

    ${chalk.dim(
      '-'
    )} Start a server on 8080 port using handler form src directory.

      ${chalk.cyan('$ bottender start src -p 8080')}
  `);
};

const start = async () => {
  // read bottender.config.js

  // session
  const session = getConfig('bottender.config.js', 'session');

  let SessionStore;
  switch (session) {
    case 'file':
      SessionStore = require('../../../../session/FileSessionStore').default;
      break;
    case 'mongo':
      SessionStore = require('../../../../session/MongoSessionStore').default;
      break;
    case 'redis':
      SessionStore = require('../../../../session/RedisSessionStore').default;
      break;
    default:
      SessionStore = require('../../../../session/MemorySessionStore').default;
  }

  const sessionConfig = getConfig('bottender.config.js', session);

  const sessionStore = new SessionStore(sessionConfig);

  // platform
  const platform = getConfig('bottender.config.js', 'platform');

  let Bot;
  let shouldCreateServer;
  switch (platform) {
    case 'messenger':
      Bot = require('../../../../bot/MessengerBot').default;
      shouldCreateServer = true;
      break;
    case 'line':
      Bot = require('../../../../bot/LineBot').default;
      shouldCreateServer = true;
      break;
    case 'slack':
      Bot = require('../../../../bot/SlackBot').default;
      shouldCreateServer = true;
      break;
    case 'telegram':
      Bot = require('../../../../bot/TelegramBot').default;
      shouldCreateServer = true;
      break;
    case 'viber':
      Bot = require('../../../../bot/ViberBot').default;
      shouldCreateServer = true;
      break;
    default:
      Bot = require('../../../../bot/ConsoleBot').default;
      shouldCreateServer = false;
  }

  const platformConfig = getConfig('bottender.config.js', platform);

  const bot = new Bot(platformConfig);

  const initialState = getConfig('bottender.config.js', 'initialState');

  if (initialState) {
    bot.setInitialState(initialState);
  }

  const handler = getConfig('bottender.config.js', 'handler');

  bot.onEvent(handler);

  if (shouldCreateServer) {
    const server = createServer(bot);

    server.listen(5000, () => {
      console.log('server is running on 5000 port...');
    });
  } else {
    bot.createRuntime();
  }
};

export default start;
