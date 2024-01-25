import mongoose from 'mongoose';

import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';
import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';
import { Playlist } from '../models/playlist.models.js';


const createPlaylist = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const {name, description} = req.body

        if ([name, description].some((field)=> field?.trim() === "")) {
            throw new ApiErrorHandler(400, "Name and Description both fields are required to create a playlist.")
        }

        const playlist = await Playlist.create({name, description})
        
        if (!playlist) {
            throw new ApiErrorHandler(400, "Unable to create playlist.")
        }

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    playlist,
                    "Playlist created successfully, now try adding videos to the playlist."
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }

})

const getUserPlaylists = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const {userId} = req.params
        
        if (!userId) {
            throw new ApiErrorHandler(400, "Invalid Request")
        }

        const userPlaylist = await Playlist.find({userId})

        if (!userPlaylist) {
            throw new ApiErrorHandler(400, "Unable to find user playlist")
        }

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    updatePlaylist,
                    "Enjoy your playlist"
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

const getPlaylistById = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const {playlistId} = req.params

        if (!playlistId) {
            throw new ApiErrorHandler(400, "Invalid request")
        }

        const playlist = Playlist.findById(playlistId)

        if (!playlist) {
            throw new ApiErrorHandler(404, "Playlist not found")
        }

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    playlist,
                    "Enjoy your playlist."
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

const addVideoToPlaylist = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const {playlistId, videoId} = req.params

        if (!playlistId && !videoId) {
            throw new ApiErrorHandler(400, "Invalid Request")
        }

        const playlist = await Playlist.findById(playlistId)

        if (!playlist) {
            throw new ApiErrorHandler(404, "Playlist not found")
        }

        if (playlist.videos.includes(videoId)) {
            throw new ApiErrorHandler(400, "Video is already there.")
        }

        playlist.videos.push(videoId);

        const updatedPlaylist = playlist.save()

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200, 
                    updatedPlaylist,
                    "Video has been added to your playlist."
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

const removeVideoFromPlaylist = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const {playlistId, videoId} = req.params

        if (!playlistId && !videoId) {
            throw new ApiErrorHandler(400, "Invalid request")
        }

        const playlist = Playlist.findByIdAndDelete(playlistId)

        if (!playlist) {
            throw new ApiErrorHandler(404, "Playlist not found")
        }

        const videoIndex = playlist.videos.indexOf(videoId)

        if (videoIndex === -1) {
            throw new ApiErrorHandler(404, "Video not found in playlist")
        }

        playlist.videos.splice(videoIndex, 1)

        const updatedPlaylist = await playlist.save()

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    updatedPlaylist,
                    "Video has been removed from the playlist."
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }

})

const deletePlaylist = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const {playlistId} = req.params

        if (!playlistId) {
            throw new ApiErrorHandler(400, "Invalid request")
        }

        const deletedPlaylist = Playlist.findByIdAndDelete(playlistId)

        if (!deletedPlaylist) {
            throw new ApiErrorHandler(400, "Playlist not found")
        }

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    {},
                    "Playlist deleted"
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

const updatePlaylist = asyncHandlerUsingPromise(async (req, res) => {
    try {
        const {playlistId} = req.params
        const {name, description} = req.body

        if (!playlistId) {
            throw new ApiErrorHandler(400, "Invalid request")
        }

        if ([name, description].some((field)=> field?.trim() === "")) {
            throw new ApiErrorHandler(400, "Name and Description is required")
        }

        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $set: {
                    name,
                    description
                }
            },
            {new: true}
        )

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200,
                    playlist,
                    "Playlist updated successfully."
                )
            )

    } catch (error) {
        throw new ApiErrorHandler(400, error.message)
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}