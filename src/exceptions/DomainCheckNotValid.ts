export default class DomainCheckNotValid extends Error {
  constructor(domain: string) {
    super();
    this.message = `Domain check failed validity test. Is ${domain} pointing to this server instance?`;
  }
}
