import mongoose from 'mongoose';

import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';
import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';
import { Video } from '../models/video.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { User } from '../models/user.models.js';


const getAllVideos = asyncHandlerUsingPromise(
    async (req, res) => {
        const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
        //TODO: get all videos based on query, sort, pagination
    }
)

// get video, upload to cloudinary, create video
const publishAVideo = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const { title, description} = req.body

        // console.log(req.body)

        if ([title, description].some((field) => field?.trim() === "")) {
            throw new ApiErrorHandler(400, "Title and Description fields are required to publish video.")
        }

        const thumbnailPath = req.files?.thumbnail[0]?.path
        if(!thumbnailPath) {
            throw new ApiErrorHandler(400, "Thumbnail is required")
        }
        // console.log(req.files)

        let videoFilePath;
        if(req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
            videoFilePath = req.files.videoFile[0].path;
            // console.log(videoFilePath)
        }

        const thumbnail = await uploadOnCloudinary(thumbnailPath);
        const videoFile = await uploadOnCloudinary(videoFilePath);

        if(!videoFile) {
            throw new ApiErrorHandler(400, "Video file is required. ")
        }

        // console.log(videoFile)
        // console.log(videoFile.duration)

        // create video object entry in MongoDB
        const creadedVideo = await Video.create({
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title,
            description,
            duration: videoFile.duration,
            isPublished: true,
            owner: req.user?._id 
        });

        // check for video uplopad
        const videoFromDBbyID = await Video.findById(creadedVideo._id)

        if (!videoFromDBbyID) {
            throw new ApiErrorHandler(500, "Something went wrong while uploading the video!")
        }
        console.log(videoFromDBbyID);

        return res.status(200)
            .json(
                new ApiResponseHandler(201, videoFromDBbyID, "Video uploaded successfullt.")
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

// get video by id
const getVideoById = asyncHandlerUsingPromise(
    async (req, res) => {
        try {
            const { videoId } = req.params
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
        } catch (error) {
            throw new ApiErrorHandler(404, error.message);
        }
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