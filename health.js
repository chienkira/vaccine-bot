const chalk = require('chalk');
require('better-logging')(console, { format: ctx => `${ctx.date}${ctx.time24} ${ctx.type} ${ctx.msg}` });
console.logLevel = 4; // All logs
require('dotenv').config({ path: __dirname + '/.env' });

const { startBrowser, login, sendMessage } = require('./notification');

const main = async (argv) => {
  const { browser, page } = await startBrowser();
  await login(page);
  await sendMessage(page, '100002425288918', `I'm ALIVE`);
  await browser.close();
}
require.main === module && main(process.argv);
