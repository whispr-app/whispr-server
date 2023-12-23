// Imports
import express, { Router } from 'express';
import expressWs from 'express-ws';
import { NextFunction, Request, Response } from 'express';
import bodyparser from 'body-parser';
import cors from 'cors';
import responseTime from 'response-time';
import { port, domain, version } from '@lib/argvHandler';
import { errorHandler, handleRouting } from './middleware';

// Environment
const env = process.env.TS_NODE_DEV ? 'dev' : 'prod';

// Exceptions
import { DomainNotSpecified, NotValidVersion } from './exceptions';

// Argument values
if (!domain && env === 'prod') throw new DomainNotSpecified();
if (!version || (version && !version.match(/^(\d+\.)?(\d+\.)?(\*|\d+)$/)))
  throw new NotValidVersion(version || 'undefined');

// Express
export const app = express();
expressWs(app);

if (env === 'dev') {
  app.use(
    responseTime((req: Request, res: Response, time) => {
      console.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${time.toFixed(
          2
        )}ms`
      );
    })
  );
}

app.use(bodyparser.json());
app.use(
  cors({
    origin: (env === 'prod' && domain) || (env === 'dev' && '*'),
  })
);

app.use('/', async (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('content-type', 'application/json');
  next();
});

// Is-Alive
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    'is-alive': true,
    'domain': domain,
    'port': port,
    'env': env,
    'version': version,
  });
});

// Routing
handleRouting(app).then(() => {
  // Make sure that error handling is ran last
  app.use(errorHandler);
});
