const puppeteer = require('puppeteer');
const axios = require('axios');

const options = {
  headless: !process.env.DEBUG,
}

const SELECTOR = {
  emailField: '#email',
  passwordField: '#pass',
  loginButton: '#loginbutton',
  messageField: '[role=textbox]',
  sendButton: 'form > div > div:last-child > span:last-child > div',
}

const sleep = async (ms) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, ms)
  });
}

module.exports.startBrowser = async() => {
  const browser = await puppeteer.launch({ headless: options.headless });
  const page = await browser.newPage();
  page.setViewport({ width: 1200, height: 800 });
  console.debug("browser is ready");
  return { browser, page };
}

module.exports.login = async (page) => {
  await page.goto('https://www.messenger.com/', { waitUntil: 'networkidle2' });

  let emailField = await page.$(SELECTOR.emailField);
  let passwordField = await page.$(SELECTOR.passwordField);
  let loginButton = await page.$(SELECTOR.loginButton);

  console.debug("logging in messenger");
  await emailField.type(process.env.FB_ID);
  await passwordField.type(process.env.FB_PASS);

  // Wait till submit button is clicked and the page is loaded
  const navigationPromise = page.waitForNavigation();
  await loginButton.click();
  await navigationPromise;
  console.debug("logged in messenger");
}

module.exports.sendMessage = async (page, recipientId, message) => {
  await page.goto(`https://www.messenger.com/t/${recipientId}`, { waitUntil: 'networkidle2' });

  let messageField = await page.$(SELECTOR.messageField);
  await messageField.type(message);

  // Has to use html hanlder not puppeteer handler
  await page.$eval(SELECTOR.sendButton, elem => elem.click());
  console.debug(`sent "${message}" to #${recipientId}`);
  await sleep(500);
}

module.exports.sendSlack = async (message) => {
  const payload = {
    text: message
  }
  const webhookUrl = process.env.SLACK_HOOK;
  const res = await axios.post(webhookUrl, JSON.stringify(payload));
  console.debug(`sent "${message}" to Slack`);
  return res.data;
}
