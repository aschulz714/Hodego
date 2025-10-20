// apiService.ts
import axiosInstance from './axiosInstance';

export const getData = async (url: any) => {
  try {
    const response = await axiosInstance.get(url);
    return response;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const deleteData = async (url: any) => {
  try {
    const response = await axiosInstance.delete(url);
    return response;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const postData = async (data: any,url: any) => {
  try {
    const response = await axiosInstance.post(url, data);
    return response;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};

export const putData = async (data: any,url: any) => {
  try {
    const response = await axiosInstance.put(url, data);
    return response;
  } catch (error) {
    console.error('Error putdata:', error);
    throw error;
  }
};

// Other API service functions...
