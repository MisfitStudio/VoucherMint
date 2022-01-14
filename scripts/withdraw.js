const hardhat = require("hardhat");
const { ethers } = hardhat;
const chalk = require('chalk');

require('dotenv/config');

async function withdraw() {

    console.log(chalk.blueBright("Start to withdraw ETH from contract"))
    //set maxsupply 10
    let provider = new ethers.providers.InfuraProvider('rinkeby');
    let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    console.log( "wallet address: ", wallet.address)

    // get contract
    const misfit = await ethers.getContract("Misfit")
    console.log("misfit address: ", misfit.address)
    const balance = await provider.getBalance(misfit.address);
    console.log("balance",balance.toString())
    // const amount = "0.5"
    // const withdrawAmount = ethers.utils.parseEther(amount)
    await misfit.withdraw( balance );
    console.log(chalk.green(`successfully withdraw: ${balance.toString()} gwei`))

}

withdraw()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

