describe("Post show page", () => {
  describe("after sign in", () => {
    beforeAll(async () => {
      await page.goto(`${TARGET_PAGE_URL}/login`);
      await page.type("[data-test=input-email]", "9@progate.com");
      await page.type("[data-test=input-password]", "password");
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
      await Promise.all([
        page.waitForSelector("[data-test=submit-like]"),
        page.goto(`${TARGET_PAGE_URL}/posts/14`),
      ]);
    });
    test("display post info [GUUuuP7QHN8O2VpecYkij]", async () => {
      const name = await page.$eval("[data-test=user-name]", el =>
        (el as HTMLElement).innerText.trim()
      );
      const content = await page.$eval("[data-test=post-content]", el =>
        (el as HTMLElement).innerText.trim()
      );
      const time = await page.$eval("[data-test=post-time]", el =>
        (el as HTMLElement).innerText.trim()
      );
      const userImage = await page.$eval(
        "[data-test=user-image]",
        el => (el as HTMLImageElement).src
      );
      expect(name).toBe("for post show");
      expect(content).toBe("show post");
      expect(time).toBe("2021/06/01 02:32");
      expect(userImage).toBe(`${TARGET_PAGE_URL}/image/users/default_user.jpg`);
      expect(await page.$("[data-test=post-image]")).toBeNull();
    });
    test("display post's like info [lnfUMRoEWSSmTvq4yzrnf]", async () => {
      const likeAction = await page.$eval(
        "[data-test=form-like]",
        el => (el as HTMLFormElement).action
      );
      const unLikedicon = await page.$eval("[data-test=favorite-icon]", el =>
        (el as HTMLElement).innerText.trim()
      );
      const likeCount = await page.$eval("[data-test=like-count]", el =>
        (el as HTMLElement).innerText.trim()
      );
      const unLikediconStyleFontFamily = await page.$eval(
        "[data-test=favorite-icon]",
        el => window.getComputedStyle(el).getPropertyValue("font-family")
      );
      expect(new URL(likeAction).pathname).toBe("/likes/14");
      expect(unLikedicon).toBe("favorite_border");
      expect(unLikediconStyleFontFamily).toBe('"Material Icons"');
      expect(likeCount).toBe("0");
      await Promise.all([
        page.waitForSelector("[data-test=submit-like]"),
        page.goto(`${TARGET_PAGE_URL}/posts/15`),
      ]);
      const unLikeAction = await page.$eval(
        "[data-test=form-like]",
        el => (el as HTMLFormElement).action
      );
      const likedIcon = await page.$eval("[data-test=favorite-icon]", el =>
        (el as HTMLElement).innerText.trim()
      );
      expect(new URL(unLikeAction).pathname).toBe("/likes/15");
      expect(likedIcon).toBe("favorite");
    });
    afterAll(async () => {
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=header-link-logout]"),
      ]);
    });
  });
  describe("before sign in", () => {
    beforeAll(async () => {
      await page.goto(`${TARGET_PAGE_URL}/posts/1`);
    });
    test("display sign in required error [ZANEuqr6wSZravaSbBnTI]", async () => {
      const message = await page.$eval("[data-test=dialog]", el =>
        (el as HTMLElement).innerText.trim()
      );
      expect(page.url()).toBe(`${TARGET_PAGE_URL}/login`);
      expect(message).toBe("You must be logged in");
      await page.reload();
      expect(await page.$("[data-test=dialog]")).toBeNull();
    });
  });
});
describe("Comment index", () => {
  describe("after sign in", () => {
    beforeAll(async () => {
      await page.goto(`${TARGET_PAGE_URL}/login`);
      await page.type("[data-test=input-email]", "15@progate.com");
      await page.type("[data-test=input-password]", "password");
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=submit]"),
      ]);
    });
    test("display comment info and menu items [sY17ltzTJKdxncLpF_ao2]", async () => {
      await page.goto(`${TARGET_PAGE_URL}/posts/20`);

      const name = await page.$eval("[data-test=comment-user-name]", el =>
        (el as HTMLElement).innerText.trim()
      );
      const content = await page.$eval("[data-test=comment-content]", el =>
        (el as HTMLElement).innerText.trim()
      );
      const userImage = await page.$eval(
        "[data-test=comment-user-image]",
        el => (el as HTMLImageElement).src
      );
      const editLink = await page.$("[data-test=link-comment-edit]");
      const deleteForm = await page.$("[data-test=form-comment-delete]");

      expect(name).toBe("for index comment");
      expect(content).toBe("index target");
      expect(userImage).toBe(`${TARGET_PAGE_URL}/image/users/default_user.jpg`);
      expect(editLink).not.toBeNull();
      expect(deleteForm).not.toBeNull();
    });
    test("not display menu items on not owner comment [58scoOmti0p9_pepmFN0M]", async () => {
      await page.goto(`${TARGET_PAGE_URL}/posts/21`);

      const name = await page.$eval("[data-test=comment-user-name]", el =>
        (el as HTMLElement).innerText.trim()
      );
      const content = await page.$eval("[data-test=comment-content]", el =>
        (el as HTMLElement).innerText.trim()
      );
      const userImage = await page.$eval(
        "[data-test=comment-user-image]",
        el => (el as HTMLImageElement).src
      );
      const editLink = await page.$("[data-test=link-comment-edit]");
      const deleteForm = await page.$("[data-test=form-comment-delete]");

      expect(name).toBe("Ken the Ninja");
      expect(content).toBe("not owner comment");
      expect(userImage).toBe(`${TARGET_PAGE_URL}/image/users/default_user.jpg`);
      expect(editLink).toBeNull();
      expect(deleteForm).toBeNull();
    });
    test("display comment list in order of newest to oldest [NBTl9YeCVrAlajwqWOQXs]", async () => {
      await page.goto(`${TARGET_PAGE_URL}/posts/22`);

      const newestContent = await page.$eval(
        "[data-test=comments-container]",
        el => {
          return (
            el.firstElementChild?.querySelector(
              "[data-test=comment-content]"
            ) as HTMLElement
          ).innerText.trim();
        }
      );
      const oldestContent = await page.$eval(
        "[data-test=comments-container]",
        el => {
          return (
            el.lastElementChild?.querySelector(
              "[data-test=comment-content]"
            ) as HTMLElement
          ).innerText.trim();
        }
      );
      expect(newestContent).toBe("newest comment");
      expect(oldestContent).toBe("oldest comment");
    });
    afterAll(async () => {
      await Promise.all([
        page.waitForNavigation(),
        page.click("[data-test=header-link-logout]"),
      ]);
    });
  });
});
