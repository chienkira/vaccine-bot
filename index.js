const chalk = require('chalk');
require('better-logging')(console, { format: ctx => `${ctx.date}${ctx.time24} ${ctx.type} ${ctx.msg}` });
console.logLevel = 4; // All logs
require('dotenv').config()

const axios = require('axios');
const { startBrowser, login, sendMessage } = require('./notification');

const options = {
  vaccineId:        process.env.DEBUG ? process.env.DEBUG_VACCINE_ID : process.env.VACCINE_ID,
  vaccinePass:      process.env.DEBUG ? process.env.DEBUG_VACCINE_PASS : process.env.VACCINE_PASS,
  notifyRecipient:  process.env.DEBUG ? '100002425288918' : '3236546779716136',
}

const main = async (argv) => {
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
    const data = response.data;
    console.debug(data);

    if (data.code === '200' && data.message === 'Authentication failed') {
      console.debug(`vaccine login NOT available`)
      return false;
    }

    console.debug(`vaccine login IS available!`)
    const { browser, page } = await startBrowser();
    await login(page);
    await sendMessage(page, options.notifyRecipient, `[Debug] Login response: ${JSON.stringify({...data, refresh: '***', access: '***'})}`);
    await sendMessage(page, options.notifyRecipient, `🎉 Bắt đầu đăng nhập vào để book tiêm vaccine được rồi 🎉`);
    await sendMessage(page, options.notifyRecipient, `Link trang đăng nhập: https://vaccines.sciseed.jp/saitama-city-vt/login`);
    await browser.close();
  })
  .catch(async function (error) {
    console.error(error.message);
    console.error(error);
  });
}
require.main === module && main(process.argv);
