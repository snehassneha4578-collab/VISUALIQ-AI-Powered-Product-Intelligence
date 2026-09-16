import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const uploadProduct = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("product", file);

  const response = await axios.post(
    API_URL + "/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: (event) => {
        if (event.total) {
          const progress = Math.round((event.loaded * 100) / event.total);
          if (onProgress) onProgress(progress);
        }
      }
    }
  );

  return response.data;
};
