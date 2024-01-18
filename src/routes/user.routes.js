import {Router} from 'express';
import { changeCurrentPassword, getCurrentUser, getUserChannelProfileDetails, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserAvatar, updateUserCoverImage, updateUserDetails } from '../controllers/user.controllers.js';
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router()

// user register route
router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

// user login route
router.route('/login').post(loginUser);

// secured routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/profile-details").get(verifyJWT, getCurrentUser);
router.route("/update-profile-details").patch(verifyJWT, updateUserDetails);

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/channel/?:username").get(verifyJWT, getUserChannelProfileDetails);
router.route("/watch-hostory").get(verifyJWT, getWatchHistory);
// router.route("/delete-user").post(deleteUser);

export default router;