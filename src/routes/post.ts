import express from "express";
import {body, validationResult} from "express-validator";
import {formatDate} from "@/lib/convert_date";
import {Post} from "@/models/post";
import {Like} from "@/models/like";
import {Comment} from "@/models/comment";
import {ensureAuthUser} from "@/middlewares/authentication";
import {ensureOwnerOfPost} from "@/middlewares/current_user";
export const postRouter = express.Router();

postRouter.get("/", ensureAuthUser, async (req, res) => {
  const posts = await Post.all();
  const postsWithUser = await Promise.all(
    posts.map(async post => {
      const user = await post.user();
      return {
        ...post,
        user,
      };
    })
  );
  res.render("posts/index", {
    posts: postsWithUser,
  });
});

postRouter.get("/new", ensureAuthUser, (req, res) => {
  res.render("posts/new", {
    post: {
      content: "",
    },
    errors: [],
  });
});

postRouter.get("/:postId", ensureAuthUser, async (req, res, next) => {
  const {postId} = req.params;
  const post = await Post.find(Number(postId));
  if (!post || !post.id){
    res.status(404).render("404");
    return next(new Error("Invalid error: The post or post.id is undefined."));
  }

    
  const user = await post.user();
  const currentUserId = req.authentication?.currentUserId;
  if (currentUserId === undefined) {
    // `ensureAuthUser` enforces `currentUserId` is not undefined.
    // This must not happen.
    return next(new Error("Invalid error: currentUserId is undefined."));
  }
  const likeCount = await post.hasLikedCount();
  const hasLiked = await Like.isExistByUser(currentUserId, post.id);
  const comments = await Comment.allByPost(post.id);
  res.render("posts/show", {
    post,
    postCreatedAt: post.createdAt ? formatDate(post.createdAt) : "",
    user,
    likeCount,
    hasLiked,
    comments,
  });
});

postRouter.post(
  "/",
  ensureAuthUser,
  body("content", "Content can't be blank").notEmpty(),
  async (req, res, next) => {
    const {content} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("posts/new", {
        post: {
          content,
        },
        errors: errors.array(),
      });
    }

    const currentUserId = req.authentication?.currentUserId;
    if (currentUserId === undefined) {
      // `ensureAuthUser` enforces `currentUserId` is not undefined.
      // This must not happen.
      return next(new Error("Invalid error: currentUserId is undefined."));
    }
    const post = new Post(content, currentUserId);
    await post.save();
    req.dialogMessage?.setMessage("Post successfully created");
    res.redirect("/posts");
  }
);

postRouter.get(
  "/:postId/edit",
  ensureAuthUser,
  ensureOwnerOfPost,
  async (req, res) => {
    res.render("posts/edit", {
      errors: [],
    });
  }
);

postRouter.patch(
  "/:postId",
  ensureAuthUser,
  ensureOwnerOfPost,
  body("content", "Content can't be blank").notEmpty(),
  async (req, res) => {
    const {content} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("posts/edit", {
        post: {
          content,
        },
        errors: errors.array(),
      });
    }
    const post = res.locals.post;
    post.content = content;
    await post.update();
    req.dialogMessage?.setMessage("Post successfully edited");
    res.redirect("/posts");
  }
);

postRouter.delete(
  "/:postId",
  ensureAuthUser,
  ensureOwnerOfPost,
  async (req, res) => {
    const post = res.locals.post;
    await post.delete();
    req.dialogMessage?.setMessage("Post successfully deleted");
    res.redirect("/posts");
  }
);
