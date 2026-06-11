import type { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
const User = require('../models/User');
import type { IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser;
}

const Protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
            req.user = await User.findById(decoded.id).select('-password') as IUser;
            next();
            return;
        } catch (error) {
            console.error(error);
            res.status(401).json({ msg: 'Not authorized, token failed', sucess: false });
            return;
        }
    }
    if (!token) {
        res.status(401).json({ msg: 'Not authorized, no token', sucess: false });
        return;
    }
};

const Admin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Not authorized as admin', sucess: false });
        return;
    }
};

module.exports = { Protect, Admin };
