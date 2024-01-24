import mongoose from 'mongoose';

import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';
import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';
import { Like } from '../models/like.models.js';


const toggleVideoLike = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const {videoId} = req.params
        
        const userId = req.user._id
    
        if (!userId) {
            throw new ApiErrorHandler(400, "Unauthorized")
        }
    
        const existingLike = await Like.findOne(
            {
                video: videoId,
                likedBy: userId
            }
        )
    
        if (existingLike) {
            
            const unlike = await Like.findOneAndDelete({
                video: videoId,
                likedBy: userId
            })
    
            return res.status(200)
                .json(
                    new ApiResponseHandler(
                        200,
                        unlike,
                        "Unliked the video.."
                    )
                )
    
        } else {
            
            const newLike = new Like(
                {
                    video: videoId,
                    likedBy: userId
                }
            )
    
            const saveNewLike = await newLike.save()
    
            return res.status(200)
                .json(
                    200,
                    saveNewLike,
                    "Successfully liked the video.."
                )
    
        }
    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }

})

const toggleCommentLike = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const {commentId} = req.params

        const userId = req.user._id

        if (!userId) {
            throw new ApiErrorHandler(400, "Unauthorized")
        }

        const existingCommentLike = await Like.findOne(
            {
                comment: commentId,
                likedBy: userId
            }
        )

        if (existingCommentLike) {
            
            const removeLike = await Like.findOneAndDelete(
                {
                    comment: commentId,
                    likedBy: userId
                }
            )

            return res.status(200)
                .json(
                    new ApiResponseHandler(
                        200,
                        removeLike,
                        "Unliked comment successfully.."
                    )
                )
            
        } else {
            const newLike = await Like.create(
                {
                    comment: commentId,
                    likedBy: userId
                }
            )

            const saveNewLike = await newLike.save()
            
            return res.status(200)
                .json(
                    200,
                    saveNewLike,
                    "Liked the comment successfully.."
                )

        }

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }

})

const togglePostLike = asyncHandlerUsingPromise(async (req, res) => {
   try {
        const {postId} = req.params

        const userId = req.user._id

        if (!userId) {
            throw new ApiErrorHandler(400, "Unuthorized")
        }

        const existingPostLike = await Like.findOne(
            {
                post: postId,
                likedBy: userId
            }
        )

        if (existingPostLike) {
            const removeLike = await Like.findOneAndDelete(
                {
                    post: postId,
                    likedBy: userId
                }
            )

            return res.status(200)
                .json(
                    new ApiResponseHandler(
                        200,
                        removeLike,
                        "Unliked post successfully"
                    )
                )
        } else {
            const newPostLike = new Like(
                {
                    post: postId,
                    likedBy: userId
                }
            )

            const saveNewPostLike = await newPostLike.save()

            return res.status(200)
                .json(
                    200,
                    saveNewPostLike,
                    "Successfully Liked the post.."
                )
        }

   } catch (error) {
        throw new ApiErrorHandler(400, error.message)
   }
})

const getLikedVideos = asyncHandlerUsingPromise(async (req, res) => {
    //TODO: get all liked videos
    // TODO: to study and reserch about the method once.
})

export {
    toggleCommentLike,
    togglePostLike,
    toggleVideoLike,
    getLikedVideos
}