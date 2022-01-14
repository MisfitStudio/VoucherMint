const { expect, assert } = require("chai");
// const { getChainId } = require("hardhat");
const hardhat = require("hardhat");
const { toUSVString } = require("util");
const { ethers } = hardhat;
const { MisfitMinter } = require('../lib')
require("dotenv/config")
const aDay = 24*60*60*1000;
const minPrice = ethers.utils.parseEther("0.07");
function ethersDate(daysPlus) {
    return ethers.BigNumber.from(Math.floor(Date.now() / 1000) + (daysPlus * aDay))  //do i need to big number here?
}


async function voucherMint(address,connectedMisfit,misfit,owner,qty,firstIndex) {
    const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
    const voucher = {
        client: address,
        time: ethersDate(1),
        price: minPrice,
        max_mint: qty
    }
    // console.log("voucher",voucher)
    // console.log("got misfitMinter",misfitMinter);
    const signature = await misfitMinter.signVoucher(voucher);
    // console.log("got signature",signature);
    // console.log("misfit.address",misfit.address);
    // console.log("addr1.address",addr1.address);
    return await expect(
        connectedMisfit.redeem([address],voucher, signature,qty, { value: minPrice.mul(qty) })
    ).to.emit(misfit, "Transfer")
    .withArgs(ethers.constants.AddressZero, address, firstIndex)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


const maxSupply = process.env.MAX_SUPPLY;
const wallet = process.env.RECEIVE_WALLET_ADDRESS;
describe("MisfitMinter", function () {
    let owner, addr1, addr2;
    let Misfit,misfit, addr1Misfit;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        // await deployments.fixture();
        await deployments.fixture();
        misfit = await ethers.getContract("Misfit", owner);
        addr1Misfit = misfit.connect(addr1);
        addr2Misfit = misfit.connect(addr2)

    })

    it("Should redeem 1 NFT from a signed voucher", async function () {
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 1
        }
        // console.log("voucher",voucher)
        // console.log("got misfitMinter",misfitMinter);
        const signature = await misfitMinter.signVoucher(voucher);
        // console.log("got signature",signature);
        // console.log("misfit.address",misfit.address);
        // console.log("addr1.address",addr1.address);
        await expect(
            addr1Misfit.redeem([addr1.address],voucher, signature,1, { value: minPrice })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1)

    })
    it("customers cannot use each other's vouchers", async function () {
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 1
        }
        // console.log("voucher",voucher)
        // console.log("got misfitMinter",misfitMinter);
        const signature = await misfitMinter.signVoucher(voucher);
        // console.log("got signature",signature);
        // console.log("misfit.address",misfit.address);
        // console.log("addr1.address",addr1.address);
        await expect(
            addr2Misfit.redeem([addr2.address],voucher, signature,1, { value: minPrice })
        ).to.be.revertedWith("redeem: Signature invalid or unauthorized");

    });
    it("Should expire vouchers based on time", async function () {
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        
        const voucher = {
            client: addr1.address,
            time: ethersDate(-0.1),
            price: minPrice,
            max_mint: 1
        }
        // console.log("voucher",voucher)
        // console.log("got misfitMinter",misfitMinter);
        const signature = await misfitMinter.signVoucher(voucher);
        // console.log("got signature",signature);
        // console.log("misfit.address",misfit.address);
        // console.log("addr1.address",addr1.address);
        await expect(
            addr1Misfit.redeem([addr1.address],voucher, signature,1, { value: minPrice })
        ).to.be.revertedWith("redeem: Voucher has expired");

    });

    
    it("max supply should end minting", async function () {
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const maxSupply = await misfit.maxSupply();
        // console.log("maxSupply",maxSupply.toNumber())

        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: 0,
            max_mint: maxSupply + 1
        }
        // console.log("voucher",voucher)
        const signature = await misfitMinter.signVoucher(voucher);
        
        console.log("maxSupply + 1",maxSupply + 1,Array(Number(voucher.max_mint)).fill(addr1.address),voucher.max_mint)
        await expect(
            addr1Misfit.redeem([addr1.address],voucher, signature, Number(voucher.max_mint), { value: 0 })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1)
        console.log("maxSupply",maxSupply.toNumber())
        // .and.to.emit(misfit, 'Transfer') // transfer from minter to redeemer
        // .withArgs(owner.address, addr1.address, 1);

        const voucher2 = {
            client: addr2.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: maxSupply + 1
        }
        const signature2 = await misfitMinter.signVoucher(voucher2);
        // console.log("max supply got sig2",signature2,voucher2)
        await expect( 
            addr2Misfit.redeem([addr2.address],voucher2, signature2,1, { value: minPrice.mul(1) })
         ).to.be.revertedWith("redeem: Sold out");
    });

    it("Should have transfer event with on-chain provenance", async function () {
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 5
        }
        const signature = await misfitMinter.signVoucher(voucher);
        await expect(
            addr1Misfit.redeem(Array(Number(voucher.max_mint)).fill(addr1.address),voucher, signature,5, { value: minPrice.mul(5) })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1)
        .and.to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 2)
        .and.to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 3)
        .and.to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 4)
        .and.to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 5)

        //  transfer tokenId 5 to addr2
        await expect(
            addr1Misfit['safeTransferFrom(address,address,uint256)'](addr1.address, addr2.address, 5)
            // addr1Misfit.safeTransferFrom(addr1.address, owner.address, 0)
        ).to.emit(misfit, 'Transfer')
        .withArgs(addr1.address, addr2.address, 5);

    });

    it("Should fail to redeem if payment is not enough", async function () {
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 5
        };
        const signature = await misfitMinter.signVoucher(voucher);

        const payment = minPrice.sub(10000);
        await expect(
            addr1Misfit.redeem(Array(Number(voucher.max_mint)).fill(addr1.address),voucher, signature,5, { value: payment })
        ).to.be.revertedWith("redeem: Insufficient funds to redeem");
    });

    it("Should fail to redeem an NFT voucher that's signed by an unauthorized account", async function () {
        
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: addr1 }); // signed by addr1
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 5
        }
        const signature = await misfitMinter.signVoucher(voucher);
        await expect(
            addr1Misfit.redeem([addr1.address],voucher, signature,1, { value: minPrice.mul(1) })
        ).to.be.revertedWith("redeem: Signature invalid or unauthorized");
    });

    it("Should fail if redeem same voucher twice", async function () {
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 10
        };
        const signature = await misfitMinter.signVoucher(voucher);

        await expect(
            addr1Misfit.redeem(Array(5).fill(addr1.address),voucher, signature,5, { value: minPrice.mul(5) })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1)

        await expect(
            addr1Misfit.redeem(Array(5).fill(addr1.address),voucher, signature,5, { value: minPrice.mul(5) })
        ).to.be.revertedWith("redeem: You have already redeemed before");
    });

    it("Should fail if same eth address redeems with seperate vouchers during whitelist", async function () {
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 10
        };
        const signature = await misfitMinter.signVoucher(voucher);
        console.log("voucher",voucher,signature)
        await expect(
            addr1Misfit.redeem(Array(5).fill(addr1.address),voucher, signature,5, { value: minPrice.mul(5) })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1)

        const voucher2 = {
            client: addr1.address,
            time: ethersDate(1.1),
            price: minPrice,
            max_mint: 10
        };
        
        const signature2 = await misfitMinter.signVoucher(voucher2);
        console.log("voucher2",voucher2,signature2)
        await expect(
            addr1Misfit.redeem(Array(5).fill(addr1.address),voucher2, signature2,5, { value: minPrice.mul(5) })
        ).to.be.revertedWith("redeem: You have already redeemed before");
    });
    it("Only owner can set baseURI", async function () {
        // await misfit.setBaseURI("https://");
        await expect(
            addr1Misfit.setBaseURI("https://")
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should set baseURI by owner successfully", async function () {
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 10
        };
        const signature = await misfitMinter.signVoucher(voucher);

        await expect(
            addr1Misfit.redeem(Array(Number(voucher.max_mint)).fill(addr1.address),voucher, signature,10, { value: minPrice.mul(10) })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1)
        assert( await misfit.tokenURI(1) === "", "default BaseURI not right" )
        await misfit.setBaseURI("https://testurl/");
        assert( await misfit.tokenURI(1) === "https://testurl/1", "owner setBaseURI not right" )

    });

    it("Should have tokenURI after setting baseURI", async function () {
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner })
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 10
        }
        const signature = await misfitMinter.signVoucher(voucher);
        const tx1 = await addr1Misfit.redeem(Array(Number(voucher.max_mint)).fill(addr1.address),voucher, signature,10, { value: minPrice.mul(10) })
        await tx1.wait();
        assert(
            "" === await misfit.tokenURI(1),
            "tokenURI supposed to be empty"
        );
        const tx2 = await misfit.setBaseURI("https://");
        await tx2.wait();
        assert(
            "https://5" === await misfit.tokenURI(5),
            "wrong tokenURI"
        );
    });

    it("Should match the amount of tokens owned", async function () {
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 5
        }
        const signature = await misfitMinter.signVoucher(voucher);
        await addr1Misfit.redeem(Array(Number(voucher.max_mint)).fill(addr1.address),voucher, signature,5, { value: minPrice.mul(5) });

        const tokens = await misfit.tokensOfOwner(addr1.address);
        assert(tokens.length === 5);
    });

    it("Should only owner to withdraw", async function () {

        await expect(
            addr1Misfit.withdraw(5566)
        ).to.be.revertedWith("Ownable: caller is not the owner");        
    });

    it("Should withdraw by owner successfully", async function () {
        const wallet = await misfit.wallet();
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 5
        }
        const signature = await misfitMinter.signVoucher(voucher);
        // redeem by addr1
        const redeemTx = await addr1Misfit.redeem(Array(2).fill(addr1.address),voucher, signature,2, { value: minPrice.mul(2) });
        await redeemTx.wait();

        // get wallet balance before
        const walletBalance = await owner.provider.getBalance(wallet);
        // withdraw 1234 wei
        const withdrawTx = await misfit.withdraw(minPrice);
        await withdrawTx.wait();
        // get wallet balance after
        const walletBalanceAfter = await owner.provider.getBalance(wallet);

        assert(
            walletBalance.add(minPrice).eq(walletBalanceAfter),
            "withdraw amount not right"
        );
    });

    it("should have public_sale set to false",async function() {
        assert(
            await misfit.publicSale() === false,
            "Public sale should be set to false on init"
        )
    })
    it("only owner can togglePublicSale",async function() {
        assert(
            await addr1Misfit.publicSale() === false,
            "Public sale should be set to false on init"
        )
        await expect(
            addr1Misfit.togglePublicSale()
        ).to.be.revertedWith("Ownable: caller is not the owner");  
        const tx = await misfit.togglePublicSale();
        await tx.wait();
        assert(
            await addr1Misfit.publicSale() === true,
            "Public sale should be set to true after toggle"
        )


        const tx2 = await misfit.togglePublicSale();
        await tx2.wait();
        assert(
            await addr1Misfit.publicSale() === false,
            "Public sale should be set to false after 2nd toggle"
        )
    })
    it("whitelist buyers can buy in public sale",async function() {
        
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 5
        }
        const signature = await misfitMinter.signVoucher(voucher);
        await expect(
            addr1Misfit.redeem(Array(Number(voucher.max_mint)).fill(addr1.address),voucher, signature,5, { value: minPrice.mul(5) })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1)

        const tx = await misfit.togglePublicSale();
        await tx.wait();
        assert(
            await addr1Misfit.publicSale() === true,
            "Public sale should be set to true after toggle"
        )
        const voucher2 = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 5
        }
        const signature2 = await misfitMinter.signVoucher(voucher2);
        await expect(
            addr1Misfit.redeem(Array(Number(voucher.max_mint)).fill(addr1.address),voucher2, signature2,5, { value: minPrice.mul(5) })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 6)
    })
    it("public sale buyers cannot reuse same voucher",async function() {
        
        const tx = await misfit.togglePublicSale();
        await tx.wait();
        assert(
            await misfit.publicSale() === true,
            "Public sale should be set to true after toggle"
        )
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 5
        }
        const signature = await misfitMinter.signVoucher(voucher);
        await expect(
            addr1Misfit.redeem([addr1.address],voucher, signature,1, { value: minPrice.mul(1) })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1)


        await expect(
            addr1Misfit.redeem([addr1.address],voucher, signature,1, { value: minPrice.mul(1) })
        ).to.be.revertedWith("redeem: Voucher has been redeemed");
    })
    it("public sale buyers can use two vouchers",async function() {
        
        const tx = await misfit.togglePublicSale();
        await tx.wait();
        assert(
            await misfit.publicSale() === true,
            "Public sale should be set to true after toggle"
        )
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 5
        }
        const signature = await misfitMinter.signVoucher(voucher);
        await expect(
            addr1Misfit.redeem([addr1.address],voucher, signature,1, { value: minPrice.mul(1) })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1)

        const voucher2 = {
            client: addr1.address,
            time: ethersDate(2),
            price: minPrice,
            max_mint: 3
        }
        const signature2 = await misfitMinter.signVoucher(voucher2);
        await expect(
            addr1Misfit.redeem([addr1.address],voucher2, signature2,1, { value: minPrice.mul(1) })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 2)

    })

    it("sendTo addresses must match numberWantToBuy or be length 1",async function() {
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 5
        }
        const signature = await misfitMinter.signVoucher(voucher);
        await expect(
            addr1Misfit.redeem(Array(Number(2)).fill("fakeaddressstring9328u913"),voucher, signature,2, { value: minPrice.mul(5) })
        ).to.be.reverted; //cant seem to catch the error message exactly

        await expect(
            addr1Misfit.redeem(Array(Number(4)).fill(addr1.address),voucher, signature,2, { value: minPrice.mul(5) })
        ).to.be.revertedWith("redeem: You did not specify correct sendTo addresses");

        await expect(
            addr1Misfit.redeem(Array(Number(2)).fill(addr1.address),voucher, signature,2, { value: minPrice.mul(5) })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1)



        const voucher2 = {
            client: addr2.address,
            time: ethersDate(1.1),
            price: minPrice,
            max_mint: 5
        }
        const signature2 = await misfitMinter.signVoucher(voucher2);
        await expect(
            addr2Misfit.redeem(Array(Number(2)).fill(addr2.address),voucher2, signature2,1, { value: minPrice })
        ).to.be.revertedWith("redeem: You did not specify correct sendTo addresses");
        await expect(
            addr2Misfit.redeem(Array(Number(1)).fill(addr2.address),voucher2, signature2,5, { value: minPrice.mul(5) })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr2.address, 3)
    })

    it("sendTo addresses should work to mint tokens to the addresses",async function() {
        const misfitMinter = new MisfitMinter({ address: misfit.address, signer: owner });
        const voucher = {
            client: addr1.address,
            time: ethersDate(1),
            price: minPrice,
            max_mint: 3
        }
        const signature = await misfitMinter.signVoucher(voucher);

        await expect(
            addr1Misfit.redeem([addr1.address,addr2.address,addr2.address],voucher, signature,3, { value: minPrice.mul(5) })
        ).to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 1)
        .and.to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr2.address, 2)
        .and.to.emit(misfit, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr2.address, 3)
    })

    it("mint 10,000 nfts",async function() {
        this.timeout(60000000)
        const tx = await misfit.togglePublicSale();
        await tx.wait();

        let i = 1
        while (i <= 10) {
            console.log("minting id",i)
            await sleep(500)
            if (i % 2 == 0) {
                await voucherMint(addr1.address,addr1Misfit,misfit,owner,1,i)
            } else {
                await voucherMint(addr2.address,addr2Misfit,misfit,owner,1,i)
            }
            
            i++
        }
    })
});