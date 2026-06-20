export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

export const errorResponse = (res, message = 'Internal server error', statusCode = 500, stack = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        data: null,
        ...(stack && { stack })
    });
};