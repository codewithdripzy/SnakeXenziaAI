"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noRouteFound = exports.defaulFallback = exports.verifyAPI = void 0;
const values_1 = require("../core/constants/values");
const verifyAPI = (req, res, next) => {
    try {
        const { version } = req.params;
        if (version === '1') {
            next();
        }
        else {
            res.status(values_1.HTTP_RESPONSE_CODE.BAD_REQUEST).json({
                message: 'Invalid API version. Refer to the documentation for proper implementation.'
            });
        }
    }
    catch (error) {
        res.status(values_1.HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR).json({
            message: 'An error occurred while processing your request. Please try again later.'
        });
    }
};
exports.verifyAPI = verifyAPI;
const defaulFallback = (req, res) => {
    res.status(values_1.HTTP_RESPONSE_CODE.OK).json({
        message: 'Welcome to Snake Xenzia API v1 🚀🎉. Please refer to the documentation for proper implementation.'
    });
};
exports.defaulFallback = defaulFallback;
const noRouteFound = (req, res) => {
    res.status(values_1.HTTP_RESPONSE_CODE.NOT_FOUND).json({
        message: 'The endpoint you are trying to access does not exist. Refer to the documentation for proper implementation.'
    });
};
exports.noRouteFound = noRouteFound;
