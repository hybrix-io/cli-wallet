
Allocation module documentation
-------------------------------

This module makes it possible to manage your deterministic allocation account.
It enables you to offer swap pairs for other users to be able to swap, and
earn fees on every swap performed.

 Use this module by passing the command line option:
  -M allocation <command>


To be able to make pairs available, you must first deposit HY tokens and then
reserve those as security collateral before setting up new pairs. This ensures
swappers in the network cannot have their transactions front-run by allocators.

 Example to deposit an amount of 30 HY and reserve 10 HY as collateral:
  -M allocation deposit hy 30
  -M allocation securityReserve 10


Using pairSet you can then set up your first swap pair. Bear in mind that if
you want your pair to be swappable in both directions you must also setup the
pair for the opposite direction.

 Example to set up two-way swap between BNB and TOMO with a 0.3% swap fee:
  -M allocation pairSet bnb tomo 0.3
  -M allocation pairSet tomo bnb 0.3


The following allocation module commands are available:

 address [symbol]   Get the allocation account address related to the 
                    symbol.

 balance [symbol]   Get the allocation account balance of the asset symbol.

 create             Create a new allocation account paired to your wallet.

 deposit [symbol] [amount]   Deposit an asset amount from your wallet into
                             your allocation account.

 details            Show your allocation account details.

 help               Show this help information.

 pairDelete [base] [symbol]  Delete the allocated BASE/SYMBOL pair, making
                             it unavailable.

 pairGet [base] [symbol]     Get information about an allocated BASE/SYMBOL
                             pair in your allocation account.

 pairSet [base] [symbol] [feePercent]   Setup a (new) allocation BASE/SYMBOL
                                        pair in your allocation account.

 securityDetails    Show your security deposit details.

 securityExtract [amount]    Extract an amount from your security collateral.
                             Note: This reduces your pair sufficiency and
                             liquidity value!

 securityReserve [amount]    Reserve an amount of HY as security collateral
                             to provide sufficiency for allocated pair swaps.

 withdraw [symbol] [amount]  Withdraw an asset amount from your allocation
                             account back to your wallet.
