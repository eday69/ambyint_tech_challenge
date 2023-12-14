import axios from 'axios';
import * as dotenv from 'dotenv';
import axiosRetry from 'axios-retry';
dotenv.config();

const decryptApi = axios.create({
  baseURL: 'https://txje3ik1cb.execute-api.us-east-1.amazonaws.com/prod',
  headers: {
    'x-api-key': process.env.DECRYPT_API_KEY,
  },
});

// Custom retry delay
axiosRetry(decryptApi, { retryDelay: (retryCount) => {
  return retryCount * 1000;
}});


// According to https://github.com/ambyint/tech-challenge/blob/master/full-stack/palpatines-api/README.md
// This is all the fields returned by decrypt api
export interface IDecryptApiResponse {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: Date;
  edited: Date;
  url: string;
};


// decrypt data
export const throttleDecryption = async (blocks: string[][]): Promise<IDecryptApiResponse[]> => {
  const CONCURRENT_PROMISES = 5;

  let countdown = blocks.length - 1;
  let results = []
  while (countdown >= 0) {
    let promises = []

    for (let i= 0; i < CONCURRENT_PROMISES; i++) {
      const block = blocks[countdown];

      console.log(`processing block ${countdown}`);

      promises.push(decryptData(block));
      countdown--;
      if (countdown <= 0) {
        break;
      }
    }
    Promise.all(promises).then((data) => {
      results.push(data)
    });

    // Need to pause between requests or we get a 429 (too many requests)
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  return results.flat(2);
}

const decryptData = async (payload: string[]): Promise<IDecryptApiResponse[]> => {
  try {
    const response = await decryptApi.post('/decrypt', payload);
    const data = response.data;
    return data.map((row: string) => JSON.parse(row));

  } catch (error) {
    return error;
  }
}
