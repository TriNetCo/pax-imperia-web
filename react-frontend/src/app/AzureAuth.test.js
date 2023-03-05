import AzureAuth from './AzureAuth';


describe("AzureAuth tests", () => {

  test('AzureAuth can be instantiated, but it\'s all network calls so we can\'t test much else', () => {
    const azureAuth = new AzureAuth();

    expect(azureAuth).toBeInstanceOf(AzureAuth);
  });

});
