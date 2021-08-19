const chalk = require('chalk');
require('better-logging')(console, { format: ctx => `${ctx.date}${ctx.time24} ${ctx.type} ${ctx.msg}` });
console.logLevel = 4; // All logs
require('dotenv').config({ path: __dirname + '/.env' });

const axios = require('axios');
const { startBrowser, login, sendMessage, sendSlack } = require('./notification');

const options = {
  vaccineId:        process.env.DEBUG ? process.env.DEBUG_VACCINE_ID : process.env.VACCINE_ID,
  vaccinePass:      process.env.DEBUG ? process.env.DEBUG_VACCINE_PASS : process.env.VACCINE_PASS,
  notifyRecipient:  process.env.DEBUG ? '100002425288918' : '3236546779716136',
}

const main = async (argv) => {
  console.debug(``)
  console.debug(`check vaccine login availability`)
  axios({
    method: 'post', url: 'https://api.vaccines.sciseed.jp/public/111007/login/',
    headers: { "content-type": "application/json;charset=UTF-8" },
    data: {
      partition_key: "111007",
      range_key: options.vaccineId,
      password: options.vaccinePass,
    },
  }).then(async function (response) {
    console.debug(response.data);
    const data = { ...response.data, refresh: '***', access: '***' };
    if (data.code === '200' && data.message === 'Authentication failed') {
      console.debug(`vaccine login NOT available`);
      return false;
    }

    console.debug(`vaccine login IS available!`);
    // notify to Slack
    await sendSlack(`[Debug] Login response: ${JSON.stringify(data)}`);
    await sendSlack(`🎉 Bắt đầu đăng nhập vào để book tiêm vaccine được rồi 🎉`);
    // notify to Messenger
    const { browser, page } = await startBrowser();
    await login(page);
    await sendMessage(page, options.notifyRecipient, `[Debug] Login response: ${JSON.stringify(data)}`);
    await sendMessage(page, options.notifyRecipient, `🎉 Bắt đầu đăng nhập vào để book tiêm vaccine được rồi 🎉`);
    await sendMessage(page, options.notifyRecipient, `Link trang đăng nhập: https://vaccines.sciseed.jp/saitama-city-vt/login`);
    await browser.close();
  })
  .catch(async function (error) {
    await sendSlack(`Vaccine bot error: ${error.message}`);
    console.log(error.message);
    console.log(error);
  });
}
require.main === module && main(process.argv);
