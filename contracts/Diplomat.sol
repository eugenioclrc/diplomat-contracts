// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract Diplomat is ERC1155, ERC1155Supply, Ownable {
    string public contractURI;

    mapping(uint256 => string) private _urls;
    mapping(uint256 => address) public itemAllowedMinter;
    mapping(address => uint256[]) private _diplomatsPerMinter;

    mapping (address => bool) admins;

    uint256 internal _idCounter;

    event NewDiplomat(address indexed minter, uint256 indexed id, string url);

    constructor() ERC1155("") {}

    function uri(uint256 id) public view override returns (string memory) {
        return _urls[id];
    }

    function getAllowedDiplomats(address minter) public view returns (uint256[] memory) {
        return _diplomatsPerMinter[minter];
    }

    function setContractURI(string memory contractURI_) external onlyOwner {
        contractURI = contractURI_;
    }

    function setAdmin(address admin, bool permission) external onlyOwner {
        if(permission) {
            admins[admin] = permission;
        } else {
            delete admins[admin];
        }
    }

    function createDiplomat(string memory _uri, address _minter) external {
        require(admins[msg.sender], "Only admins can create new diplomats");
        ++_idCounter;
        uint256 _id = _idCounter;
        itemAllowedMinter[_id] = _minter;
        _urls[_id] = _uri;
        _diplomatsPerMinter[_minter].push(_id);

        emit NewDiplomat(_minter, _id, _uri);

    }

    function mint(address account, uint256 id)
        external
    {
        bytes memory tempEmptyStringTest = bytes(_urls[id]); // Uses memory
        require(tempEmptyStringTest.length != 0, "Diplomat not setup");
        require(itemAllowedMinter[id] == msg.sender, "You are not allow");

        _mint(account, id, 1, "");
    }

    function batchMint(address[] calldata accounts, uint256 id)
        external
    {
        bytes memory tempEmptyStringTest = bytes(_urls[id]); // Uses memory
        require(tempEmptyStringTest.length != 0, "Diplomat not setup");
        require(itemAllowedMinter[id] == msg.sender, "You are not allow");

        for(uint256 i; i < accounts.length;) {
            _mint(accounts[i], id, 1, "");
            unchecked {
                ++i;
            }
        }
    }


    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        override(ERC1155, ERC1155Supply)
    {
        require(from == address(0), "cant transfer soulbound");
        for (uint256 i; i < ids.length;) {
            if (balanceOf(to, ids[i]) > 0) {
                revert("cant have the same diplomat twice");
            }

            unchecked {
                ++i;
            }
        }
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

}