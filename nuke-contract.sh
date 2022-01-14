#!/bin/sh

echo "=============================================="
echo "======== withdraw eth ========"
echo "=============================================="
yarn hardhat run scripts/withdraw.js --network rinkeby
echo "=============================================="
echo "===== Destroy contract cache, be very hard to muck with it later====="
echo "=============================================="
rm -rf ./cache
rm -rf ./artifacts
rm -rf ./frontend/src/hardhat/*
rm -rf .openzeppelin/*