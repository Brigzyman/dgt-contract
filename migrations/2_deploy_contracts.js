var ConvertLib = artifacts.require("./ConvertLib.sol");
var DigiPulseToken = artifacts.require("./DigiPulseToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, DigiPulseToken);
  deployer.deploy(DigiPulseToken);
};
