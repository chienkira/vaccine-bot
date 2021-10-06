const chalk = require('chalk');
require('better-logging')(console, { format: ctx => `${ctx.date}${ctx.time24} ${ctx.type} ${ctx.msg}` });
console.logLevel = 4; // All logs
require('dotenv').config({ path: __dirname + '/../.env' });

const { startBrowser, login, sendMessage } = require('../notification');
const fs = require('fs');
const puppeteer = require('puppeteer');

const options = {
  checkUrl: 'https://camprsv.com/10759/rsv_list/?rsvbase_stock_lists_s=2021-10-30',
  stopKey: '/tmp/STOP_CHECK_WARABIDAIRA',
  notifyRecipient:  process.env.DEBUG ? '100002425288918' : '3236546779716136',
}

const main = async (argv) => {
  console.debug(``)
  console.debug(`check booking status of warabidaira camp site`)

  if (fs.existsSync(options.stopKey)) {
    console.debug(`skip checking!`);
    return false;
  }

  console.debug(`open website and check booking status`);
  const browser = await puppeteer.launch({ headless: !process.env.DEBUG });
  const page = await browser.newPage();
  page.setViewport({ width: 1200, height: 800 });

  await page.goto(options.checkUrl, { waitUntil: 'networkidle2' });
  const plans = await page.$$eval('li.plan', (plans) =>
    plans.map((a) => a.innerHTML)
  );
  const bangalowPlans = plans.filter(p => p.includes("バンガロー"))

  if (bangalowPlans.length) {
    console.debug(`available plans: ${bangalowPlans.join()}`);

    // touch new file to store check result
    fs.closeSync(fs.openSync(options.stopKey, 'w'));
    // notify to Messenger
    const { browser, page } = await startBrowser();
    await login(page);
    await sendMessage(page, options.notifyRecipient, `🎉 Có bangalow trống (${bangalowPlans.join()}) để book ở warabidaira rồi 🎉`);
    await sendMessage(page, options.notifyRecipient, `Link trang book: ${options.checkUrl}`);
    await browser.close();
  } else {
    console.debug(`Oh!! No available plan`);
  }

  await browser.close();
}
require.main === module && main(process.argv);
