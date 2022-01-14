#!/bin/sh
echo "=============================================="
echo "===== reveal to ipfs network ====="
echo "=============================================="
yarn hardhat run scripts/setBaseURI.js --network rinkeby
echo "=============================================="
echo "======== withdraw eth ========"
echo "=============================================="
yarn hardhat run scripts/withdraw.js --network rinkeby