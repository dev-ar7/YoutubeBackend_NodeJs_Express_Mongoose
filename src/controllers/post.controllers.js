import mongoose from 'mongoose';

import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';
import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';
import { Post } from '../models/post.models.js'


const createPost = asyncHandlerUsingPromise(async (req, res) => {
    try {
        
        const { content } = req.body

        if([content].some((field) => field?.trim() === "")) {
            throw new ApiErrorHandler(400, "Type something to create new post")
        }

        const post = await Post.create(
            {
                content,
                owner: req.user._id
            }
        )
        console.log(post);

        const recentlyCreatedPostFromDBbyId = await Post.findById(post._id)

        if (!recentlyCreatedPostFromDBbyId) {
            throw new ApiErrorHandler(500, "Something went wrong while adding new post")
        }

        return res.status(200)
            .json(
                new ApiResponseHandler(201, 
                        recentlyCreatedPostFromDBbyId,
                        "Your post added successfully."
                    )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, "Unable to create post.")
    }
})

const getUserPosts = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const { postId } = req.params

        if (!postId) {
            throw new ApiErrorHandler(400, "Sorry! No post found.")
        }

        const post = await Post.findById(postId)

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    post,
                    "Post fetched successfully"
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

const updatePost = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const { postId } = req.params

        const { content } = req.body
        
        if (!content) {
            throw new ApiErrorHandler(400, "Type something to post")
        }

        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $set: {
                    content
                }
            },
            {new: true}
        )

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    post,
                    "Post updated successfully"
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

const deletePost = asyncHandlerUsingPromise(async (req, res) => {
    try {
        
        const { postId } = req.params

        if (!postId) {
            throw new ApiErrorHandler(400, "Invalid request")
        }

        await Post.findByIdAndDelete(postId)

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    {},
                    "Post has been deleted successfully."
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

export {
    createPost,
    getUserPosts,
    updatePost,
    deletePost
}