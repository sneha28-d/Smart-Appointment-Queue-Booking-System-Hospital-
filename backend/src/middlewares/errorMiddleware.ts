import type { Request, Response, NextFunction } from 'express';

const NotFound = (req: Request, res: Response, next: NextFunction): void => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const ErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        msg: err.message,
        sucess: false,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { NotFound, ErrorHandler };
