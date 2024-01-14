import jwt from 'jsonwebtoken';

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

    if(!username && !email) {
        throw new ApiErrorHandler(400, "Username or Email is required to login!")
    }

    // Alternative approach of above code.
    // if (!(username || email)) {
    //     throw new ApiErrorHandler(400, "Username or Email is required to login!")
    // }
   
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
});


// User controller for LogOut
const logoutUser = asyncHandlerUsingPromise(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiErrorHandler(200, {}, "User Logged Out Successfully...")
        )
});


// Regenerating token after expires
const refreshAccessToken = asyncHandlerUsingPromise(
    async(req, res) => {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        
        if(!incomingRefreshToken) {
            throw new ApiErrorHandler(401, "Unauthorized Request")
        }

        try {
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )
    
            const user = await User.findById(decodedToken?._id)
    
            if(!user) {
                throw new ApiErrorHandler(401, "Invalid Refresh Token")
            }
    
            if(incomingRefreshToken !== user?.refreshToken) {
                throw new ApiErrorHandler(401, "Refresh token is expired or invalid")
            }
    
            const options = {
                httpOnly: true,
                secure: true
            }
    
            const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
            
            return res.status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json(
                    new ApiResponseHandler(
                        200,
                        {accessToken, newRefreshToken},
                        "Access token refreshed"
                    )
                ) 
        } catch (error) {
            throw new ApiErrorHandler(401, error?.message || "Invalid refresh token")
        }
    }
    
);


// Change Password
const changeCurrentPassword = asyncHandlerUsingPromise(
    async(req, res) => {
        const {oldPassword, newPassword, confirmPassord} = req.body

        if(!(newPassword === confirmPassord)) {
            throw new ApiErrorHandler(400, "Your new password and confirm password doesn't match. Try again!")
        }

        const user = User.findById(req.user?._id)
        const isPasswordValid = await user.isPasswordCorrect(oldPassword)

        if(!isPasswordValid) {
            throw new ApiErrorHandler(400, "Invalid old password!")
        }

        user.password = newPassword
        await user.save({validateBeforeSave: false})

        return res.status(200)
            .json(
                new ApiResponseHandler(200, {}, "Password changed successfully.")
            )
    }
);

// Get current user
const getCurrentUser = asyncHandlerUsingPromise(
    async (req, res) => {
        return res.status(200)
            .json(
                200,
                req.user,
                "Current user fetced successfully."
            )
    }
);

// Update user details
const updateUserDetails = asyncHandlerUsingPromise(
    async(req, res) => {
        const { email, fullName } = req.body

        if(!fullName || !email) {
            throw new ApiErrorHandler(400, "All fields are required")
        }

        const user = User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    fullName,
                    email
                }
            },
            {new: true}
        ).select("-password -refreshToken")

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200, 
                    user,
                    "Account details updated successfully."
                )
            )
        
    }
);

// Update user avatar
const updateUserAvatar = asyncHandlerUsingPromise(
    async (req, res) => {
        const avatarLocalPath = req.file?.path

        if(!avatarLocalPath) {
            throw new ApiErrorHandler(400, "Avatar file is missing.")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);

        if(!avatar.url) {
            throw new ApiErrorHandler(400, "Error while uploading avatar.")
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: avatar.url
                }
            },
            {new: true}
        ).select("-password")

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200, user, "Avatar Updated Successfully."
                )
            )
    }
);

// Update user cover image
const updateUserCoverImage = asyncHandlerUsingPromise(
    async (req, res) => {
        const coverImageLocalPath = req.file?.path

        if(!coverImageLocalPath) {
            throw new ApiErrorHandler(400, "Cover Image file is missing")
        }

        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!coverImage.url) {
            throw new ApiErrorHandler(400, "Error while uploading cover image")
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    coverImage: coverImage.url
                }
            },
            {new: true}
        ).select("-password")

        return res.status(200)
            .json(
                new ApiResponseHandler(
                    200, user, "CoverImage Updated Successfully."
                )
            )
    }
)

export {
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage
}
