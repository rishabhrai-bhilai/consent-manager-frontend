import axios from 'axios';

export default axios.create({
    // baseURL: 'http://localhost:4000'


    //Moblie
    baseURL: 'http://192.168.0.107:4000', // Use your network IP here
    withCredentials: true // Include this to send credentials with every request
});