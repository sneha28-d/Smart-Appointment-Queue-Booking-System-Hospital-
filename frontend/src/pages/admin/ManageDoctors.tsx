import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import type { Doctor } from '../../types';
import { getImageUrl } from '../../utils/url';
import type { AxiosError } from 'axios';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    speciality: 'General physician',
    degree: '',
    experience: '1 Year',
    about: '',
    fees: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await adminService.getDoctors();
      setDoctors(data);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ msg: string }>;
      console.error('Fetch doctors error:', axiosErr);
      toast.error('Load docs failed: ' + (axiosErr.response?.data?.msg || axiosErr.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

    try {
      await adminService.deleteDoctor(doctorId);
      setDoctors(doctors.filter(doc => doc._id !== doctorId));
      toast.success('Doctor deleted successfully!');
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ msg: string }>;
      toast.error(axiosErr.response?.data?.msg || 'Failed to delete doctor');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please select an image for the doctor');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        uploadData.append(key, value);
      });
      uploadData.append('imageFile', imageFile);

      const newDoctor = await adminService.addDoctor(uploadData);
      setDoctors([...doctors, newDoctor]);
      toast.success('Doctor added successfully!');
      
      // Reset form
      setFormData({ name: '', email: '', speciality: 'General physician', degree: '', experience: '1 Year', about: '', fees: '' });
      setImageFile(null);
      setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ msg: string }>;
      toast.error(axiosErr.response?.data?.msg || 'Failed to add doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Manage Doctors</h1>
        <p className="text-slate-500 text-sm mt-1">Add and view doctors in the system</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Add Doctor Form */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 p-8 lg:col-span-1 h-max">
          <h2 className="font-bold text-slate-900 mb-6 text-lg">Add New Doctor</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <label htmlFor="doc-img" className="cursor-pointer relative group">
                <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${imagePreview ? 'border-blue-500 shadow-md' : 'border-slate-300 bg-slate-50 group-hover:bg-slate-100 group-hover:border-blue-400'}`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl text-slate-400 group-hover:text-blue-500 transition-colors">📷</span>
                  )}
                </div>
              </label>
              <input type="file" id="doc-img" accept="image/*" hidden ref={fileInputRef} onChange={handleImageChange} />
              <p className="text-xs text-slate-500">Tap to upload picture</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Dr. John Doe" className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="doctor@example.com" className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Speciality</label>
                <select name="speciality" value={formData.speciality} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-blue-500 bg-white">
                  <option value="General physician">General physician</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatricians">Pediatricians</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Gastroenterologist">Gastroenterologist</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
                <input type="text" name="degree" value={formData.degree} onChange={handleChange} required placeholder="MBBS" className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience</label>
                <select name="experience" value={formData.experience} onChange={handleChange} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-blue-500 bg-white">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(yr => (
                    <option value={`${yr} Year${yr > 1 ? 's' : ''}`} key={yr}>{yr} Year{yr > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fees (₨)</label>
                <input type="number" name="fees" value={formData.fees} onChange={handleChange} required min="500" max="2000" placeholder="500" className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">About</label>
              <textarea name="about" value={formData.about} onChange={handleChange} required placeholder="Brief description..." rows={3} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-blue-500 resize-none"></textarea>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 flex justify-center">
              {isSubmitting ? 'Adding...' : 'Add Doctor'}
            </button>
          </form>
        </div>

        {/* Existing Doctors */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {doctors.map(doc => (
                <div key={doc._id} className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform group">
                  <div className="w-20 h-20 rounded-full bg-blue-50 overflow-hidden border border-slate-100 flex-shrink-0">
                    <img src={getImageUrl(doc.image)} alt={doc.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-blue-600 text-xs font-semibold">{doc.speciality}</p>
                    <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">{doc.about}</p>
                  </div>
                  <div className="mt-auto pt-3 border-t w-full flex justify-between px-2">
                    <span className="text-xs font-bold text-slate-700">₨{doc.fees} Fee</span>
                    <span className="text-xs font-bold text-slate-700">{doc.experience}</span>
                  </div>
                  <div className="w-full flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteDoctor(doc._id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 font-semibold text-xs hover:bg-red-100 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
              {doctors.length === 0 && (
                <div className="col-span-full py-10 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-200">
                  No doctors added yet! Use the form to create one.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageDoctors;
