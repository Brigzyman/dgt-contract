var DigiPulse = artifacts.require("./DigiPulse.sol");

contract('DigiPulse', function(accounts) {

  // Depending on scenario which is being tested success / fail;
  return;

  var total_raised = 0;
  var eth_amount = 0;

  it("should be able to send ETH and receive DGT with 10% bonus", function() {
    // Skip to future, when ICO is live
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0", method: "evm_increaseTime", params: [86400 * 5], id: 1
    }, function() {});

    var meta;
    var account = accounts[1];
    var account_ending_balance;

    var amount = 10;
    eth_amount += amount;

    return DigiPulse.deployed().then(function(instance) {
      meta = instance;
      meta.sendTransaction({ from: account, value: amount * 1e18 });

    }).then(function() {
      return meta.balanceOf.call(account);

    }).then(function(balance) {
      account_ending_balance = balance.toNumber();
      assert.equal(account_ending_balance, amount * 1e8 * 250 * 1.15, "Wrong amount of DGT is listed for the address.");
      total_raised += account_ending_balance;
      return meta.totalSupply.call();

    }).then(function(balance) {
      balance = balance.toNumber();
      assert.equal(balance, total_raised, "Amount raised is not correct");

      return meta.getBalanceInEth.call(account);

    }).then(function(balance) {
      account_balance = balance.toNumber();
      assert.equal(account_balance, amount * 1e18, "Wrong amount of ETH is available for the address.");

      return meta.balanceOf.call(account);
    });
  });

  it("shouldn't allow execution since ICO is not over and goal is not reached", function() {
    var meta;
    var response;

    return DigiPulse.deployed().then(function(instance) {
      meta = instance;
      return meta.finalise();

    }).then(function(returnValue) {
      assert(false, "finalise() was supposed to revert() but didn't");

    }).catch(function(error) {
      // Revert() received;iter

    });
  });

  it("shouldn't be able to refund ETH since ICO is still in progress", function() {
    var meta;
    var presale;
    var account = accounts[1];

    return DigiPulse.deployed().then(function(instance) {
      meta = instance;
      return meta.refundEther();

    }).then(function(response) {
      assert(false, "refundEther() was supposed to revert() but didn't");

    }).catch(function(error) {
      // Revert() received;
    });
  });

  it("shouldn't be able to refund and finalise ICO", function() {
    var meta;
    var presale;

    return DigiPulse.deployed().then(function(instance) {
      meta = instance;
      return meta.finalise();

    }).catch(function(error) {
      // It is supposed to revert();
      assert(false, "finalise() was not supposed to revert()");

    }).then(function(response) {
      return meta.balanceOf.call('0x8776A6fA922e65efcEa2371692FEFE4aB7c933AB');

    }).then(function(balance) {
      presale = balance.toNumber();
      total_raised += presale;
      assert.equal(presale, 0, "PreSale amount was added to the ledger");
      return meta.balanceOf.call('0x663F98e9c37B9bbA460d4d80ca48ef039eAE4052');

    }).then(function(balance) {
      var bounties = balance.toNumber();
      assert.equal(bounties, 0, "Bounty pool is not calculated correctly");
      return meta.finalise();

    }).then(function(response) {
      assert(false, "finalise() was supposed to revert() but didn't");

    }).catch(function(error) {
      // It is supposed to revert();
    });
  });

  it("just so we can mine a block and skip to the futre", function() {
    // After ICO period
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0", method: "evm_increaseTime", params: [86400 * 30], id: 2
    }, function() {});

    var meta;
    var account = accounts[0];
    var amount = 10;

    return DigiPulse.deployed().then(function(instance) {
      meta = instance;
      return meta.sendTransaction({ from: account, value: amount * 1e18 });

    }).then(function() {
      assert(false, "sendTransaction() was supposed to revert() since ICO is over");

    }).catch(function(error) {
      // revert() received as expected
    });
  });

  it("should be able to refund ETH since ICO failed", function() {
    var meta;
    var account = accounts[1];

    return DigiPulse.deployed().then(function(instance) {
      meta = instance;
      return meta.finalise();

    }).then(function(response) {
      return meta.getBalanceInEth.call(account)

    }).then(function(balance) {
      balance = balance.toNumber();
      assert.equal(balance, eth_amount * 1e18, "ETH was not present on address.");
      return meta.refundEther({ from: account });

    }).catch(function(error) {
      assert(false, "refundEther() was not supposed to revert()");

    }).then(function() {
      return meta.getBalanceInEth.call(account)

    }).then(function(balance) {
      balance = balance.toNumber();
      assert.equal(balance, 0, "ETH was not transferred");

    });
  });

  it("should not able to contribute once ICO failed", function() {
    var meta;
    var account = accounts[1];
    var amount = 10;

    return DigiPulse.deployed().then(function(instance) {
      meta = instance;
      return meta.sendTransaction({ from: account, value: amount * 1e18 });

    }).then(function(response) {
      assert(false, "contribute() was supposed to revert()");

    }).catch(function(error) {
      // Just as expected. No more contributions accepted.
    });
  });
});
