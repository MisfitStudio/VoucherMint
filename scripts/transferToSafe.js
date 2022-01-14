const hardhat = require("hardhat");
const { ethers } = hardhat;
const chalk = require('chalk');

require('dotenv/config');

async function transferToSafe() {

    console.log(chalk.blueBright("transferToSafe"))

    let provider = new ethers.providers.InfuraProvider(process.env.NETWORK);
    let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    console.log("wallet address: ", wallet.address)

    // get contract
    const misfit = await ethers.getContract("Misfit")
    console.log("misfit address: ", misfit.address)
    const tx = await misfit.transferOwnership("0x544C59173333BD40B8F444785CeA1cC07bf72Fab");
    await tx.wait()
    console.log(chalk.green('transferOwnership done'),tx)

}

transferToSafe()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

