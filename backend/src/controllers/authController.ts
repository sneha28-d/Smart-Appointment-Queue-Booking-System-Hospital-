import type { Request, Response } from 'express';
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { GenerateToken } = require('../utils/generateToken');
const { SendWelcomeEmail, SendLoginNotificationEmail } = require('../services/notificationService');

const Register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, role } = req.body;
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        if (req.body.name) {
            const parts = req.body.name.trim().split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ') || 'User';
        }
        const phoneNumber = req.body.phoneNumber || req.body.phone;
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ msg: 'User already exists', sucess: false });
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber,
            role: role || 'customer'
        });
        if (user) {
            SendWelcomeEmail(user.email, user.firstName)
                .catch((err: any) => console.error('Error sending welcome email:', err));
            res.status(201).json({
                msg: 'Sucessfull',
                sucess: true,
                data: {
                    _id: user.id,
                    name: `${user.firstName} ${user.lastName}`.trim(),
                    email: user.email,
                    phone: user.phoneNumber,
                    role: user.role,
                    token: GenerateToken(user.id, user.role),
                }
            });
        } else {
            res.status(400).json({ msg: 'Invalid user data', sucess: false });
        }
    } catch (error: any) {
        console.error('Registration Error:', error);
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const Login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && user.password && (await bcrypt.compare(password, user.password))) {
            SendLoginNotificationEmail(user.email, user.firstName)
                .catch((err: any) => console.error('Error sending login notification email:', err));
            res.status(200).json({
                msg: 'Sucessfull',
                sucess: true,
                data: {
                    _id: user.id,
                    name: `${user.firstName} ${user.lastName}`.trim(),
                    email: user.email,
                    phone: user.phoneNumber,
                    role: user.role,
                    token: GenerateToken(user.id, user.role),
                }
            });
        } else {
            res.status(400).json({ msg: 'Invalid email or password', sucess: false });
        }
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const GetProfile = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.status(200).json({
                msg: 'Sucessfull',
                sucess: true,
                data: {
                    _id: user.id,
                    name: `${user.firstName} ${user.lastName}`.trim(),
                    email: user.email,
                    phone: user.phoneNumber,
                    role: user.role,
                }
            });
        } else {
            res.status(404).json({ msg: 'User not found', sucess: false });
        }
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

const UpdateProfile = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            if (req.body.name) {
                const parts = req.body.name.trim().split(' ');
                user.firstName = parts[0] || user.firstName;
                user.lastName = parts.slice(1).join(' ') || user.lastName;
            }
            user.email = req.body.email || user.email;
            user.phoneNumber = req.body.phone || user.phoneNumber;
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }
            const updatedUser = await user.save();
            res.status(200).json({
                msg: 'Sucessfull',
                sucess: true,
                data: {
                    _id: updatedUser.id,
                    name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
                    email: updatedUser.email,
                    phone: updatedUser.phoneNumber,
                    role: updatedUser.role,
                    token: GenerateToken(updatedUser.id, updatedUser.role),
                }
            });
        } else {
            res.status(404).json({ msg: 'User not found', sucess: false });
        }
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error', sucess: false, error: error.message });
    }
};

module.exports = { Register, Login, GetProfile, UpdateProfile };
