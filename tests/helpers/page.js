const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionfactory");
const userFactory = require("../factories/userfactory");

class CustomPage {

  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    })

    const page = await browser.newPage()
    const customPage = new CustomPage(page)

    return new Proxy(customPage, {
      get: function (target, property) {
        return target[property] || browser[property] || page[property];
      }
    })

  }
  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const {
      session,
      sig
    } = sessionFactory(user);
    await this.page.setCookie({
      name: "session",
      value: session
    });
    await this.page.setCookie({
      name: "session.sig",
      value: sig
    });
    await this.page.goto("http://localhost:3000/blogs");
    await this.page.waitFor('a[href="/auth/logout"]');
  }
  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML)
  }

  async get(path) {
    return this.page.evaluate(
      (_path) => {
        return fetch({
          _path
        }, {
          method: "GET",
          credentials: 'same-origin',
          headers: {
            'Accept': 'application/json'
          }
        }).then(res => res.json())
      }, path
    )
  }
  async post(path, title, content) {
    return this.page.evaluate(
      (_path, _title, _content) => {
        return fetch(_path, {
          method: "POST",
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            title: _title,
            content: _content
          }
        }).then(res => res.json())
      }, path, title, content
    )
  }
}


module.exports = CustomPage;