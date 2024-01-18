import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';
import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';


const apiHealthcheck = asyncHandlerUsingPromise(
    async (req, res) => {
        //TODO: build a healthcheck response that simply returns the OK status as json with a message
    }
)

export {
    healthcheck
}
    