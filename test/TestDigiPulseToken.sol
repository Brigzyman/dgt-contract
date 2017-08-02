pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/DigiPulseToken.sol";

contract TestDigiPulseToken {

  function testInitialBalanceUsingDeployedContract() {
    DigiPulseToken meta = DigiPulseToken(DeployedAddresses.DigiPulseToken());

    uint expected = 16125000 * 1e8;

    Assert.equal(meta.getRemainingSupply(), expected, "Contract should have 16125000 DigiPulseToken available initially");
  }
}
