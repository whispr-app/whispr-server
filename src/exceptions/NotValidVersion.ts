export default class NotValidVersion extends Error {
  constructor(version: string) {
    super();
    this.message = `"${version}" is not a valid version. Make sure you're using semantic versioning (https://semver.org/).`;
  }
}
