import fs from 'fs';
import { join } from 'path';

export interface Tree {
  Branches: Tree[];
  Module: string | null;
  path: string[];
}

export class RouteHandler {
  private path: string;
  /**
   * @param path Path to start (e.g. 'src/v1')
   */
  constructor(path: string) {
    this.path = path;
  }

  public generateTree(path?: string): Tree {
    const routes = fs.readdirSync(path || this.path);

    const tree: Tree = {
      Branches: [],
      Module: null,
      path:
        path?.split('/').filter(route => route !== '') ||
        this.path.split('/').filter(route => route !== '') ||
        [],
    };

    routes.forEach(route => {
      if (route.endsWith('index.ts')) {
        tree.Module = join(path || this.path, route);
      } else {
        const child = this.generateTree(join(path || this.path, route));
        tree.Branches.push(child);
      }
    });

    return tree;
  }

  /**
   * @param tree Tree object to walk through
   * @param callback Callback function to call on each descendent
   */
  public walk(tree: Tree, callback: (tree: Tree) => void): void {
    callback(tree);
    tree.Branches.forEach(child => this.walk(child, callback));
  }
}
