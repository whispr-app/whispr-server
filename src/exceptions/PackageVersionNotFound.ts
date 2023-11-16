export default class PackageVersionNotFound extends Error {
  constructor() {
    super();
    this.message =
      'Package.json version could not be found. Does the file exist?';
  }
}
