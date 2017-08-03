pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/DigiPulse.sol";

contract TestDigiPulse {

  function testInitialBalanceUsingDeployedContract() {
    DigiPulse meta = DigiPulse(DeployedAddresses.DigiPulse());

    uint expected = 16125000 * 1e8;

    Assert.equal(meta.getRemainingSupply(), expected, "Contract should have 16125000 DigiPulse available initially");
  }
}
