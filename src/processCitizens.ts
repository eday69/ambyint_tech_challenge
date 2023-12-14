import { getPlanets, ICitizen, IPlanet } from './api/swapi';
import * as fs from 'fs';
import { IDecryptApiResponse } from './api/decrypt';


const getPlanetId = (str: string): string | null => {
  if (!str) return null;
  const res = str.match(/\d/g);
  return res ? res.join('') : null;
}

const generateCitizensPerWorldsData = (
  planets: IPlanet[],
  uniqueCitizens: ICitizen[]
): { [key: string]: string[] } => {
  const citizensPerWorld: { [key: string]: string[] } = {}

  planets.map(planet => {
    const key = planet.name || planet.homeworld;
    const citizens = uniqueCitizens
      .filter(citizen => getPlanetId(citizen.url) === getPlanetId(planet.homeworld))
      .map(c => c.name);
    if (citizens.length) {
      citizensPerWorld[key] = citizens
    }
  });

  return citizensPerWorld;
}

export const generateCitizenFile = async (result: ICitizen[], file: string) => {
  // Remove duplicates !
  const mapCitizen = new Map(
    result.map((item: IDecryptApiResponse) => [item.name, item.homeworld])
  );
  const uniqueCitizens: ICitizen[] = Array
    .from(mapCitizen, ([name, url]) => ({ name, url }));

  // Fetch Homeworld planet names
  const planets = await getPlanets(uniqueCitizens);

  const citizensPerWorld = generateCitizensPerWorldsData(planets, uniqueCitizens);
  console.log('Generating data file');

  var stream = fs.createWriteStream(file);
  stream.once('open', function(fd) {
    const worlds = Object.keys(citizensPerWorld)
    worlds.forEach(world => {
      stream.write(`${world}\n`);
      citizensPerWorld[world].forEach(citizen => {
        stream.write(`- ${citizen}\n`);
      })
      stream.write('\n');
    })
    stream.end();
  });
}
