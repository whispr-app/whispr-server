import { globSync } from 'glob';

export interface Tree {
  Branches: Tree[];
  Module: string | null;
  path: string[];
}

export class RouteHandler {
  private path: string;
  constructor(path: string) {
    this.path = path;
  }

  public generateTree(path?: string): Tree {
    const routes = globSync(`${path || this.path}/*`);

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
        tree.Module = route;
      } else {
        const child = this.generateTree(route);
        tree.Branches.push(child);
      }
    });

    return tree;
  }

  public walk(tree: Tree, callback: (tree: Tree) => void): void {
    callback(tree);
    tree.Branches.forEach(child => this.walk(child, callback));
  }
}
