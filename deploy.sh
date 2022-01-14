#!/bin/sh
echo "=============================================="
echo "===== Deploy contract to rinkeby testnet ====="
echo "=============================================="
yarn hardhat deploy --network rinkeby
echo "=============================================="
echo "======== verify contract on etherscan ========"
echo "=============================================="
yarn hardhat etherscan-verify --network rinkeby

# yarn hardhat run scripts/transferToSafe.js --network rinkeby