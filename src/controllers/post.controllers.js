import mongoose from 'mongoose';

import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';
import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';
import { Post } from '../models/post.models.js';


const createTweet = asyncHandlerUsingPromise(async (req, res) => {
    //TODO: create tweet
})

const getUserTweets = asyncHandlerUsingPromise(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandlerUsingPromise(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandlerUsingPromise(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}