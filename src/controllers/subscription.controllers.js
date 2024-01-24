import mongoose from 'mongoose';

import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';
import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';
import { Subscription } from '../models/subscription.models.js';


const toggleSubscription = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const {channelId} = req.params
        
        const userId = req.user._id
    
        if (!userId) {
            throw new ApiErrorHandler(400, "Unauthorized")
        }
    
        const existingSubscription = await Subscription.findOne(
            {
                subscriber: userId,
                channel: channelId
            }
        )
    
        if (existingSubscription) {
            
            const removeSubscription = await Subscription.findOneAndDelete(
                {
                    subscriber: userId,
                    channel: channelId
                }
            )
    
            return res.status(200)
                .json(
                    new ApiResponseHandler(
                        200,
                        removeSubscription,
                        "Unsubscribed Successfully to the channel.."
                    )
                )
    
        } else {
            const newSubscription = new Subscription(
                {
                    subscriber: userId,
                    channel: channelId
                }
            )
    
            const newSubscriber = await newSubscription.save()
            
            return res.status(200)
                .json(
                    200,
                    newSubscriber,
                    "Successfully Subscribed to the channel.."
                )
        }
    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const {channelId} = req.params
    
        // Find all subscribers for the channel 
        const subscribers = await Subscription.find({channel: channelId})
    
        if (!subscribers) {
            throw new ApiErrorHandler(500, "Something went wrong while getting subscribers.")
        }
    
        //Extract user id from subscription
        const subscriberUserIds =  subscribers.map(
            (subscription) => subscription.user
        )
    
        if (!subscriberUserId) {
            throw new ApiErrorHandler(400, "Unable to Extract user from subscription")
        }
    
        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    subscriberUserIds,
                    "Subscribers retrived successfully"
                )
            )
    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const { subscriberId } = req.params
    
        const subscriptions = await Subscription({user: subscriberId})
    
        const subscribedChannels = subscriptions.map(
            (subscriptions) => subscriptions.channel
        )
    
        return res.status(200)
            .json(
                200,
                subscribedChannels,
                "Subscribed channels retrived."
            )
    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}