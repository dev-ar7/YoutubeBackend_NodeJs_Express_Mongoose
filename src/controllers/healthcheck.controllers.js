import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';
import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';


const apiHealthcheck = asyncHandlerUsingPromise(
    async (req, res) => {
        try {
            if (req) {
                return res.status(200)
                    .json(
                        new ApiResponseHandler(
                            200,
                            "OK"
                        )
                    )
            }
        } catch (error) {
            throw new ApiErrorHandler(400, error.message)
        }
    }
)

export {
    apiHealthcheck
}
    