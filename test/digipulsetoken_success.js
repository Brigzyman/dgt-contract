var DigiPulseToken = artifacts.require("./DigiPulseToken.sol");

contract('DigiPulseToken', function(accounts) {

  // Depending on scenario which is being tested success / fail;
  // return;

  var total_raised = 0;
  var eth_amount = 0;

  it("should return 0 raised after creation of contract", function() {
    return DigiPulseToken.deployed().then(function(instance) {
      return instance.getRaised.call();
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 0, "No contributions have been made yet");
    });
  });

  it("should be able to calculate DGT in multiple tiers", function() {
    // Skip to future, when ICO is live
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0", method: "evm_increaseTime", params: [86400 * 5]
    }, function() { });

    var meta;
    var account = accounts[2];
    var account_ending_balance;

    // First tier filled + 100 ETH in second tier
    // 3275000 DGT / 250 Ratio = 13100 ETH
    var amount = 13100 + 100;
    eth_amount += 13100 + 100;

    return DigiPulseToken.deployed().then(function(instance) {
      meta = instance;
      meta.contribute({ from: account, value: amount * 1e16 });

    }).then(function() {
      return meta.getBalance.call(account);

    }).then(function(balance) {
      account_ending_balance = balance.toNumber();
      assert.equal(account_ending_balance, 3793750 * 1e8, "Amount wasn't correctly calculated from the sender");
      return meta.getBalance.call(account);

    }).then(function(balance) {
      total_raised += balance.toNumber();
      assert.equal(balance.toNumber(), 3793750 * 1e8, "Wrong amount of DGT is listed for the address.");
    });
  });

  it("should be able to send ETH and receive DGT with 10% bonus", function() {
    var meta;

    var account = accounts[1];
    var account_ending_balance;

    var amount = 10;
    eth_amount += amount;

    return DigiPulseToken.deployed().then(function(instance) {
      meta = instance;
      meta.contribute({ from: account, value: amount * 1e16 });

    }).then(function() {
      return meta.getBalance.call(account);

    }).then(function(balance) {
      account_ending_balance = balance.toNumber();
      assert.equal(account_ending_balance, amount * 1e8 * 250 * 1.10, "Wrong amount of DGT is listed for the address.");
      total_raised += account_ending_balance;
      return meta.getRaised.call();

    }).then(function(balance) {
      balance = balance.toNumber();
      assert.equal(balance, total_raised, "Amount raised is not correct");

      return meta.getBalanceInEth.call(account);

    }).then(function(balance) {
      account_balance = balance.toNumber();
      assert.equal(account_balance, amount * 1e16, "Wrong amount of ETH is available for the address.");

      return meta.getBalance.call(account);
    });
  });

  it("should return remaining supply in DGT", function() {
    var meta;

    var account = accounts[2];
    var account_balance;

    return DigiPulseToken.deployed().then(function(instance) {
      meta = instance;
      return meta.getRemainingSupply.call();

    }).then(function(balance) {
      supply = balance.toNumber();
      assert.equal(supply, 16125000 * 1e8 - total_raised, "Wrong amount of supply is left.");

    });
  });

  it("should return raised amount in DGT", function() {
    var meta;

    var account = accounts[2];
    var account_balance;

    return DigiPulseToken.deployed().then(function(instance) {
      meta = instance;
      return meta.getRaised.call();

    }).then(function(balance) {
      raised = balance.toNumber();
      assert.equal(raised, total_raised, "Wrong amount raised.");

    });
  });

  it("should return raised amount in ETH", function() {
    var meta;

    var account = accounts[2];
    var account_balance;

    return DigiPulseToken.deployed().then(function(instance) {
      meta = instance;
      return meta.getRaisedEth.call();

    }).then(function(balance) {
      raised = balance.toNumber();
      assert.equal(raised, eth_amount * 1e16, "Wrong amount raised.");

    });
  });

  it("should not be able to withdraw funds since ICO is not over", function() {
    var meta;
    var owner_acc = accounts[0];

    return DigiPulseToken.deployed().then(function(instance) {
      meta = instance;
      return meta.withdrawFundsToOwner(1000 * 1e16);

    }).then(function() {
      assert(false, "Refund did not revert()");

    }).catch(function(error) {
      // As expected, it reverts()
    })
  });

  it("shouldn't allow execution since ICO is not over and goal is not reached", function() {
    var meta;
    var response;

    return DigiPulseToken.deployed().then(function(instance) {
      meta = instance;
      return meta.finalise();

    }).then(function(returnValue) {
      assert(false, "finalise() was supposed to revert() but didn't");

    }).catch(function(error) {
      // Revert() received;
    });
  });

  it("shouldn't be able to refund and finalise ICO", function() {
    // Skip to future, when ICO has ended
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0", method: "evm_increaseTime", params: [86400 * 30]
    }, function() { });

    var meta;
    var presale;

    return DigiPulseToken.deployed().then(function(instance) {
      meta = instance;
      return meta.finalise();

    }).then(function(response) {
      return meta.getBalance.call('0x8776A6fA922e65efcEa2371692FEFE4aB7c933AB');

    }).then(function(balance) {
      presale = balance.toNumber();
      total_raised += presale;
      assert.equal(presale, 961735343125, "PreSale amount was not added to the ledger");
      return meta.getBalance.call('0x663F98e9c37B9bbA460d4d80ca48ef039eAE4052');

    }).then(function(balance) {
      var bounties = balance.toNumber();
      assert.equal(bounties, parseInt(total_raised / 98 * 2), "Bounty pool is not calculated correctly");
    });
  });

  it("should not able to contribute once ICO completed", function() {
    var meta;
    var account = accounts[1];
    var amount = 10;

    return DigiPulseToken.deployed().then(function(instance) {
      meta = instance;
      return meta.contribute({ from: account, value: amount * 1e16 });

    }).then(function(response) {
      assert(false, "contribute() was supposed to revert()");

    }).catch(function(error) {
      // Just as expected. No more contributions accepted.
    });
  });

  it("should be able to send DGT from one account to another", function() {
    var meta;

    var account_from = accounts[1];
    var account_to = accounts[3];
    var amountDgt = 100;
    var initialBalance;

    return DigiPulseToken.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(account_from);

    }).then(function(balance) {
      initialBalance = balance.toNumber();
      meta.transfer(account_to, amountDgt * 1e8, { from: account_from });

    }).then(function() {
      return meta.getBalance.call(account_from);

    }).then(function(balance) {
      balance = balance.toNumber();
      assert.equal(balance, initialBalance - amountDgt * 1e8, "Balance did not reduce correctly");
      return meta.getBalance.call(account_to);

    }).then(function(balance) {
      var recipient_balance = balance.toNumber();
      assert.equal(recipient_balance, amountDgt * 1e8, "Recipient did not receive DGT amount");
    });
  });

  it("should be able to withdraw funds if campaign was a success", function() {
    var meta;
    var initialBalance;
    var owner_acc = accounts[0];
    var transfer = 1000 * 1e16;

    return DigiPulseToken.deployed().then(function(instance) {
      meta = instance;
      return meta.getRaisedEth.call()

    }).then(function(balance) {
      initialBalance = balance.toNumber();
      return meta.withdrawFundsToOwner(transfer);

    }).then(function() {
      return meta.getRaisedEth.call()

    }).then(function(balance) {
      var newBalance = balance.toNumber();
      assert.equal(newBalance, initialBalance - transfer, "Raised ETH amount was not reduced");
    })
  });
});