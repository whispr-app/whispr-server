// Imports
import argvFetcher from './argvFetcher';
import fs from 'fs';

// Exceptions
import { PackageVersionNotFound } from './exceptions';

// Fetch repo information
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

if (!packageJson.version) throw new PackageVersionNotFound();

export const argvs = process.argv;
export const version = argvFetcher(
  argvs,
  ['-V', '--version'],
  packageJson.version
);
export const port = Number(argvFetcher(argvs, ['-P', '--port'], '28980'));
export const domain = argvFetcher(argvs, ['-D', '--domain']);
