// Imports
import express, { Router } from 'express';
import expressWs from 'express-ws';
import { NextFunction, Request, Response } from 'express';
import bodyparser from 'body-parser';
import fs from 'fs';
import argvFetcher from '@lib/argvFetcher';
import cors from 'cors';
import axios from 'axios';
import path from 'path';

// Exceptions
import PackageVersionNotFound from 'exceptions/PackageVersionNotFound';
import DomainNotSpecified from 'exceptions/DomainNotSpecified';
import NotValidVersion from 'exceptions/NotValidVersion';
import DomainCheckNotValid from 'exceptions/DomainCheckNotValid';

// Fetch repo information
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

if (!packageJson.version) throw new PackageVersionNotFound();

// Environment
const env = process.env.TS_NODE_DEV ? 'dev' : 'prod';

// Argument values
const argvs = process.argv;
const version = argvFetcher(argvs, ['-V', '--version'], packageJson.version);
const port = Number(argvFetcher(argvs, ['-P', '--port'], '28980'));
const domain = argvFetcher(argvs, ['-D', '--domain']);

if (!domain && env === 'prod') throw new DomainNotSpecified();
if (!version || (version && !version.match(/^(\d+\.)?(\d+\.)?(\*|\d+)$/)))
  throw new NotValidVersion(version || 'undefined');

// Express
const app = express();
expressWs(app);

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
/**
 * @api {get} / Is-alive gateway
 * @apiName IsAlive
 * @apiVersion 1.0.0
 * @apiGroup Misc
 *
 * @apiSuccess {Boolean} is-alive If server instance is alive (this will always be true)
 * @apiSuccess {String}  domain   The domain that the server instance is running under
 * @apiSuccess {Number}  port     The port the server instance is running on
 * @apiSuccess {String}  env      Server environment (prod/dev)
 * @apiSuccess {String}  version  Server version (Major.Minor.Patch)
 */
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
const handleRouting = async () => {
  const v = version.split('.')[0];
  try {
    const mainRouter: Router = (
      await import(path.join(process.cwd(), `src/v${v}/index.ts`))
    ).default;

    // sub-routes
    fs.readdirSync(path.join(process.cwd(), `src/v${v}`)).forEach(
      async file => {
        if (file === 'index.ts') return;
        const router: Router = (
          await import(path.join(process.cwd(), `src/v${v}/${file}`))
        ).default;

        const routeName = file.split('.')[0];

        mainRouter.use(`/${routeName}`, router);
      }
    );

    app.use(`/v${v}`, mainRouter);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

handleRouting();

// Initialisation
app.listen(port, async () => {
  console.log(
    `Server is listening on ${
      env === 'prod'
        ? `https://${domain}/api (internal port: ${port})`
        : `http://localhost:${port}`
    }`
  );

  // Check if domain is valid
  if (env === 'prod' && domain) {
    try {
      const response = await axios.get(`https://${domain}/api`);
      if (response.status !== 200) throw new DomainCheckNotValid(domain);
    } catch (e) {
      throw new DomainCheckNotValid(domain);
    }
  } else if (env === 'dev') {
    try {
      const response = await axios.get(`http://localhost:${port}`);
      if (response.status !== 200) throw new DomainCheckNotValid('localhost');
    } catch (e) {
      throw new DomainCheckNotValid('localhost');
    }
  }
  console.log('Domain check passed');
});
