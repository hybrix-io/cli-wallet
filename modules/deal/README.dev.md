# USER STORY


Engines:
 - allocation: Manages allocation accounts, which are subset keys of a user's main account. These keys are shared to the node to be able to send payments on the user's behalf in response to deals. The user also retains full controls over these keys, making it a non-custodial solution with a third-party security caveat. This caveat will be solved using a reputation and security deposit engine and a dispute engine to make sure allocators and allocation nodes play by the rules.
 - deal: Creates swap proposals for end-users wanting to swap using allocation funds. These proposals can then be accepted, thus the swap exchange is autonomously done, or as automatically as possible.

 0. Initialize some mock funds for testing:

 ```
 ./cli-wallet --api /e/mockchain/mine/btc/638/100
 ./cli-wallet --api /e/mockchain/mine/eth/638/100
 ```

 This will create 100 mock.eth and 100 mock.btc on address 638.


1. The cli-wallet can utilize the useful functions of the allocation and deal engine using modules. We start by creating an allocation account, which is then also stored encrypted on the allocator node. An allocator ID is returned which the user can use to perform manual queries using the hybrix API.

```
./cli-wallet -u DUMMYDUMMYDUMMY0 -p DUMMYDUMMYDUMMY0 -M allocation create
 [.] module: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%, eta: 0.0s

A179AXYuu3EwHxdDNo4wzAxHVuc82Xs374TcdnBsKHAV
```


2. Now that the allocation has been created, this allocator wants to earn some money. To do so he/she deposits a pair of crypto currencies to the allocation account.
```
./cli-wallet -u DUMMYDUMMYDUMMY0 -p DUMMYDUMMYDUMMY0 -M allocation deposit mock.btc 100
 [.] module: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%, eta: 0.0s

8
```


```
./cli-wallet -u DUMMYDUMMYDUMMY0 -p DUMMYDUMMYDUMMY0 -M allocation deposit mock.eth 100
 [.] module: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%, eta: 0.0s

9
```


3. This user wants to be thorough, so he/she checks the allocation balance to make sure everything transacted okay.
```
./cli-wallet -u DUMMYDUMMYDUMMY0 -p DUMMYDUMMYDUMMY0 -M allocation balance mock.btc
 [.] module: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%, eta: 0.0s

100
```

4. The pair needs to be listed so others can swap with it. This can be one-way or two-way.

a) First create the ability to swap from mock.eth to mock.btc, and propose a static fee of 0.3 percent of the output amount per swap, excluding network transaction fees.
```
./cli-wallet -u DUMMYDUMMYDUMMY0 -p DUMMYDUMMYDUMMY0 -M allocation pairSet mock.eth mock.btc 0.3
 [.] module: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%, eta: 0.0s

{"active":true,"rx":"mock.eth","tx":"mock.btc","fee":"0.3","type":"autonomous","deadline":36000,"balance":"100","sufficiency":"0"}
```

b) Secondly create a swap from tomo.hy back to tomo. In this case the user wants more fee, so sets 0.4 percent per swap.
```
./cli-wallet -u DUMMYDUMMYDUMMY0 -p DUMMYDUMMYDUMMY0 -M allocation pairSet mock.btc mock.eth 0.3
 [.] module: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%, eta: 0.0s

 {"active":true,"rx":"mock.btc","tx":"mock.eth","fee":"0.4","type":"autonomous","deadline":36000,"balance":"100","sufficiency":"0"}
```

c) The available balance in both responses is the maximum amount of transmittable output currency of the pair. Mirror pairs like the two potential deals above are automatically double-balance accounted. This means that a swap will deduct from one balance, and add to the other, without needing to reference the blockchain each time as the mempools are often too slow, and will only reflect the correct balances later.

d) To be allowed to allocate, TOMO.HY must be deposited and then sent to a security reserve.
```
./cli-wallet -u DUMMYDUMMYDUMMY0 -p DUMMYDUMMYDUMMY0 -M allocation deposit tomo.hy 12
 [.] module: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%, eta: 0.0s

0x1a2b3c3d5e6f...
```

e) Now instruct the alloctor node to reserve an amount as a security deposit. The deposit will be taken from the required symbol (TOMO.HY) and set apart.
```
./cli-wallet -u DUMMYDUMMYDUMMY0 -p DUMMYDUMMYDUMMY0 -M allocation securityDeposit 7
 [.] module: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%, eta: 0.0s

{"action":"deposit","balance":6.965,"deposited":6.965,"fee":0.035,"txid":"0xd9c4c6b353c591bbcc400def4a4226db8912a9db0c38309975d59919232fd31e"}
```


5. Another user wants to swap some of his/her mock.btc for mock.eth. Doesn't like GUI's so does it from the command line. First user calculates what this could cost in theory. For the swap he/she requests a proposal from the allocation pool. Our allocator's pair pops up with a proposal.
```
 ./cli-wallet -u DUMMYDUMMYDUMMY0 -p DUMMYDUMMYDUMMY0 -M deal proposal mock.btc mock.eth 10
 [.] module: [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%, eta: 0.0s

{"id":"341d602e0bae5a60","ask":{"symbol":"tomo.hy","amount":"0.144479359219266753","target":"0xa7c2e624e1c477d3fe2a4127564a3c980b1fca58","txid":null},"bid":{"symbol":"tomo","amount":"0.1","target":"0xfd9eb537df909144f14084d75fa88142bc80eb57","txid":null},"fees":{"symbol":"tomo.hy","allocator":"0.000575534723123336","network":"0.000020143715309316774"},"type":"autonomous","deadline":"1606255996","status":"open"}
```

What the deal object tells us:
 - proposal deal says that for a bid amount of 0.1 tomo, it expects the asking price of 0.144479359219266753 tomo.hy
 - the ask price is very exact and includes:
  - 0.3 percent fee for the allocator
  - network fees for the bid transaction
 - the deal is now effectively in a wait state until deadline epoch 1606255996, periodically checking if a proof claim and associated funds are coming in
 - status shows what the deal is up to: open, confirming, accepted, remitting, complete (will still rename 'complete' to 'done')

Deal status:
 - open: progress 0, no payment has been sent, and no claim proof sent
 - confirming: progress >0 <0.5, claim proof has been sent, and one or more block confirmations have been detected
 - accepted: progress 0.5, confirmations are saturated according to recipe settings for an asset, output amount not yet remitted
 - remitting: progress >0.5 <1, remittance proof has been set, output transaction is confirming
 - done: progress 1, swap transaction is complete, necessary proofs available in the form of transaction IDs


6. User accepts the deal proposal (using the deal ID) , and cli-wallet sends the necessary amount to the allocator. The transaction ID is used to claim proof of payment, and also sent to the allocator to expedite the process. (being implemented...)
```
./cli-wallet -u DUMMYDUMMYDUMMY0 -p DUMMYDUMMYDUMMY0 -M deal accept 341d602e0bae5a60

{TRANSACTION_ID}
```


7. Being worried about his/her spent 0.144479359219266753, the user occasionally wants to check on the progress of the deal. (not yet implemented!)
```
./cli-wallet -u DUMMYDUMMYDUMMY0 -p DUMMYDUMMYDUMMY0 -M deal status 341d602e0bae5a60

{"id":"341d602e0bae5a60","ask":{"symbol":"mock.btc","amount":"0.144479359219266753","target":"0xa7c2e624e1c477d3fe2a4127564a3c980b1fca58","txid":"0xf1e2d3c4b5..."},"bid":{"symbol":"tomo","amount":"0.1","target":"0xfd9eb537df909144f14084d75fa88142bc80eb57","txid":"0xa6b7c8d9e0..."},"fees":{"symbol":"tomo.hy","allocator":"0.000575534723123336","network":"0.000020143715309316774"},"type":"autonomous","deadline":"1606255996","status":"done"}
```

Wow! It looks like the deal was done within one minute. User is very happy. All is calm, all is bright. ;-)
