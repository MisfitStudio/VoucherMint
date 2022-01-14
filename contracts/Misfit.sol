//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;
pragma abicoder v2; // required to accept structs as function parameters

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";


contract Misfit is  ERC721Enumerable, EIP712, Ownable {
    using Address for address;

    /// @notice Maximum limit of tokens that can ever exist
    uint256 public maxSupply;

    /// @notice Wallet to receive the funds from contract
    address payable public wallet; 

    /// @dev The base link that leads to the image / video of the token
    string private _baseTokenURI;

    // public sale flag, which will ignore _whiteListClaimedAddresses to enable whitelist users to buy at public sale
    bool public publicSale;
    /// @dev  list to check if user has redeemed before during whitelist phase
    mapping(address => uint256) private _whiteListClaimedAddresses;

    /// @dev list of public sale voucherId's which have been redeemed. ?? will it clash if i use signature?
    mapping(bytes => uint256) private _publicSaleVoucherIds;

    /// @dev Voucher for owner to sign and client to redeem
    struct NFTVoucher {
        // specify client to redeem this voucher
        address client;
        // ID to check if valid
        uint256 time;
        // token price
        uint256 price;
        // max amount to mint
        uint256 max_mint;

    }
    // event to know payment received, should i do this vs running a full node to detect??

    event VoucherClaimed(address from,uint256 time);
    /// @dev Setup ERC721, EIP712 and wallet
    constructor(
        uint256 maxSupply_,
        address payable wallet_
        )
        ERC721("Misfit", "MFT")
        EIP712("Misfit-Voucher", "1")
    {
        _baseTokenURI = "";
        maxSupply = maxSupply_;
        wallet = wallet_;
        publicSale = false;
    }


    /// @notice Redeem the voucher
    /// @param voucher Raw voucher info
    /// @param signature Voucher signature signed with owner's private key
    function redeem(address[] calldata sendTo,NFTVoucher calldata voucher, bytes calldata signature, uint numberWantToBuy)
        external
        payable
    {
        // make sure that the signer is authorized to mint NFTs
        // console.log("redeem called",voucher);
        _verify(voucher, signature);
        // console.log("redeem passed verify");
        // make sure this user hasn't been redeemed ?? bug here, why does == 1 trigger it??
        if (publicSale) {
            require(
                _publicSaleVoucherIds[signature] == 0,
                "redeem: Voucher has been redeemed"
            );
        } else {
            require(
                _whiteListClaimedAddresses[_msgSender()] == 0,
                "redeem: You have already redeemed before"
            );
        }


        require(
            voucher.time > block.timestamp ,
            "redeem: Voucher has expired"
        );
        require(
            sendTo.length == numberWantToBuy || sendTo.length == 1,
            "redeem: You did not specify correct sendTo addresses"
        );
        // make sure supply is lower than max supply
        uint256 supply = totalSupply();
        require(supply < maxSupply, "redeem: Sold out");

        // compute actual number of token to mint
        uint256 numberOfTokens;
        if (numberWantToBuy > voucher.max_mint) {
            numberWantToBuy = voucher.max_mint;
        }
        if (supply + numberWantToBuy > maxSupply) {
            numberOfTokens = maxSupply - supply;
        } else {
            numberOfTokens = numberWantToBuy;
        }

        // make sure that the redeemer is paying enough to cover the buyer's cost
        require(
            msg.value >= voucher.price * numberOfTokens,
            "redeem: Insufficient funds to redeem"
        );
        // first assign the token to the signer, to establish provenance on-chain
        for (uint256 i = 1; i <= numberOfTokens; i++) {
            uint256 tokenId = supply + i;

            // why not just trasnfer to msgSender??
            // _safeMint(owner(), tokenId);
            if (sendTo.length == 1) {
                _safeMint(sendTo[0],tokenId);
            } else {
                _safeMint(sendTo[i - 1],tokenId);
            }
            
        }
        
        // Update client's redeem ID. ?? inefficient? dont really need to store any value in there
        
        if (publicSale) {
            _publicSaleVoucherIds[signature] = 1;
        } else {
            _whiteListClaimedAddresses[_msgSender()] = 1;
        }
        emit VoucherClaimed(_msgSender(), block.timestamp);
    }

    /// @dev Verify signature (EIP-712)
    function _verify(NFTVoucher calldata voucher, bytes calldata signature)
        private
        view
    {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "NFTVoucher(address client,uint256 time,uint256 price,uint256 max_mint)"
                    ),
                    _msgSender(),
                    voucher.time,
                    voucher.price,
                    voucher.max_mint //encodeData hashes the array itself first
                    
                )
            )
        );
        require(
            owner() == ECDSA.recover(digest, signature),
            "redeem: Signature invalid or unauthorized"
        );
    }
    

    /// @notice Set baseURI to reveal NFT
    /// @param baseURI New base URI
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /// @notice Withdraw all funds from contract to wallet
    /// @param amount ETH amount to withdrawal (in Wei) 
    function withdraw(uint256 amount) external onlyOwner {
        Address.sendValue(wallet, amount);
    }

    /// @notice Get token ID list owned by certain address
    /// @param addr Address tokens' owner
    function tokensOfOwner(address addr)
        external
        view
        returns (uint256[] memory)
    {
        uint256 tokenCount = balanceOf(addr);
        uint256[] memory tokenList = new uint256[](tokenCount);
        for (uint256 i; i < tokenCount; i++) {
            tokenList[i] = tokenOfOwnerByIndex(addr, i);
        }
        return tokenList;
    }

    /// @dev Override _baseURI() in openzeppelin
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @dev set publicSale var
    function togglePublicSale() external onlyOwner {
        if (publicSale == false) {
            publicSale = true;
            return;
        } 
        publicSale = false;
        
    } 
}
