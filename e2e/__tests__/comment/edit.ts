describe("Comment edit page", () => {
  describe("before sign in", () => {
    test("display 401 Unauthorized page [keHAfBci7ALUlGDjBKqqh]", async () => {
      const response = await page.goto(
        `${TARGET_PAGE_URL}/posts/19/comments/6/edit`
      );

      const headingText = await page.$eval("h1", el =>
        (el as HTMLElement).innerText.trim()
      );

      expect(response?.status()).toBe(401);
      expect(headingText).toBe("401 Unauthorized");
    });
  });
  describe("after sign in", () => {
    beforeAll(async () => {
      await page.goto(`${TARGET_PAGE_URL}/login`);
      await page.type("[data-test=input-email]", "14@progate.com");
      await page.type("[data-test=input-password]", "password");
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
    });
    test("set form elements [uXICErhJznHkKCaYYhcfz]", async () => {
      await page.goto(`${TARGET_PAGE_URL}/posts/19/comments/6/edit`);

      const content = await page.$eval(
        "[data-test=textarea-content]",
        el => (el as HTMLInputElement).value
      );
      const value = await page.$eval(
        "[data-test=submit]",
        el => (el as HTMLInputElement).value
      );
      expect(content).toBe("edit target");
      expect(value).toBe("Save");
    });
    describe("specified post doesn't exist", () => {
      test("display 404 Not Found page [Oj0JK1ab42KE_-uIk5VFL]", async () => {
        const response = await page.goto(
          `${TARGET_PAGE_URL}/posts/100/comments/6/edit`
        );

        const headingText = await page.$eval("h1", el =>
          (el as HTMLElement).innerText.trim()
        );

        expect(response?.status()).toBe(404);
        expect(headingText).toBe("404 Not Found");
      });
    });
    describe("specified comment doesn't exist", () => {
      test("display 404 Not Found page [SwSN54eWs9DCdTpCOGjF7]", async () => {
        const response = await page.goto(
          `${TARGET_PAGE_URL}/posts/19/comments/100/edit`
        );

        const headingText = await page.$eval("h1", el =>
          (el as HTMLElement).innerText.trim()
        );

        expect(response?.status()).toBe(404);
        expect(headingText).toBe("404 Not Found");
      });
    });
    describe("authenticated user is not comment's owner", () => {
      test("display 403 Forbidden page [ICOOmb4zZzG7OzKjcqWGr]", async () => {
        const response = await page.goto(
          `${TARGET_PAGE_URL}/posts/19/comments/7/edit`
        );

        const headingText = await page.$eval("h1", el =>
          (el as HTMLElement).innerText.trim()
        );

        expect(response?.status()).toBe(403);
        expect(headingText).toBe("403 Forbidden");
      });
    });
    afterAll(async () => {
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=header-link-logout]"),
      ]);
    });
  });
});
