
Deal module documentation
-----------------------

This module makes it possible to swap cryptocurrencies and tokens across
ledgers. This is done by requesting a proposal from the swap matcher, and
then accepting the deal offered.


 Use this module by passing the command line option:
  -M deal <command>


The following deal module commands are available:

 accept [dealID]    Accept a deal proposal, sending the necessary amount
                    for the proposed deal to be fulfilled.

 estimate [base] [symbol] [target_amount]    Request a price and fee
                                             estimate to prepare for
                                             a swap deal.

 help               Show this help information.

 pairs              List the available swap pairs.

 proposal [base] [symbol] [target_amount]   Create a deal proposal in which
                                            you want to receive a target
                                            amount denominated in SYMBOL.

 status [dealID]    Check on the status of a deal or deal proposal.
