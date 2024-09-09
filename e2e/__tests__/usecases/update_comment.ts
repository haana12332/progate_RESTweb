describe("Comment update", () => {
  describe("before sign in", () => {
    describe("submit failed", () => {
      test("display 401 Unauthorized page [XKqpXZuizRLpzEJQkvXr0]", async () => {
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
          `${TARGET_PAGE_URL}/posts/17/comments/1?_method=PATCH`
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
      await page.type("[data-test=input-email]", "12@progate.com");
      await page.type("[data-test=input-password]", "password");
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
    });
    beforeEach(async () => {
      await page.goto(`${TARGET_PAGE_URL}/posts/17/comments/1/edit`);
    });
    describe("submit success", () => {
      test("display post show page and dialog message [n51ihuzUkiCHq_WruSUF-]", async () => {
        await page.$eval(
          "[data-test=textarea-content]",
          el => ((el as HTMLTextAreaElement).value = "updated")
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
        expect(page.url()).toBe(`${TARGET_PAGE_URL}/posts/17`);
        expect(message).toBe("Comment successfully updated");
        expect(content).toBe("updated");
      });
    });
    describe("submit failed", () => {
      describe("specified post doesn't exist", () => {
        test("display 404 Not Found page [YyetpnDfrUWEAcyIGSa39]", async () => {
          await page.$eval(
            "[data-test=textarea-content]",
            el => ((el as HTMLTextAreaElement).value = "updated")
          );
          await page.$eval(
            "[data-test=form]",
            el =>
              ((el as HTMLFormElement).action =
                "/posts/100/comments/1?_method=PATCH")
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
      describe("specified comment doesn't exist", () => {
        test("display 404 Not Found page [it3VL-VCve1G6AyCaasod]", async () => {
          await page.$eval(
            "[data-test=textarea-content]",
            el => ((el as HTMLTextAreaElement).value = "updated")
          );
          await page.$eval(
            "[data-test=form]",
            el =>
              ((el as HTMLFormElement).action =
                "/posts/17/comments/100?_method=PATCH")
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
      describe("authenticated user is not comment's owner", () => {
        test("display 403 Forbidden page [pd7M4enS-TfQkL86B6uEu]", async () => {
          await page.$eval(
            "[data-test=textarea-content]",
            el => ((el as HTMLTextAreaElement).value = "updated")
          );
          await page.$eval(
            "[data-test=form]",
            el =>
              ((el as HTMLFormElement).action =
                "/posts/17/comments/2?_method=PATCH")
          );

          const [response] = await Promise.all([
            page.waitForNavigation(),
            page.click("[data-test=submit]"),
          ]);

          const headingText = await page.$eval("h1", el =>
            (el as HTMLElement).innerText.trim()
          );

          expect(response?.status()).toBe(403);
          expect(headingText).toBe("403 Forbidden");
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
