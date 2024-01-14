import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';

import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
 

// generate Refresh and Access Tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiErrorHandler(500, "Something went wrong while generating access and refresh tokens")
    }
}

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
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiErrorHandler(409, "User with username or email already exists.")
    }
    
    //  check for user-avatar || cover-image
    const avatarLocalPath = req.files?.avatar[0]?.path
    // console.log(req.files);
    if (!avatarLocalPath) {
        throw new ApiErrorHandler(400, "Avatar is required to register.")
    } 
    //const coverImageLocalPath = req.files?.coverImage[0]?.path
    //else if(!coverImageLocalPath) {
    //     throw new ApiErrorHandler("Are you sure? You want to continue without cover image.")
    // }
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
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
});


// User controller for login
const loginUser = asyncHandlerUsingPromise( async (req, res) => {
    
    // get the data from req.body
    const {username, email, password} = req.body;
    
    // check for the username or email
    if (!username || !email) {
        throw new ApiErrorHandler(400, "Username or Email is required to login!")
    }
   
    // find the user by username or email
    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if (!user) {
        throw new ApiErrorHandler(404, "User does not exist. Please register first.")
    }
    
    // check password for the user
    const isPasswordValid = user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiErrorHandler(401, "Invalid user credentials!")
    }
    
    // generate refresh and access token for the user
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // send the refresh and access token via cookie
    const options = {
        httpOnly: true,
        secure: true
    }

    // send response
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponseHandler(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User Logged In Successfully."
            )
        )
})

export {registerUser, loginUser}
