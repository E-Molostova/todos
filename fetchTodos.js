const BASE_URL = 'http://localhost:8000';

const parseQuery = options => {
  if (options && options.query) {
    let mainEndpoint = '/todos';
    const { query } = options;
    const queryParams = Object.entries(query).map(([key, value]) => {
      return `${key}=${value}`;
    });
    const queryStr = [...queryParams].join('&');

    let endpointWithQuery = `${mainEndpoint}?${queryStr}`;
    return endpointWithQuery;
  }
};

export const callAPI = async (endpoint, options) => {
  try {
    const endpointWithQuery = parseQuery(options);
    let data;
    if (endpointWithQuery) {
      data = await fetch(`${BASE_URL}${endpointWithQuery}`, options);
    } else {
      data = await fetch(`${BASE_URL}${endpoint}`, options);
    }
    if (data.ok) {
      return await data.json();
    }
  } catch (error) {
    throw error.message;
  }
};
