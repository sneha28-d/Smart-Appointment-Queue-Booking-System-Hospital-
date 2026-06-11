
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div className="font-sans antialiased text-gray-800 bg-white selection:bg-blue-100 pb-20">
      
      {/* Header */}
      <div className="pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 border-b pb-4 max-w-max mx-auto border-gray-200">
          About <span className="font-semibold text-blue-600">Us</span>
        </h1>
        <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-lg px-4 font-light">
          Redefining healthcare scheduling with elegance and intelligence.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-8 mb-24 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Image Section */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition duration-1000"></div>
            <img 
              className="relative w-full max-w-[480px] rounded-2xl shadow-xl hover:-translate-y-2 transition-transform duration-500 bg-white p-2 border border-gray-50" 
              src={assets.about_image} 
              alt="Medical Team" 
            />
          </div>
        </div>

        {/* Text Section */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-8">
          <div className="space-y-6 text-gray-600 text-lg font-light leading-relaxed">
            <p>
              Welcome to <strong className="font-medium text-gray-900">DocQueue</strong>, the premium framework for your healthcare scheduling. We exist to close the gap between healthcare experts and the individuals seeking their care, offering a seamless, beautiful user experience.
            </p>
            <p>
              Navigating clinical queues shouldn't feel archaic. Our digital-first approach ensures effortless booking, active real-time status tracking, and the peace of mind knowing you will be seen exactly when you expect to be seen.
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">Our Vision</h3>
            <p className="text-gray-600 text-lg font-light leading-relaxed">
              We envision a world where managing personal health is intuitive. By integrating advanced scheduling technology, we bring time back to both patients and doctors.
            </p>
          </div>
        </div>

      </div>

      {/* Why Choose Us */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <h2 className="inline-block text-3xl font-light tracking-tight text-gray-900 border-b pb-3 border-gray-200">
            Why Choose <span className="font-semibold text-blue-600">Us</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="flex flex-col bg-gray-50/50 backdrop-blur-sm border border-gray-100 px-10 py-14 rounded-3xl hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] hover:border-blue-100 transition-all duration-500 group">
            <div className="h-12 w-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 tracking-wide group-hover:text-blue-600 transition-colors">Efficiency</h3>
            <p className="text-gray-500 font-light leading-relaxed">
              Streamlined appointment scheduling seamlessly woven into your busy lifestyle. Time managed flawlessly.
            </p>
          </div>

          <div className="flex flex-col bg-gray-50/50 backdrop-blur-sm border border-gray-100 px-10 py-14 rounded-3xl hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] hover:border-blue-100 transition-all duration-500 group">
            <div className="h-12 w-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 tracking-wide group-hover:text-blue-600 transition-colors">Convenience</h3>
            <p className="text-gray-500 font-light leading-relaxed">
              Immediate access to a vast network of top-rated healthcare professionals right within your area.
            </p>
          </div>

          <div className="flex flex-col bg-gray-50/50 backdrop-blur-sm border border-gray-100 px-10 py-14 rounded-3xl hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] hover:border-blue-100 transition-all duration-500 group">
            <div className="h-12 w-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 tracking-wide group-hover:text-blue-600 transition-colors">Personalization</h3>
            <p className="text-gray-500 font-light leading-relaxed">
              Curated care tailored entirely around you. Smart recommendations keeping your health reliably on track.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;
