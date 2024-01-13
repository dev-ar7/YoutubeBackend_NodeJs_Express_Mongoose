import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';

import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
 
// User Controller for regster
const registerUser = asyncHandlerUsingPromise( async (req, res) => {
    // getuser details from userUI
    const {username, email, fullName, password} = req.body
    console.log("username", username);
    console.log("email", email);
    console.log("fullName", fullName);
    console.log("password", password);
    // user-input validation
    if (
        [username, email, fullName, password].some((field) => 
        field?.trim() === "")
    ) {
        throw new ApiErrorHandler(400, "All fields are required to register!")
    }
    // user is already there
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiErrorHandler(409, "User with username or email already exists.")
    }
    //  check for user-avatar || cover-image
    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log(req.files);
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if (!avatarLocalPath) {
        throw new ApiErrorHandler(400, "Avatar is required to register.")
    } else if(!coverImageLocalPath) {
        throw new ApiErrorHandler("Are you sure? You want to continue without cover image.")
    }
    // upload to cloudinary || confirm for avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiErrorHandler(400, "Avatar is required to register.");
    }
    // create user object  - create entry in mongoDB
    const createdUser = await User.create({
        username: username,
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password
    })
    // check for user creation
    const userFromDBbyId = await User.findById(createdUser._id).select(
        "-password -refreshToken"
    )
    // remove password and refreshToken fro mresponse
    if (!userFromDBbyId) {
        throw new ApiErrorHandler(500, "Something went wrong while registering the user")
    }
    // if user created, return response
    return res.status(201).json(
        new ApiResponseHandler(201, userFromDBbyId, "User registered successfully.")
    )
})

export {registerUser}