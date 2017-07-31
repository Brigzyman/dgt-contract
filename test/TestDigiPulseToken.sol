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
    address first = 0x663F98e9c37B9bbA460d4d80ca48ef039eAE4052;

    Assert.equal(meta.getBalance(first), expected, "First contributor should have 0 DGT since it was raised in pre-sale");
  }
}
