import { Post } from "../model/Post.model.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import logger from "../utils/logger.js";

export const createPost = wrapAsync(async ()=>{
    const {content, mediaIds} = req.body

    const createdPost = await new Post({
        user: req.user.userId,
        content,
        mediaIds : mediaIds || []
    })

    await createPost.save()

    logger.info("Post created successfully!", createPost)

    res.status(201).json({
        success:true,
        message:"Post created successfully!"
    })
})

export const getAllPost = wrapAsync(async ()=>{

})

export const getPost = wrapAsync(async ()=>{

})

export const DeletePost = wrapAsync(async ()=>{

})
