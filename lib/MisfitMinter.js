const ethers = require('ethers')
const { getChainId } = require("hardhat");

// These constants must match the ones used in the smart contract.
const SIGNING_DOMAIN_NAME = "Misfit-Voucher"
const SIGNING_DOMAIN_VERSION = "1"

/**
 * JSDoc typedefs.
 * 
 * @typedef {object} NFTVoucher
 * @property {string} client specify client to redeem this voucher
 * @property { number } time time voucher was issued
 * @property {ethers.BigNumber | number } price token price ??why do we need number
 * @property { number } max_mint max allowed to mint
 */

/**
 * MisfitMinter is a helper class that creates NFTVoucher objects and signs them, to be redeemed later by the Misfit contract.
 */
class MisfitMinter {

  /**
   * Create a new MisfitMinter targeting a deployed instance of the Misfit contract.
   * 
   * @param {Object} options
   * @param {ethers.Contract} contract an ethers Contract that's wired up to the deployed contract
   * @param {ethers.Signer} signer a Signer whose account is authorized to mint NFTs on the deployed contract
   */
  constructor({ address, signer }) {
    this.address = address
    this.signer = signer
  }

  /**
   * Creates a new NFTVoucher object and signs it using this LazyMinter's signing key.
   * 
   * @param {NFTVoucher} voucher NFT voucher
   * 
   * @returns {Promise<string>}
   */
  async signVoucher(voucher) {
    // price = ethers.utils.parseEther(minPrice.toString())
    // const voucher = { client, saleId, price, amount }
    const domain = await this._signingDomain()
    const types = {
      NFTVoucher: [
        { name: "client", type: "address" },
        { name: "time", type: "uint256" },
        { name: "price", type: "uint256" },
        { name: "max_mint", type: "uint256" },
      ]
    }
    const signed = await this.signer._signTypedData(domain, types, voucher)
    // console.log("minter signVoucher",voucher,signed)
    return signed
  }

 /**
   * Signs a message with the minter's key using Signer.signMessage
   * 
   * @param {String} message message
   * 
   * @returns {Promise<string>}
   */
  async signMessage(message) {

    const signed = await this.signer.signMessage(message)
    // console.log("minter signMessage",signed)
    return signed
  }

  /**
   * @private
   * @returns {object} the EIP-721 signing domain, tied to the chainId of the signer
   */
  async _signingDomain() {
    if (this._domain != null) {
      return this._domain
    }
    const chainId = await getChainId();
    this._domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this.address,
      chainId,
    }
    return this._domain
  }
}

module.exports = {
  MisfitMinter
}