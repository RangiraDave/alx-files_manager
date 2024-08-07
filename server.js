/**
 * This file exports an Express server instance.
 * The server is configured with middlewares, routes,
 * and starts listening on a specified port.
 * @module server
 */

import express from 'express';
import startServer from './libs/boot';
import injectRoutes from './routes';
import injectMiddlewares from './libs/middlewares';

const server = express();

injectMiddlewares(server);
injectRoutes(server);
startServer(server);

export default server;