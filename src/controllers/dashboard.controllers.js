import mongoose from "mongoose"
import {Video} from "../models/video.models.js";
import {Subscription} from "../models/subscription.models.js";
import {Like} from "../models/like.models.js";
import {ApiErrorHandler} from "../utils/ApiErrorHandler.js"
import {ApiResponseHandler} from "../utils/ApiResponseHandler.js"
import {asyncHandlerUsingPromise} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandlerUsingPromise(async (req, res) => {
    try {
        
        const userId = req.user._id

        if (!userId) {
            throw new ApiErrorHandler(400, "Invalid Request")
        }

        const totalVideoViews = await Video.aggregate([
            {
                $match: {
                    user: mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalViwes: {
                        $sum: "$views"
                    }
                }
            }
        ])

        const totalSubscribers = await Subscription.countDocuments(
            {channel: userId}
        )
        
        const totalVideos = await Video.countDocuments(
            {user: userId}
        )

        const totalLikes = await Like.countDocuments(
            {video: {
                $in: await Video.find(
                    {user: userId}, "_id"
                )
            }}
        );

        const channelStats = {
            totalVideoViews: totalVideoViews.length > 0 ? totalVideoViews[0].totalViwes : 0,
            totalSubscribers,
            totalVideos,
            totalLikes
        }

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    channelStats,
                    "Your channel stats fetched successfully."
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

const getChannelVideos = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const userId = req.user._id

        const channelVideos = await Video.find({user: userId})

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    channelVideos,
                    "All the videos of your channel added successfully."
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

export {
    getChannelStats, 
    getChannelVideos
}