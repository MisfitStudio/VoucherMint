# 1. Marketing User sets up competiton    (Offchain competiton system)

    CompetitionName: String
    TwitterThreadId OR discordChannelId: Int?
    CompetitionType: 1 of ['manual','first x to reply','first x to retweet']
    TargetNumberWinners: Int

# 2. Marketing user can view each competitions responses  (Offchain competiton system)

    - Should display twitter thread responses / retweets as cards
    - Do not display responses from banList users, as well as whitelistIssued users.

# 3. Marketing user can select winners for each competition (Offchain competiton system)
    - (manual CompetitionType) should be able to click on cards to select winners
        - should display currently awarded users / TargetNumberWinners
            - do not need to restrict total number to TargetNumberWinners
    - (First to respond CompetitionType) should be able to be figured with x users, and automatically award winners
    - (Retweet CompetitionType) should be able to be figured with x users, and automatically award winners

# 4. Competition system should automatically enable whitelist for users (Offchain competiton system)

    - DM twitter users that they have won with a standard message to come visit our website
    - Discord users should be invited to a private unique channel , where they are told that they've won
        - TODO look at discord api 
    
    - Competition system should call Whitelist API with winners
        CompetitionName, userDiscordId OR userTwitterId, winNumber

        WhitelistAPI will also record timestamp of api call.
    
# 5. Website should enforce a twitter or discord register

    - have mechanism to link twitter/discord to current user (the one he didnt register with)
    - using eth public address, server should let client know that we are merging users (use case of users registering seperate accounts with twitter & discord but have the same public eth address)
    - users should know that they've won x whitelist spots
    - users should be able to input discord/twitter userIds to give their whitelist spots to
        - server only issues actual signed vouchers after this step
    - users should be able to mint a chosen number (subject to whitelist spot) if they've gotten whitelist spots
        - website gets signed voucher and calls mint function with it.

# 6. Launch public mint thru raffle system
    - call contracts togglePublicSale()
   - offchain raffle system that selects winners who participate from our website
   - uses whitelist mechanism to issue vouchers for minting


-- smart contract

    - should be compatible with opensea and have traits show up
    - go nuts about optimizing it for gas
    - go nuts about making sure it's secure