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
  uint constant endOfIco = 1504223999; // 08/04/2017 @ 8:00am (UTC)
  uint allocatedSupply = 0;

  // Presale
  uint constant raisedInPresale = 961735343125;
  bool withdrawInitiated = false;
  bool goalReached = false;


  /* Initializes contract with initial supply tokens to the creator of the contract */
  function DigiPulseToken() {

  }

  function getStartOfIco() returns(uint) {
  	return startOfIco;
  }


  function sendOutTokens() {
  	if (allocatedSupply * dgtRatioToEth < 6000 ether) revert();
  	if (allocatedSupply != tokenSupply && now < endOfIco) revert();

  	withdrawInitiated = true;
  	setPreSaleAmounts();
  	allocateBountyTokens();

  	// send tokens
  	// ...
  }


  function refundEther() {
  	// Can be executed only opon end of an ICO and only when less than 6k ETH raised
  	if (now < endOfIco && allocatedSupply * dgtRatioToEth > 6000 ether) revert();

  	// refund tokens
  	// ...
  }


  /* Send coins */
  function transfer(address _to, uint256 _value) {
    if (balanceOf[msg.sender] < _value) revert();           // Check if the sender has enough
    if (balanceOf[_to] + _value < balanceOf[_to]) revert(); // Check for overflows

    balanceOf[msg.sender] -= _value;                     // Subtract from the sender
    balanceOf[_to] += _value;                            // Add the same to the recipient
  }


  // Returns balance raised in ETH from specific address
	function getBalanceInEth(address addr) returns(uint){
		return ConvertLib.convert(getBalance(addr), dgtRatioToEth);
	}


	// Returns balance raised in DGT from specific address
	function getBalance(address addr) returns(uint) {
		return balanceOf[addr];
	}


	// Get remaining supply of DGT
	function getSupply() returns(uint) {
		return tokenSupply;
	}


  // Raised during Pre-sale
	function setPreSaleAmounts() {
		if (withdrawInitiated == false) revert();

	  balanceOf[0xce5f9f216580878f0370fc762564b059afe61b13] =   1105625000; // 11.05625000 DGT
	  balanceOf[0x8776A6fA922e65efcEa2371692FEFE4aB7c933AB] =   1562500000;
	  balanceOf[0x15b0c25638f9e2D6E6743cD7a69cecAb014Bb8Ca] =   6250000000;
	  balanceOf[0x2C02D03f53489bd2774f9E360Ea393A6c6329bdB] =   6250000000;
	  balanceOf[0x515B027899a55D8aC9737Cda6BB964951ff7Cc82] =   6250000000;
	  balanceOf[0x50b4a84c42925c8EB67b64733cf9593146b972e1] =   7406250000;
	  balanceOf[0x2caf0d45deead80da1e7d091c955d48b58a28a08] =   7968750000;
	  balanceOf[0xf0e9Ef5EE8F3674dEAB36f367C46a57f1e458cfA] =  20200625000;
	  balanceOf[0x39885EB552a3A814Fe2c79781b9bc915843C1BD3] =  31250000000;
	  balanceOf[0x1c4F5E82Dac438c7F8Cf47B4f237FAED93b43b16] =  31250000000;
	  balanceOf[0x5E8caE8a6d5E65926432b8900f5192478a31a109] = 172413864375;
	  balanceOf[0xBB6a783707F9fFf6eb5D97D7053ef06151F0B125] = 325000000000;
	  balanceOf[0x8776A6fA922e65efcEa2371692FEFE4aB7c933AB] = 344827728750; // 3448.27728750 DGT
	}


	// Bounty pool makes up 2% from all tokens bought
	function allocateBountyTokens() {
		if (withdrawInitiated == false) revert();

		balanceOf[0x663F98e9c37B9bbA460d4d80ca48ef039eAE4052] = allocatedSupply / 98 * 2;
	}
}
