import axios from 'axios';

const BACKEND_APP_URL = 'http://192.168.6.30:3000/';


const jwtAuthAxios = axios.create({
  baseURL: BACKEND_APP_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default jwtAuthAxios;