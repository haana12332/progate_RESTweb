import { ensureAuthUser } from "@/middlewares/authentication";
import {Post} from "@/models/post";
import express from "express";
import {Comment} from "@/models/comment"
export const commentRouter = express.Router();

//新規コメントの作成
commentRouter.post("/posts/:postId/comments", ensureAuthUser , async (req,res,next)=>{
    console.log(req.body.content);
    console.log(req.params.postId);
    const content=req.body.content;
    const postId=Number(req.params.postId);
    const currentUserId = Number(req.authentication?.currentUserId);
    console.log(currentUserId);
    if (currentUserId === undefined) {
        // `ensureAuthUser` enforces `currentUserId` is not undefined.
        // This must not happen.
        return next(new Error("Invalid error: currentUserId is undefined."));
    }
    const comment = new Comment(currentUserId,postId,content);
    await comment.save();
    req.dialogMessage?.setMessage("Comment successfully created");
    res.redirect(`/posts/${postId}`);
});

