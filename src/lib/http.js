import {Platform} from 'react-native';
import encodeurl from 'encodeurl';

//const developmentServer = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000'

const developmentServer = 'https://fotofacturas.com';
//const developmentServer = 'https://localhost:3000';
const productionServer = 'https://fotofacturas.com';
//const productionServer = 'http://localhost:3000'

//const API_URL = __DEV__ ? developmentServer : productionServer;
const API_URL = productionServer;

const fetchWithTimeout = (url, options, timeout = 3000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeout),
    ),
  ]);
};

exports.URL_FOR = endpoint => {
  return `${API_URL}${endpoint}`;
};

exports.GET = async endpoint => {
  let requestEndpoint = endpoint;

  console.log(`${API_URL}${requestEndpoint}`);

  let response = await fetch(`${API_URL}${requestEndpoint}`);

  if (!response.ok) {
    throw new Error(`HTTP_NOT_OK: ${await response.text()}`);
  }

  let json = response.json();

  return json;
};

exports.TIMEDGET = async (endpoint, timeout = 3000) => {
  let requestEndpoint = encodeurl(endpoint);

  let response = await fetchWithTimeout(
    `${API_URL}${requestEndpoint}`,
    undefined,
    timeout,
  );

  if (!response.ok) {
    throw new Error(`HTTP_NOT_OK: ${await response.text()}`);
  }

  let json = response.json();

  return json;
};

exports.POST = async (endpoint, postData) => {
  let url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    throw new Error(
      `HTTP_NOT_OK, ${url}, ${JSON.stringify(
        postData,
      )}, ${await response.text()}`,
    );
  }

  let json = response.json();

  return json;
};

exports.PUT = async (endpoint, putData) => {
  let url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(putData),
  });

  if (!response.ok) {
    throw new Error(
      `HTTP_NOT_OK, ${url}, ${JSON.stringify(
        putData,
      )}, ${await response.text()}`,
    );
  }

  const json = await response.json();

  return json;
};

exports.DELETE = async (endpoint, postData) => {
  let url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    throw new Error(
      `HTTP_NOT_OK, ${url}, ${JSON.stringify(
        postData,
      )}, ${await response.text()}`,
    );
  }

  let json = response.json();

  return json;
};
