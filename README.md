# Basic Sample Hardhat Project

This is a misfit NFT project.

To install dependencies
```shell
yarn 
```

A .env file is required
```
WEB3_INFURA_PROJECT_ID=
PRIVATE_KEY=
ETHERSCAN_API_KEY=
METADATA_URI_PREGVIOUSONE=ipfs://XXX/
METADATA_URI=ipfs://XXX
NETWORK=rinkeby
MAX_SUPPLY=10000
RECEIVE_WALLET_ADDRESS=XXX
TEST_PRIVATE_KEY = CUST1KEY,CUST2KEY,CUST3KEY
```

To run test
```
yarn hardhat test
#or 
yarn hardhat test test/<test>.js #for specific test
```

To deploy smart contract
```
yarn hardhat deploy
#or 
yarn hardhat deploy --network <yournetwork> #make sure you add .env variable and add network in hardhat.config.ts
```

To verify smart contract
```
yarn hardhat etherscan-verify --network <yournetwork>
```


To run rinkeby end-to-end test
```
yarn rinkeby-test
```