import type { NextFunction, Request, Response, Router, Express } from 'express';
import { AppError } from './exceptions';
import type { AnyZodObject } from 'zod';
import { ZodError } from 'zod';
import { version } from './argvHandler';
import path from 'path';
import fs from 'fs';

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request<unknown>, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const invalids = error.issues.map(issue => issue.path.pop());
        next(
          new AppError(
            'validation',
            `Invalid or missing input${
              invalids.length > 1 ? 's' : ''
            } provided for: ${invalids.join(', ')}`
          )
        );
      } else {
        next(new AppError('validation', 'Invalid input'));
      }
    }
  };

export const errorHandler = (
  error: Error,
  _: Request,
  response: Response,
  _next: NextFunction
) => {
  response
    .status('statusCode' in error ? (error.statusCode as number) : 500)
    .json({
      message:
        error instanceof AppError
          ? error.message
          : "Something went wrong. We're not sure what happened.",
    });
};

export const handleRouting = async (app: Express) => {
  const v = (version as string).split('.')[0];
  try {
    const mainRouter: Router = (
      await import(path.join(process.cwd(), `src/v${v}/index.ts`))
    ).default;

    // sub-routes
    fs.readdirSync(path.join(process.cwd(), `src/v${v}`)).forEach(
      async file => {
        if (file === 'index.ts') return;
        const router: Router = (
          await import(
            path.join(process.cwd(), `src/v${v}/${file}/${file}.router.ts`)
          )
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
