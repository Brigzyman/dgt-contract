pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/DigiPulseToken.sol";

contract TestDigiPulseToken {

  function testInitialBalanceUsingDeployedContract() {
    DigiPulseToken meta = DigiPulseToken(DeployedAddresses.DigiPulseToken());

    uint expected = 16125000 * 10e8;

    Assert.equal(meta.getSupply(), expected, "Contract should have 16581633 DigiPulseToken initially");
  }


  function testWhetherPreSaleContributorsHaveTheirTokens() {
    DigiPulseToken meta = new DigiPulseToken();

    // uint expected = 1105625000;
    uint expected = 0;
    address first = 0xce5f9f216580878f0370fc762564b059afe61b13;

    Assert.equal(meta.getBalance(first), expected, "First contributor should have 0 DGT since it was raised in pre-sale");
  }
}
