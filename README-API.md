# series of states in order


# 0 pre-launch and disabled state

**if you get 0 from webclient, you must check with /getDisabledState to know if you are in
- pre-launch
- after whitelist, waiting for internal sale
- after internal sale, waiting for public raffle
- after public raffle, waiting for another public raffle
- fully sold out

sample content - "please join our discord to get into our whitelist"

# 1 whitelist mint phase


 - choose number to mint
 - mint button

Users who are not on the whitelist should see
sample content - "Sorry you are not on our whitelist, please check out our news for public raffles"

# 2 internal mint phase
 - hardcoded number to mint
 - mint button

# 3 public raffle
 - join raffle 
 - show number of other raffler's dynamically while waiting for raffle to end? (1hr or so)
 - users should not be able to join raffle after winners are chosen
 - you win
    - number to mint
    - mint button
 - you lose
    - sample content: Please try again our next public raffle if its not sold out!
