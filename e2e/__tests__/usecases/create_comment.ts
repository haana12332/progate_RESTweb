describe("Comment create", () => {
  describe("before sign in", () => {
    describe("submit failed", () => {
      test("display 401 Unauthorized page [bE7Ievbz6MUksTwo34UKl]", async () => {
        await page.setRequestInterception(true);

        page.once("request", async request => {
          await request.continue({
            method: "POST",
            postData: "content=dummy",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });
          await page.setRequestInterception(false);
        });

        const response = await page.goto(
          `${TARGET_PAGE_URL}/posts/16/comments`
        );

        const headingText = await page.$eval("h1", el =>
          (el as HTMLElement).innerText.trim()
        );

        expect(response?.status()).toBe(401);
        expect(headingText).toBe("401 Unauthorized");
      });
    });
  });
  describe("after sign in", () => {
    beforeAll(async () => {
      await page.goto(`${TARGET_PAGE_URL}/login`);
      await page.type("[data-test=input-email]", "11@progate.com");
      await page.type("[data-test=input-password]", "password");
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
    });
    beforeEach(async () => {
      await page.goto(`${TARGET_PAGE_URL}/posts/16`);
    });
    describe("submit success", () => {
      test("display post show page and dialog message [vjfsbClwd5E7LAsQe7N_K]", async () => {
        await page.$eval(
          "[data-test=textarea-content]",
          el => ((el as HTMLTextAreaElement).value = "test content")
        );
        await Promise.all([
          page.waitForNavigation(),
          page.click("[data-test=submit]"),
        ]);
        const content = await page.$eval(
          "[data-test=comments-container]",
          el => {
            return (
              el.firstElementChild?.querySelector(
                "[data-test=comment-content]"
              ) as HTMLElement
            ).innerText.trim();
          }
        );
        const message = await page.$eval("[data-test=dialog]", el =>
          (el as HTMLElement).innerText.trim()
        );
        expect(page.url()).toBe(`${TARGET_PAGE_URL}/posts/16`);
        expect(message).toBe("Comment successfully created");
        expect(content).toBe("test content");
      });
    });
    describe("submit failed", () => {
      describe("specified post doesn't exist", () => {
        test("display 404 Not Found page [ZTSnLYf6iF4x1d-r697NN]", async () => {
          await page.$eval(
            "[data-test=textarea-content]",
            el => ((el as HTMLTextAreaElement).value = "test content")
          );
          await page.$eval(
            "[data-test=form]",
            el => ((el as HTMLFormElement).action = "/posts/100/comments")
          );

          const [response] = await Promise.all([
            page.waitForNavigation(),
            page.click("[data-test=submit]"),
          ]);

          const headingText = await page.$eval("h1", el =>
            (el as HTMLElement).innerText.trim()
          );

          expect(response?.status()).toBe(404);
          expect(headingText).toBe("404 Not Found");
        });
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
