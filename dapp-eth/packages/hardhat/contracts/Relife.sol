/**
 *Submitted for verification at sepolia.mantlescan.xyz on 2024-12-15
*/

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.4) (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v4.9.6

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (access/Ownable.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.0;

contract ReLife is Ownable {
    // Add constructor with initialOwner parameter
    constructor(address initialOwner) Ownable() {
    }

    // Structs
    struct Account {
        uint256 id;
        address userAddress;
        uint256 lifeCount;
        uint256 lastUpdated;
    }

    struct Position {
        int256 x;
        int256 y;
        int256 z;
    }

    struct Life {
        uint256 id;
        uint256 accountId;
        bytes1[] lifeEvents;
        uint256 lifeNumber;
        uint256 lastUpdated;
        Position position;
    }

    // State variables
    uint256 private accountIdCounter;
    uint256 private lifeIdCounter;
    mapping(address => Account) public accounts;
    mapping(address => Life[]) public lives;
    uint256 public totalLives;
    string[][] public script; // Array of 10 lists of Arweave transaction IDs

    // Events
    event AccountCreated(address indexed userAddress, uint256 id, uint256 timestamp);
    event LifeInitialized(address indexed userAddress, uint256 lifeId, Position position);
    event LifeEventAdded(address indexed userAddress, uint256 lifeId, bytes1 eve);

    // Modifiers
    modifier accountExists(address _address) {
        require(accounts[_address].userAddress != address(0), "Account does not exist");
        _;
    }

    // Functions
    function initAccount() public {
        require(accounts[msg.sender].userAddress == address(0), "Account already exists");

        accountIdCounter++;
        accounts[msg.sender] = Account({
            id: accountIdCounter,
            userAddress: msg.sender,
            lifeCount: 0,
            lastUpdated: block.timestamp
        });

        emit AccountCreated(msg.sender, accountIdCounter, block.timestamp);
    }

    function getAccount(address _address) external view returns (Account memory) {
        require(accounts[_address].userAddress != address(0), "Account not found");
        return accounts[_address];
    }

    function generateLife() public {
        lifeIdCounter++;
        Account storage account = accounts[msg.sender];
        account.lifeCount++;
        account.lastUpdated = block.timestamp;

        // Generate random coordinates using block information and user address
        // We'll use modulo to keep the numbers within a reasonable range (-1000 to 1000)
        int256 randomX = int256(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, "x")))) % 2000 - 1000;
        int256 randomY = int256(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, "y")))) % 2000 - 1000;
        int256 randomZ = int256(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, "z")))) % 2000 - 1000;

        Position memory position = Position({
            x: randomX,
            y: randomY,
            z: randomZ
        });

        // Create an array of 10 random life events
        bytes1[] memory initialEvents = new bytes1[](10);
        for (uint i = 0; i < 10; i++) {
            // Generate a random number between 0 and 255 (8 bits)
            uint8 randomValue = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.prevrandao, i))) % 256);
            initialEvents[i] = bytes1(randomValue);
        }

        Life memory newLife = Life({
            id: lifeIdCounter,
            accountId: account.id,
            lifeEvents: initialEvents,
            lifeNumber: account.lifeCount,
            lastUpdated: block.timestamp,
            position: position
        });

        lives[msg.sender].push(newLife);
        totalLives++;

        // Emit events for initialization and each life event
        emit LifeInitialized(msg.sender, lifeIdCounter, position);
        for (uint i = 0; i < 10; i++) {
            emit LifeEventAdded(msg.sender, lifeIdCounter, initialEvents[i]);
        }
    }

    function getLatestLife(address _address) external view accountExists(_address) returns (Life memory) {
        Life[] storage userLives = lives[_address];
        require(userLives.length > 0, "No lives found");
        return userLives[userLives.length - 1];
    }

    function getAllLives(address _address) external view accountExists(_address) returns (Life[] memory) {
        return lives[_address];
    }

    function getTotalLivesCount() external view returns (uint256) {
        return totalLives;
    }

    function insertEvent(uint256 listIndex, string memory arTxId) public {
        require(listIndex < 10, "List index must be less than 10");

        // If script array is not initialized, initialize it with 10 empty arrays
        if (script.length == 0) {
            script = new string[][](10);
        }

        // Add the new AR transaction ID to the specified list
        script[listIndex].push(arTxId);
    }

    function insertFullScript(string[][] memory _script) public onlyOwner {
        require(_script.length == 10, "Must provide exactly 10 lists");
        script = _script;
    }

    function getScript() public view returns (string[][] memory) {
        return script;
    }

    function getEvents(uint256 x) public view returns (string[] memory) {
        require(x < script.length, "X coordinate out of bounds");
        return script[x];
    }

    function getSpecEvent(uint256 x, uint256 y) public view returns (string memory) {
        require(x < script.length, "X coordinate out of bounds");
        require(y < script[x].length, "Y coordinate out of bounds");
        return script[x][y];
    }

    // Helper function to generate random events (simplified version)
    function generateRandomEvent() public view returns (bytes1) {
        uint8 randomValue = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.prevrandao))) % 256);
        return bytes1(randomValue);
    }
}