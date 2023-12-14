import axios from 'axios';
const apiUrl = "https://swapi.dev/api/planets";

// This is all the fields returned by swapi's https://swapi.dev/api/planets/XX call
interface IPlanetResponse {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents: string[];
  films: string[];
  created: Date;
  edited: Date;
  url: string;
}

export interface IPlanet {
  name: string | null;
  homeworld: string;
}

export interface ICitizen {
  name: string | null;
  url: string;
}

export const fetchPlanets = async (): Promise<IPlanetResponse[]> => {
  let planets: IPlanetResponse[] = [];
  let page = 1;
  let nextPage = true;

  while (nextPage) {
    const response = await axios.get(apiUrl, {
      params: {
        page,
      },
    });
    planets = planets.concat(response.data.results);

    // response.data.next points to next page or null
    if (response.data.next) {
      page += 1;
    } else {
      nextPage = false;
    }
  }

  return planets;
};

export const getPlanets = async (citizens: ICitizen[]): Promise<IPlanet[]> => {
  try {
    console.log('Fetching planet data');
    const allPlanets: IPlanetResponse[] = await fetchPlanets();
    return allPlanets
      .map((data: IPlanetResponse): IPlanet => ({ name: data.name, homeworld: data.url }));

  } catch (e) {
    // In case we cannot fetch Swapi data, return homewolrd url's
    return Array
      .from(new Set(citizens.map(citizen => citizen.url)))
      .map(url => ({ name: null, homeworld: url }))
  }
}
