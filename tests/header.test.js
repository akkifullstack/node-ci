const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("Header logo Check", async () => {
  // const text = await page.$eval("a.brand-logo", el => el.innerHTML);
  await page.waitFor("a.brand-logo")
  const text = await page.getContentsOf("a.brand-logo", el => el.innerHTML);
  expect(text).toEqual("Blogster");
});

test("click login link on Header", async () => {
  await page.click(".right a");
  const url = page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("when user login,shows logout button", async () => {
  await page.login()
  const text = await page.getContentsOf('a[href="/auth/logout"]', el => el.innerHTML);
  expect(text).toEqual("Logout");
});