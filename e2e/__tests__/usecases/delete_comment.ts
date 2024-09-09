describe("Comment delete", () => {
  describe("before sign in", () => {
    describe("submit failed", () => {
      test("display 401 Unauthorized page [qbw-RwSfdjLW90-KE1pg2]", async () => {
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
          `${TARGET_PAGE_URL}/posts/18/comments/4?_method=PATCH`
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
      await page.type("[data-test=input-email]", "13@progate.com");
      await page.type("[data-test=input-password]", "password");
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
    });
    beforeEach(async () => {
      await page.goto(`${TARGET_PAGE_URL}/posts/18`);
    });
    describe("submit success", () => {
      test("display post show page and dialog message [Ggf_3wvLpM61GH6Bep_Ey]", async () => {
        await Promise.all([
          page.waitForNavigation(),
          page.click("[data-test=submit-comment-delete]"),
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
        expect(page.url()).toBe(`${TARGET_PAGE_URL}/posts/18`);
        expect(message).toBe("Comment successfully deleted");
        expect(content).toBe("not delete target");
      });
    });
    describe("submit failed", () => {
      describe("specified post doesn't exist", () => {
        test("display 404 Not Found page [V2TuqKqTqVji1bUbCmmv1]", async () => {
          await page.$eval(
            "[data-test=form-comment-delete]",
            el =>
              ((el as HTMLFormElement).action =
                "/posts/100/comments/4?_method=DELETE")
          );

          const [response] = await Promise.all([
            page.waitForNavigation(),
            page.click("[data-test=submit-comment-delete]"),
          ]);

          const headingText = await page.$eval("h1", el =>
            (el as HTMLElement).innerText.trim()
          );

          expect(response?.status()).toBe(404);
          expect(headingText).toBe("404 Not Found");
        });
      });
      describe("specified comment doesn't exist", () => {
        test("display 404 Not Found page [BFpREEbcidfuwvCninS03]", async () => {
          await page.$eval(
            "[data-test=form-comment-delete]",
            el =>
              ((el as HTMLFormElement).action =
                "/posts/18/comments/100?_method=DELETE")
          );

          const [response] = await Promise.all([
            page.waitForNavigation(),
            page.click("[data-test=submit-comment-delete]"),
          ]);

          const headingText = await page.$eval("h1", el =>
            (el as HTMLElement).innerText.trim()
          );

          expect(response?.status()).toBe(404);
          expect(headingText).toBe("404 Not Found");
        });
      });
      describe("authenticated user is not comment's owner [y8Eoh9Q_cCreNFvdGZGG2]", () => {
        test("display 403 Forbidden page [BORwbRmtwX0hL87OLpeKM]", async () => {
          await page.$eval(
            "[data-test=form-comment-delete]",
            el =>
              ((el as HTMLFormElement).action =
                "/posts/18/comments/5?_method=DELETE")
          );

          const [response] = await Promise.all([
            page.waitForNavigation(),
            page.click("[data-test=submit-comment-delete]"),
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
