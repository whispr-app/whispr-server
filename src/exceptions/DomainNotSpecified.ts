export default class DomainNotSpecified extends Error {
  constructor() {
    super();
    this.message =
      'Domain was not specified in a production environment. Set a domain by specifying --domain=example.com whilst running (replace example.com with your domain)';
  }
}
