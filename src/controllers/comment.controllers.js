import mongoose from 'mongoose';

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
    // TODO: add a comment to a video
})

const updateComment = asyncHandlerUsingPromise(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandlerUsingPromise(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }