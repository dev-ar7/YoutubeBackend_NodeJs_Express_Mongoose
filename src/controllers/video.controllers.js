import mongoose from 'mongoose';

import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';
import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';
import { Video } from '../models/video.models.js';


const getAllVideos = asyncHandlerUsingPromise(
    async (req, res) => {
        const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
        //TODO: get all videos based on query, sort, pagination
    }
)

const publishAVideo = asyncHandlerUsingPromise(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandlerUsingPromise(
    async (req, res) => {
        const { videoId } = req.params
        //TODO: get video by id
        if (!videoId) {
            throw new ApiErrorHandler(404, "Sorry! No Video Found.")
        }

        const video = await Video.findById(videoId);

        res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    video,
                    "Video fetched successfully."
                )
            )
    }
)

const updateVideo = asyncHandlerUsingPromise(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandlerUsingPromise(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandlerUsingPromise(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}