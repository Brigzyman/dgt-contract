pragma solidity ^0.4.4;

import "./ConvertLib.sol";

contract DigiPulseToken {

	// Token data for ERC20
  string public constant name = "DigiPulse Token";
  string public constant symbol = "DGT";
  uint8 public constant decimals = 8;

  // Array with all balances and sypply data
  mapping (address => uint256) public balanceOf;

  // Max available supply is 16581633 * 10e8 (incl. 100000 presale and 2% bounties)
  uint constant tokenSupply = 16125000 * 10e8;
  uint8 constant dgtRatioToEth = 250;
  uint constant startOfIco = 1501833600; // 08/04/2017 @ 8:00am (UTC)
  uint constant endOfIco = 1504223999; // 08/31/2017 @ 23:59pm (UTC)
  uint constant raisedInPresale = 961735343125;

  uint allocatedSupply = 0;
  bool icoFailed = false;
  bool icoFulfilled = false;

  // Generate public event that will notify clients
	event Transfer(address indexed from, address indexed to, uint256 value);
  event Refund(address indexed _from, uint256 _value);

  // No special actions are required upon creation, so initialiser is left empty
  function DigiPulseToken() {
    // Nothing here.
  }

  // logic which converts eth to dgt and stores in allocatedSupply
  // TODO
  function contribute() payable external {
    // Abort if crowdfunding has reached an end
    if (icoFailed) revert();
    if (icoFulfilled) revert();

    // Do not allow creating 0 or more than the available tokens.
    if (msg.value == 0) revert();

    // Must adjust number of decimals, so the ratio will work as expected
    // From ETH 16 decimals to DGT 8 decimals
    uint dgtAmount = msg.value / 10e8 * dgtRatioToEth;
    if (dgtAmount > tokenSupply - allocatedSupply) revert();

    // Tier bonus calculations
    uint dgtWithBonus;
    uint256 applicable_for_tier;

    for (uint8 i = 0; i < 4; i++) {
      uint256 tier_amount = 3275000 * 10e8;
      Transfer(0, msg.sender, tier_amount);
      uint8 tier_bonus = 115 - (i * 5);
      applicable_for_tier += tier_amount;

      // We are skipping over this tier, since it is filled already
      if (allocatedSupply >= applicable_for_tier) continue;
      if (dgtAmount == 0) break;

      // Cases when part of the pledge is covering two tiers
      int256 diff = int(allocatedSupply) + int(dgtAmount - applicable_for_tier);

      if (diff > 0) {
        dgtWithBonus += (dgtAmount - uint(diff)) * tier_bonus / 100;
        dgtAmount = uint(diff);
      } else {
        dgtWithBonus += dgtAmount * tier_bonus / 100;
        dgtAmount = 0;
      }
    }

    // Increase supply
    allocatedSupply += dgtWithBonus;

    // Assign new tokens to the sender and log token creation event
    balanceOf[msg.sender] += dgtWithBonus;
    Transfer(0, msg.sender, tier_bonus);
  }

  // For future transfers of DGT
  // TODO Test
  function transfer(address _to, uint256 _value) {
    if (balanceOf[msg.sender] < _value) revert();           // Check if the sender has enough
    if (balanceOf[_to] + _value < balanceOf[_to]) revert(); // Check for overflows

    balanceOf[msg.sender] -= _value;                        // Subtract from the sender
    balanceOf[_to] += _value;                               // Add the same to the recipient

    Transfer(msg.sender, _to, _value);
  }

  // Decide the state of the project
  // TODO Test
  function finalize() external {
    if (icoFailed) revert();
    if (icoFulfilled) revert();
    if (now < endOfIco && allocatedSupply != tokenSupply) revert();

    if (allocatedSupply / dgtRatioToEth < 6000 ether) {
      icoFailed = true;
    } else {
      setPreSaleAmounts();
      allocateBountyTokens();
      icoFulfilled = true;
    }
  }

  // If the goal is not reached till the end of the ICO
  // allow refunds
  // TODO Test
  function refundEther() external {
  	if (!icoFailed) revert();

    var dgtValue = balanceOf[msg.sender];
    if (dgtValue == 0) revert();
    balanceOf[msg.sender] = 0;
    allocatedSupply -= dgtValue;

    // Get the number of ether and remove bonus added from the first tier,
    // since refund is not possible once the first tier has closed and
    // additional decimals are added, so it matches initial amount
    var ethValue = dgtValue / dgtRatioToEth * 10e8 / 115 * 100;
    Refund(msg.sender, ethValue);
    if (!msg.sender.send(ethValue)) revert();
  }

  // Returns balance raised in ETH from specific address
  // TODO Test
	function getBalanceInEth(address addr) returns(uint){
		return ConvertLib.convert(getBalance(addr), dgtRatioToEth);
	}

	// Returns balance raised in DGT from specific address
	// TODO Test
	function getBalance(address addr) returns(uint) {
		return balanceOf[addr];
	}

	// Get remaining supply of DGT
	// TODO Test
	function getSupply() returns(uint) {
		return tokenSupply;
	}

	// Get raised amount during ICO
	// TODO Test
	function getRaised() returns(uint) {
		return allocatedSupply;
	}

  // Raised during Pre-sale
  // Since some of the wallets in pre-sale were on exchanges, we transfer tokens
  // to account which will send tokens manually out
	function setPreSaleAmounts() private {
    balanceOf[0x663F98e9c37B9bbA460d4d80ca48ef039eAE4052] += raisedInPresale;
    Transfer(0, 0x663F98e9c37B9bbA460d4d80ca48ef039eAE4052, raisedInPresale);

    allocatedSupply += raisedInPresale;
	}

	// Bounty pool makes up 2% from all tokens bought
	function allocateBountyTokens() private {
    var bountyAmount = allocatedSupply / 98 * 2;
		balanceOf[0x663F98e9c37B9bbA460d4d80ca48ef039eAE4052] += bountyAmount;
    Transfer(0, 0x663F98e9c37B9bbA460d4d80ca48ef039eAE4052, bountyAmount);
    allocatedSupply += bountyAmount;
	}
}
