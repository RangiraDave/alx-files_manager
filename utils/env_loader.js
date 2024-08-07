/** 
 * @description This script is responsible for loading
 * the appropriate environment variables based on the event.
 * It checks the value of the `npm_lifecycle_event`
 * environment variable and determines the path of the
 * environment file to load.
 * If the file exists, it reads the contents, parses each line,
 * and sets the corresponding environment variable with its value.
 */

import { existsSync, readFileSync } from 'fs';

/**
 * Loads the appropriate environment variables for an event.
 */
const envLoader = () => {
  const env = process.env.npm_lifecycle_event || 'dev';
  const path = env.includes('test') || env.includes('cover') ? '.env.test' : '.env';

  if (existsSync(path)) {
    const data = readFileSync(path, 'utf-8').trim().split('\n');

    for (const line of data) {
      const delimPosition = line.indexOf('=');
      const variable = line.substring(0, delimPosition);
      const value = line.substring(delimPosition + 1);
      process.env[variable] = value;
    }
  }
};

export default envLoader;
