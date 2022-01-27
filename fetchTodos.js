const BASE_URL = 'http://localhost:8000';

export const callAPI = async (endpoint, options) => {
  try {
    const data = await fetch(`${BASE_URL}${endpoint}`, options);
    if (data.ok) {
      return await data.json();
    }
  } catch (error) {
    throw error;
  }
};
