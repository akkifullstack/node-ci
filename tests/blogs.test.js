const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});
describe('When Logged In', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  })
  test("when we click on plus we see blog create form", async () => {
    await page.waitFor("form label");
    const label = await page.getContentsOf("form label");
    expect(label).toEqual("Blog Title");
  });

  describe('And using valid Inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', "Testing blog Fields")
      await page.type('.content input', "Successfully tested Fields")
      await page.click("form button");
    })
    test("Submittng and takes user to review screen", async () => {
      await page.waitFor("h5")
      const text = await page.getContentsOf("h5")
      expect(text).toEqual("Please confirm your entries")
    })
    test("Submittng then saving adds blog to index page", async () => {
      await page.click("button.green")
      await page.waitFor(".card");

      const title = await page.getContentsOf(".card-title")
      const content = await page.getContentsOf("p")

      expect(title).toEqual("Testing blog Fields")
      expect(content).toEqual("Successfully tested Fields")
    })
  })
  describe('valid Inputs check', async () => {
    beforeEach(async () => {
      await page.click("form button ")
    })
    test("When enter invalid Inputs", async () => {
      let titleErr = await page.getContentsOf(".title .red-text")
      let ContentErr = await page.getContentsOf(".content .red-text")

      expect(titleErr).toEqual("You must provide a value")
      expect(ContentErr).toEqual("You must provide a value")
    })
  })
})

describe('User is not Logged In', async () => {
  test("Cant create a blog post", async () => {
    const result = await page.post('/api/blogs', 'Test Article', 'Test content')
    expect(result).toEqual({
      error: 'You must log in!'
    })
  })
  test("User cant retrive blog list", async () => {
    let resultData = await page.get('/api/blogs')
    expect(resultData).toEqual({
      error: 'You must log in!'
    })
  })
})