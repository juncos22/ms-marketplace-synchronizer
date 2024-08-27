import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
require('dotenv').config();

require('../database/db/db');
// require('')
import compression from 'compression';

import cors from 'cors';
import connectToDatabase from '../database/db/connectDB';
connectToDatabase();

export default (routes: any) => {
  process.on('uncaughtException', function (err) {
    console.log('uncaughtException', {
      error: { message: err.message, stack: err.stack },
    });
    process.exit(1);
  });
  const app: Application = express();

  if (process.env.DEPLOY != 'true') {
    const corsOptions = {
      origin: '*',
      credentials: true, //access-control-allow-credentials:true
      optionSuccessStatus: 200,
    };
    app.use(cors(corsOptions));
  }

  app.use(morgan('dev'));
  app.use(compression({ filter: () => true }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));

  //application routes
  app.use('/', routes.allRoutes);

  //404 error
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(404).json({
      succes: false,
      response: null,
      error: err.message || err || null,
      stack: err.stack || null,
    });
  });

  //500 error
  app.use(function (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) {
    res.status(500).json({
      succes: false,
      response: null,
      error: err.message || null,
      stack: err.stack || null,
    });
  });

  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '0.0.0.0';

  app.set('port', PORT);
  app.set('host', HOST);

  //load server
  app.listen(PORT, () => {
    console.log(process.env.NAME_APP + ' listening at ' + PORT);
  });
  return app;
};
