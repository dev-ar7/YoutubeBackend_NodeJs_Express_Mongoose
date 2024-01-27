import mongoose from 'mongoose';

import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';
import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';
import { Video } from '../models/video.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';


const getAllVideos = asyncHandlerUsingPromise(
    async (req, res) => {
        try {
            const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
            
            const filter = {}
            if(!query) {
                throw new ApiErrorHandler(400, "Invalid Request")
            }

            if(query) {
                filter.$or = [
                    {title: { $regex: query, $options: "i" }},
                    { description: { $regex: query, $options: "i" }}
                ];
            }

            if (userId) {
                filter.owner = userId
            }

            const sort = {}

            if (sortBy) {
                sort[sortBy] = sortType === "desc" ? -1 : 1;
            }

            const videos = await Video.find(filter)
                .skip((page -1) *limit)
                .limit(limit)
                .sort(sort)

            return res.status(200)
                .json(
                    new ApiResponseHandler(
                        200,
                        videos,
                        "Video Fetched Successfully"
                    )
                )

        } catch (error) {
            throw new ApiErrorHandler(400, error.message)
        }
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
        // console.log(videoFromDBbyID);

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
    
            return res.status(200)
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

// get videoId by url and update videosss
const updateVideo = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const { videoId } = req.params
    
        const { title, description } = req.body
        if (!title || !description) {
            throw new ApiErrorHandler(400, "All fields are required!!")
        }
    
        const thumbnailPath = req.file?.path
        if (!thumbnailPath) {
            throw new ApiErrorHandler(400, "Thumbnail file is missing!")
        }
    
        const thumbnail = await uploadOnCloudinary(thumbnailPath);
    
        if (!thumbnail.url) {
            throw new ApiErrorHandler(400, "Error while uploading thumbnail")
        }
    
        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    thumbnail: thumbnail.url,
                    title,
                    description
                }
            },
            {new: true}
        )
    
        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    video,
                    "Video details updated successfully."
                )
            )
    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }

})

const deleteVideo = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const { videoId } = req.params
    
        if (!videoId) {
            throw new ApiErrorHandler(400, "Invalid Request")
        }
    
        await Video.findByIdAndDelete(videoId);
    
        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    {},
                    "Video has been deleted successfully."
                )
            )
    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }

})

const togglePublishStatus = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const { videoId } = req.params
        
        if (!videoId) {
            throw new ApiErrorHandler(400, "Invalid Request ")
        }

        const uploadedVideo = await Video.findById(videoId)

        if(!uploadedVideo) {
            throw new ApiErrorHandler(400, "Video not found.")
        }

        uploadedVideo.isPublished = !uploadedVideo.isPublished

        await uploadedVideo.save()

        res.status(200).json(
            new ApiResponseHandler(
                200,
                { isPublished: uploadedVideo.isPublished },
                "Publish status toggled successfully."
            )
        );

    } catch (error) {
        throw new ApiErrorHandler(400, "Unable to toogle the status!")
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}