import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import heroImage from "../assets/image copy.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-20 pb-32 px-6 md:px-16 overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-100/50 blur-3xl"></div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 font-semibold text-sm rounded-full mb-6">
              🩺 Smart Queue System
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Skip the waiting room. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Book instantly.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Find trusted doctors, book your slot online, and track your live queue position right from your phone.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Button onClick={() => navigate('/doctors')} className="w-full sm:w-auto text-lg px-8 py-4 shadow-lg shadow-blue-600/30 rounded-xl hover:-translate-y-1 transition-transform">
                Find a Doctor
              </Button>
              <Button onClick={() => navigate('/about')} variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4 rounded-xl border-2 hover:bg-gray-50">
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex-1 w-full max-w-md relative">
            <img 
              src={heroImage} 
              alt="Doctor Appointment" 
              className="relative rounded-[3rem] shadow-2xl object-cover h-[500px] w-full border-4 border-white"
            />
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Real-time</p>
                <p className="font-bold text-gray-900">Queue Tracking</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why choose DocQueue?</h2>
            <p className="text-gray-600 text-lg">We provide a seamless experience from finding the right doctor to walking into the clinic exactly when it's your turn.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:bg-blue-50/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Booking</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse through specialist doctors, check their availability, and book your appointment in just three clicks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:bg-blue-50/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Queue Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                No more sitting in crowded waiting rooms. See exactly how many patients are ahead of you in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:bg-blue-50/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Digital Check-in</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive a unique QR code for your appointment. Simply scan it at the clinic desk to instantly join the queue.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-16 pb-24">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          {/* Background Patterns */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mt-20 -mr-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -mb-10 -ml-10"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to take control of your health?
            </h2>
            <p className="text-blue-100 text-lg mb-10">
              Join thousands of patients who are already using DocQueue to save time and skip the waiting room.
            </p>
            <Button onClick={() => navigate('/doctors')} variant="white" className="text-lg px-10 py-4 rounded-xl shadow-lg hover:scale-105 transition-transform text-blue-700 font-bold">
              Book Your First Appointment
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;