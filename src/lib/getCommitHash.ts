import { execSync } from 'child_process';

export const hash = execSync('git rev-parse HEAD').toString().trim();
