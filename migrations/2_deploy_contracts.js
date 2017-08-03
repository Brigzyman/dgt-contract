var ConvertLib = artifacts.require("./ConvertLib.sol");
var DigiPulse = artifacts.require("./DigiPulse.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, DigiPulse);
  deployer.deploy(DigiPulse);
};
