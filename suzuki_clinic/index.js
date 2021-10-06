const chalk = require('chalk');
require('better-logging')(console, { format: ctx => `${ctx.date}${ctx.time24} ${ctx.type} ${ctx.msg}` });
console.logLevel = 4; // All logs
require('dotenv').config({ path: __dirname + '/../.env' });

const fs = require('fs');
const puppeteer = require('puppeteer');

const main = async (argv) => {
  console.debug(``)

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.setViewport({ width: 1200, height: 800 });

  await page.goto('https://b.inet489.jp/szk2505/yoyaku/login.cgi?recno=16559&birth=20180529', { waitUntil: 'networkidle2' });

  // login
  await Promise.all([
    page.click('#btn_submit'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);

  // click 予約する
  await Promise.all([
    page.click('ul.menu a'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);

  // // click 予防接種・健診
  // await Promise.all([
  //   page.click('ul#menu li:last-child a'),
  //   page.waitForNavigation({ waitUntil: 'networkidle0' }),
  // ]);

  // // click 次へ
  // await Promise.all([
  //   page.click('input[value=次へ]'),
  //   page.waitForNavigation({ waitUntil: 'networkidle0' }),
  // ]);

  // await page.waitForTimeout(5000)
  // await browser.close();
  browser.on('disconnected', () => {
    browser.close();
  });
}
require.main === module && main(process.argv);
