var DigiPulseToken = artifacts.require("./DigiPulseToken.sol");

contract('DigiPulseToken', function(accounts) {

  it("should return 0 raised after creation of contract", function() {
    return DigiPulseToken.deployed().then(function(instance) {
      return instance.getRaised.call();
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 0, "No contributions have been made yet");
    });
  });


  it("should call a function that depends on a linked library", function() {
    var meta;
    var digiPulseTokenBalance;
    var digiPulseTokenEthBalance;

    return DigiPulseToken.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(accounts[0]);
    }).then(function(outCoinBalance) {
      digiPulseTokenBalance = outCoinBalance.toNumber();
      return meta.getBalanceInEth.call(accounts[0]);
    }).then(function(outCoinBalanceEth) {
      digiPulseTokenEthBalance = outCoinBalanceEth.toNumber();
    }).then(function() {
      assert.equal(digiPulseTokenEthBalance, 2 * digiPulseTokenBalance, "Library function returned unexpected function, linkage may be broken");
    });
  });


  it("should be able to send ETH and receive DGT with 15% bonus", function() {
    var meta;

    // Get initial balances of first and second account.
    var account_one = accounts[0];
    var account_one_starting_balance;
    var account_one_ending_balance;

    var amount = 10;

    return DigiPulseToken.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(account_one);

    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();

    }).then(function() {
      meta.contribute({ from: account_one, value: amount * 10e16 });

    }).then(function() {
      return meta.getBalance.call(account_one);

    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      assert.equal(account_one_ending_balance, amount * 1e8 * 250 * 1.15, "Amount wasn't correctly calculated from the sender");
    });
  });
});
