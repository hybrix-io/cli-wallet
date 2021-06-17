
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
