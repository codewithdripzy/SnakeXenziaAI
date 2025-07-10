import { NextFunction, Request, Response } from "express";
import { HTTP_RESPONSE_CODE } from "../core/constants/values";

const verifyAPI = (req : Request, res : Response, next : NextFunction) => {
    try {
        const { version } = req.params;

        if (version === '1') {
            next();
        } else {
            res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({
                message: 'Invalid API version. Refer to the documentation for proper implementation.'
            });
        }
    } catch (error) {
        res.status(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR).json({
            message : 'An error occurred while processing your request. Please try again later.'
        });
    }
}

const defaulFallback = (req : Request, res : Response) => {
    res.status(HTTP_RESPONSE_CODE.OK).json({
        message : 'Welcome to Snake Xenzia API v1 🚀🎉. Please refer to the documentation for proper implementation.'
    });
}

const noRouteFound = (req : Request, res : Response) => {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).json({
        message : 'The endpoint you are trying to access does not exist. Refer to the documentation for proper implementation.'
    });
}

export { verifyAPI, defaulFallback, noRouteFound }