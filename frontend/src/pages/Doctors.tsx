import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { specialityData } from '../assets/assets';
import DoctorCard from '../components/DoctorCard';
import { doctorService } from '../services/doctorService';
import type { Doctor } from '../types';

const Doctors = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('All');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorService.getDoctors().then(data => {
      setDoctors(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredDoctors = filter === 'All' ? doctors : doctors.filter(doc => doc.speciality === filter);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10">
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Specialities</h2>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setFilter('All')} 
              className={`text-left px-4 py-2 rounded-lg transition-colors border ${filter === 'All' ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              All Doctors
            </button>
            {specialityData.map((spec, idx) => (
              <button 
                key={idx}
                onClick={() => setFilter(spec.speciality)}
                className={`text-left px-4 py-2 rounded-lg transition-colors border flex items-center gap-3 ${filter === spec.speciality ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <img src={spec.image} alt={spec.speciality} className="w-6 h-6 object-contain" />
                {spec.speciality}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-end border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">{filter === 'All' ? 'All Doctors' : filter}</h1>
            <p className="text-gray-500 text-sm">{loading ? 'Loading...' : `${filteredDoctors.length} results found`}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDoctors.map(doc => (
              <DoctorCard 
                key={doc._id} 
                doctor={doc} 
                onClick={() => navigate(`/booking/${doc._id}`)} 
              />
            ))}
          </div>
          
          {!loading && filteredDoctors.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              No doctors found matching "{filter}".
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default Doctors;
