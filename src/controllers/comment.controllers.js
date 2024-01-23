import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';
import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';
import { Comment } from '../models/comment.models.js';


const getVideoComments = asyncHandlerUsingPromise(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const { videoId } = req.params
        const { content } = req.body
        
        if (!content) {
            throw new ApiErrorHandler(400, "Type something to comment")
        }

        const comment = await Comment.create(
            {
                content,
                video: videoId,
                owner: req.user._id
            }
        )

        const recentlyAddedCommentFromDBbyId = await Comment.findById(comment._id)

        if (!recentlyAddedCommentFromDBbyId) {
            throw new ApiErrorHandler(500, "Something went wrong while saving comment")
        }

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    201,
                    recentlyAddedCommentFromDBbyId,
                    "Your comment has been added successfully."
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

const updateComment = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const { commentId } = req.params

        const { content } = req.body

        if (!commentId) {
            throw new ApiErrorHandler(400, "Invalid Request")
        }

        if (!content) {
            throw new ApiErrorHandler(400, "Type Something to comment")
        }

        const comment = await Comment.findById(commentId)

        if (comment.owner !== req.user._id) {
            throw new ApiErrorHandler(400, "You are not authorized to edit this comment.")
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
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
                    updatedComment,
                    "Comment has been updated successfully."
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

const deleteComment = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const { commentId } = req.params

        if (!commentId) {
            throw new ApiErrorHandler(400, "Invalid Request")
        }

        await Comment.findByIdAndDelete(commentId)

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    {},
                    "Comment has been deleted successfully."
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }