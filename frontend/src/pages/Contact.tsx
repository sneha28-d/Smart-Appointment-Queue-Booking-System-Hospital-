
import { assets } from '../assets/assets';
import Button from '../components/Button';

const Contact = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 animate-fade-in">
      
      <div className="text-center text-3xl font-light mb-16">
        <h1 className="text-gray-900 border-b pb-4 max-w-max mx-auto border-gray-200">
          Contact <span className="font-semibold text-blue-600">Us</span>
        </h1>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-16 md:gap-24 text-gray-600 items-center">
        <img 
          className="w-full md:max-w-[420px] rounded-3xl shadow-[0_10px_40px_-15px_rgba(37,99,235,0.2)] hover:-translate-y-2 transition duration-500" 
          src={assets.about_image} 
          alt="Contact Us" 
        />
        
        <div className="flex flex-col justify-center items-start gap-8 bg-white md:p-8 rounded-3xl">
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-4 tracking-wide uppercase">Our Office</h2>
            <p className="text-lg font-light text-gray-500">21 MG Road</p>
            <p className="text-lg font-light text-gray-500">2nd Floor, Bengaluru, Karnataka 560001</p>
          </div>
          
          <div>
            <p className="text-lg font-light text-gray-500">Tel: +91 80 4123 5678</p>
            <p className="text-lg font-light text-gray-500">Email: dev@docqueue.in</p>
          </div>
          
          <div className="mt-4 pt-8 border-t border-gray-100">
            <h2 className="font-bold text-xl text-gray-900 mb-4 tracking-wide uppercase">Careers at Docqueue</h2>
            <p className="text-lg mb-6 max-w-sm font-light text-gray-500">Learn more about our teams and job openings.</p>
            <Button variant="secondary" className="px-8 py-3 outline-none border border-black text-black hover:bg-black hover:text-white transition-all duration-300 font-medium tracking-wide">
              Explore Jobs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
