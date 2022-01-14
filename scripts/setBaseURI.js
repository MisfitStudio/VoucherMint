const hardhat = require("hardhat");
const { ethers } = hardhat;
const chalk = require('chalk');

require('dotenv/config');

async function setBaseURI() {


    console.log(chalk.blueBright("Start to set BaseURI of contract"))
    //set maxsupply 10
    let provider = new ethers.providers.InfuraProvider(process.env.NETWORK);
    let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    console.log("wallet address: ", wallet.address)

    // get contract
    const misfit = await ethers.getContract("Misfit")
    console.log("misfit address: ", misfit.address)

    const tx = await misfit.setBaseURI(process.env.METADATA_URI);
    await tx.wait()
    console.log("setBaseURI",tx)
    console.log(chalk.green('Succesfully set BaseURI: ',process.env.METADATA_URI))

}
//ipfs://ouraccountid/projectid/

// every token's baseURI, ipfs://ouraccountid/projectid/tokenId

setBaseURI()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

