import aboutImg from './about_image.png';
import doc2Img from './healthcare-workers-preventing-virus-quarantine-campaign-concept-cheerful-friendly-asian-female-physician-doctor-with-clipboard-daily-checkup-standing-white-background.jpg';


export const assets = {
    about_image: aboutImg,
};

export const specialityData = [
    {
        speciality: 'General physician',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBqAdowc5xHIgbdAWLhyBMdeG85U98uNxlnQ&s'
    },
    {
        speciality: 'Gynecologist',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL7fv4VE-iciSOoZSf-Bh58xPKBdWDf7YKIA&s'
    },
    {
        speciality: 'Dermatologist',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeVNghdbppiP20DJfcWkMrpwNCMgYDfdHR0A&s'
    },
    {
        speciality: 'Pediatricians',
        image: 'https://st.depositphotos.com/3356953/4654/v/450/depositphotos_46548737-stock-illustration-pediatric-hospital-symbol.jpg'
    },
    {
        speciality: 'Neurologist',
        image: 'https://cdn-icons-png.flaticon.com/512/3063/3063162.png'
    }
];

export const doctors = [
    {
        _id: 'doc1',
        name: 'Dr. Richard James',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. James has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 700,
        address: { line1: '17th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        _id: 'doc2',
        name: 'Dr. Emily Larson',
        image: doc2Img,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Larson has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 800,
        address: { line1: '27th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        _id: 'doc3',
        name: 'Dr. Sarah Patel',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Patel has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 600,
        address: { line1: '37th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        _id: 'doc4',
        name: 'Dr. Christopher Lee',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
        speciality: 'Pediatricians',
        degree: 'MBBS',
        experience: '2 Years',
        about: 'Dr. Lee has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 650,
        address: { line1: '47th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    }
];
