import type { Request, Response } from 'express';
const Doctor = require('../models/Doctor');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const DeleteImage = async (imageUrl: string) => {
    if (!imageUrl) return;
    try {
        if (imageUrl.includes('cloudinary.com')) {
            // Extract public_id from Cloudinary URL
            // Format: .../upload/v12345/folder/id.jpg
            const parts = imageUrl.split('/');
            const filenameWithExtension = parts.pop() || '';
            const folder = parts.pop() || '';
            const publicId = `${folder}/${filenameWithExtension.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
        } else if (imageUrl.startsWith('/uploads/')) {
            // Delete local file
            const localPath = path.join(__dirname, '../../', imageUrl);
            if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath);
            }
        }
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};

const AddDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, speciality, degree, experience, about, fees } = req.body;
        
        // Validate required fields
        if (!name || !email || !speciality || !degree || !experience || !about || !fees) {
            res.status(400).json({ msg: 'Missing required fields', success: false });
            return;
        }

        let image = '';
        if ((req as any).file) {
            // multer-storage-cloudinary stores the secure URL in the path property
            image = (req as any).file.path || (req as any).file.secure_url || '';
            if (!image) {
                console.error('No image path from upload:', (req as any).file);
                res.status(400).json({ msg: 'Image upload failed', success: false });
                return;
            }
        } else {
            res.status(400).json({ msg: 'Image file is required', success: false });
            return;
        }

        const doctor = await Doctor.create({
            name,
            email,
            speciality,
            degree,
            experience,
            about,
            fees: Number(fees),
            image
        });
        res.status(201).json({ msg: 'Doctor added successfully', success: true, data: doctor });
    } catch (error: any) {
        console.error('Error adding doctor:', error);
        // Handle duplicate email error
        if (error.code === 11000) {
            res.status(409).json({ msg: 'Email already exists', success: false, error: 'Duplicate email' });
        } else {
            res.status(500).json({ msg: 'Server Error adding doctor', success: false, error: error.message });
        }
    }
};

const GetDoctors = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctors = await Doctor.find({});
        res.status(200).json({ msg: 'Successfully fetched doctors', success: true, data: doctors });
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error fetching doctors', success: false, error: error.message });
    }
};

const GetDoctorById = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctor = await Doctor.findById(req.params['id']);
        if (doctor) {
            res.status(200).json({ msg: 'Doctor fetched successfully', success: true, data: doctor });
        } else {
            res.status(404).json({ msg: 'Doctor not found', success: false });
        }
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error fetching doctor', success: false, error: error.message });
    }
};

const UpdateDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, speciality, degree, experience, about, fees } = req.body;
        const doctor = await Doctor.findById(req.params['id']);
        if (doctor) {
            doctor.name = name || doctor.name;
            doctor.email = email || doctor.email;
            doctor.speciality = speciality || doctor.speciality;
            doctor.degree = degree || doctor.degree;
            doctor.experience = experience || doctor.experience;
            doctor.about = about || doctor.about;
            doctor.fees = fees ? Number(fees) : doctor.fees;
            if ((req as any).file) {
                if (doctor.image) await DeleteImage(doctor.image);
                doctor.image = (req as any).file.path || (req as any).file.secure_url || '';
            }
            const updatedDoctor = await doctor.save();
            res.status(200).json({ msg: 'Doctor updated successfully', success: true, data: updatedDoctor });
        } else {
            res.status(404).json({ msg: 'Doctor not found', success: false });
        }
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error updating doctor', success: false, error: error.message });
    }
};

const DeleteDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctor = await Doctor.findById(req.params['id']);
        if (doctor) {
            if (doctor.image) await DeleteImage(doctor.image);
            await doctor.deleteOne();
            res.status(200).json({ msg: 'Doctor deleted successfully', success: true });
        } else {
            res.status(404).json({ msg: 'Doctor not found', success: false });
        }
    } catch (error: any) {
        res.status(500).json({ msg: 'Server Error deleting doctor', success: false, error: error.message });
    }
};

module.exports = { AddDoctor, GetDoctors, GetDoctorById, UpdateDoctor, DeleteDoctor };
