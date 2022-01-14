const hardhat = require("hardhat");
const { ethers } = hardhat;
const { MisfitMinter } = require('../lib')
const chalk = require('chalk');

require('dotenv/config');

async function signAndRedeem() {

    const testPrivateKeys = process.env.TEST_PRIVATE_KEY.split(',')
    console.log("testPrivateKeys: ", testPrivateKeys)

    //set maxsupply 10
    let provider = new ethers.providers.InfuraProvider(process.env.NETWORK);
    let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    console.log( "wallet address: ", wallet.address)

    // get contract
    const misfit = await ethers.getContract("Misfit")
    console.log("misfit address: ", misfit.address)

    // set min price
    const minPrice = ethers.utils.parseEther("0.0002");

    // sign a voucher
    const misfitMinter = new MisfitMinter({ address: misfit.address, signer: wallet })

    const currentSaleId = await misfit.currentSaleId();

    var testWallet;
    var voucher;
    var signature;

    for( let i = 0; i < testPrivateKeys.length; i++){

        // gen random wallet

        testWallet = new ethers.Wallet( testPrivateKeys[i], provider)
        console.log( "testWallet address: ", testWallet.address) 
        console.log(chalk.blueBright(`Start to redeem from address: ${testWallet.address}`))

        // sign random wallet a voucher
        voucher = {
            client: testWallet.address,
            saleId: currentSaleId.toNumber(),
            price: minPrice,
            amount: 1
        }
        signature = await misfitMinter.signVoucher(voucher)
        console.log("signature: ", signature)

        // redeem NFT
        const reedemRes = await misfit.connect(testWallet).redeem(voucher, signature,1, { value: minPrice.mul(1) })
        console.log("reedemRes",await reedemRes.wait())
        console.log(chalk.green("Successfully redeem: ", testWallet.address))
    }
}

signAndRedeem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
