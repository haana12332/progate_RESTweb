import { ensureAuthUser } from "@/middlewares/authentication";
import {Post} from "@/models/post";
import express from "express";
import {Comment} from "@/models/comment"
import {ensureOwnerOfComment} from "@/middlewares/current_user";


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

//編集ページに移行
commentRouter.get(
    "/posts/:postId/comments/:commentId/edit",
    ensureAuthUser,
    ensureOwnerOfComment,
    async (req,res,next)=>{
        const postId = req.params.postId;
        const post = await Post.find(Number(postId));
        const commentId = req.params.commentId;
        const comment = await Comment.find(Number(commentId));
        if(comment === undefined || post === undefined){
            res.status(404).render("404");
        }
        console.log(commentId);
        console.log(comment);
        res.render("comments/edit", {
        errors: [],
        post,
        comment,
      });
});
//編集更新内容保存
commentRouter.patch(
    "/posts/:postId/comments/:commentId/",
    ensureAuthUser,

    async (req, res) => {
        const {content}=req.body;
        const post=req.params.postId;
        const comment=req.params.commentId;
        console.log(content,post,comment);

        //res.redirect(`/posts/${postId}`);
    }
)
