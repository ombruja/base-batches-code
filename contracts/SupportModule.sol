// Copyright 2025, Ombruja
// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.25;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {ISupportModule} from "./interfaces/ISupportModule.sol";

contract SupportModule is
    Initializable,
    ContextUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    ISupportModule
{
    // // // // // // // // // // // // // // // // // // // //
    // LIBRARIES, CONSTANTS, AND STRUCTS
    // // // // // // // // // // // // // // // // // // // //
    using SafeERC20 for IERC20;

    // Custom errors
    error InvalidPlatformSigner();
    error InvalidSigner();
    error InvalidSplitter();
    error NonceAlreadyUsed();
    error SignerAlreadyExists();
    error SignerDoesNotExist();

    // Custom errors
    error InsufficientUSDCAllowance();
    error InsufficientUSDCBalance();

    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    uint256 public constant USDC_ONE_DOLLAR = 1 * 10 ** 6; // 1 USD in 6 decimals
    uint256 public constant USDC_ONE_CENT = 1 * 10 ** 4; // 0.01 USD in 6 decimals

    // // // // // // // // // // // // // // // // // // // //
    // VARIABLES - REMEMBER TO UPDATE __gap
    // // // // // // // // // // // // // // // // // // // //

    uint256 private __unitPrice;
    IERC20 private __usdc;

    mapping(bytes32 => address) private __tokenIdHashToPaymentSplitter;

    mapping(address => bool) private __platformSigners;
    mapping(bytes32 => bool) private __nonceUsed;
    address[] private __platformSignerList;

    // // // // // // // // // // // // // // // // // // // //
    // CONSTRUCTOR
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Initializes the contract.
     */
    function __SupportModule_init(
        address usdcAddress_
    ) internal onlyInitializing {
        __AccessControl_init();
        __Context_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        __SupportModule_init_unchained(usdcAddress_);
    }

    function __SupportModule_init_unchained(
        address usdcAddress_
    ) internal onlyInitializing {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(URI_SETTER_ROLE, _msgSender());
        _grantRole(PAUSER_ROLE, _msgSender());
        _grantRole(UPGRADER_ROLE, _msgSender());

        _addPlatformSigner(_msgSender());

        _updateUSDC(usdcAddress_);
    }

    // // // // // // // // // // // // // // // // // // // //
    // OVERRIDE FUNCTIONS
    // The following functions are overrides required by Solidity.
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Supports the interface
     * @param interfaceId The interface id
     * @return True if the interface is supported, false otherwise
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {}

    // // // // // // // // // // // // // // // // // // // //
    // VERSION FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * [UPGRADABILITY]
     * @notice The function that supports new implementation contracts
     * @param newImplementation The new implementation contract
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}

    /**
     * @notice Tells the current version of the contract
     * @return The numbered version (major, minor, sub)
     */
    function versionSupportModule()
        external
        pure
        override
        returns (uint256, uint256, uint256)
    {
        return (0, 0, 1);
    }

    // // // // // // // // // // // // // // // // // // // //
    // PLATFORM SIGNER FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Adds a new platform signer
     * @param newPlatformSigner the new platform signer
     */
    function addPlatformSigner(
        address newPlatformSigner
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (newPlatformSigner == address(0)) {
            revert InvalidPlatformSigner();
        }
        if (_isPlatformSigner(newPlatformSigner)) {
            revert SignerAlreadyExists();
        }

        _addPlatformSigner(newPlatformSigner);
    }

    /**
     * @notice Adds a new platform signer
     * @param newPlatformSigner the new platform signer
     */
    function _addPlatformSigner(address newPlatformSigner) internal {
        __platformSigners[newPlatformSigner] = true;
        __platformSignerList.push(newPlatformSigner);

        emit PlatformSignerAdded(newPlatformSigner);
    }

    /**
     * @notice Removes a platform signer
     * @param oldPlatformSigner the old platform signer
     */
    function removePlatformSigner(
        address oldPlatformSigner
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (oldPlatformSigner == address(0)) {
            revert InvalidPlatformSigner();
        }
        if (!_isPlatformSigner(oldPlatformSigner)) {
            revert SignerDoesNotExist();
        }

        _removePlatformSigner(oldPlatformSigner);
    }

    /**
     * @notice Removes a platform signer
     * @param oldPlatformSigner the old platform signer
     */
    function _removePlatformSigner(address oldPlatformSigner) internal {
        __platformSigners[oldPlatformSigner] = false;
        for (uint256 i = 0; i < __platformSignerList.length; i++) {
            if (__platformSignerList[i] == oldPlatformSigner) {
                __platformSignerList[i] = __platformSignerList[
                    __platformSignerList.length - 1
                ];
                __platformSignerList.pop();
                break;
            }
        }
        emit PlatformSignerRemoved(oldPlatformSigner);
    }

    /**
     * @notice Gets the list of platform signers
     * @return The list of platform signers
     */
    function getPlatformSigners()
        external
        view
        override
        returns (address[] memory)
    {
        return _getPlatformSigners();
    }

    /**
     * @notice Gets the list of platform signers
     * @return The list of platform signers
     */
    function _getPlatformSigners() internal view returns (address[] memory) {
        return __platformSignerList;
    }

    /**
     * @notice Checks if a signer is a platform signer
     * @param signer the signer to check
     * @return True if the signer is a platform signer, false otherwise
     */
    function isPlatformSigner(
        address signer
    ) external view override returns (bool) {
        return _isPlatformSigner(signer);
    }

    /**
     * @notice Checks if a signer is a platform signer
     * @param signer the signer to check
     * @return True if the signer is a platform signer, false otherwise
     */
    function _isPlatformSigner(address signer) internal view returns (bool) {
        return __platformSigners[signer];
    }

    // // // // // // // // // // // // // // // // // // // //
    // PAYMENT RELATED FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Gets the price of a mint
     * @param amount The amount of mints
     * @return The price of the mints
     */
    function price(uint256 amount) external view override returns (uint256) {
        return _price(amount);
    }

    /**
     * @notice Gets the price of a mint
     * @param amount The amount of mints
     * @return The price of the mints
     */
    function _price(uint256 amount) internal view returns (uint256) {
        return _unitPrice() * amount;
    }

    /**
     * @notice Gets the unit price
     * @return The unit price
     */
    function unitPrice() external view override returns (uint256) {
        return _unitPrice();
    }

    /**
     * @notice Gets the unit price
     * @return The unit price
     */
    function _unitPrice() internal view returns (uint256) {
        return __unitPrice;
    }

    /**
     * @notice Sets the unit price
     * @param newUnitPrice The new unit price
     */
    function setUnitPrice(
        uint256 newUnitPrice
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        _setUnitPrice(newUnitPrice);
    }

    /**
     * @notice Sets the unit price
     * @param newUnitPrice The new unit price
     */
    function _setUnitPrice(uint256 newUnitPrice) internal {
        uint256 oldUnitPrice = _unitPrice();
        __unitPrice = newUnitPrice;

        emit UnitPriceSet(oldUnitPrice, newUnitPrice);
    }

    /**
     * @notice Gets the payment splitter for a token
     * @param tokenId The id of the token
     * @return The address of the payment splitter for the token
     */
    function paymentSplitterForToken(
        uint256 tokenId
    ) external view override returns (address) {
        return _paymentSplitterForToken(tokenId);
    }

    /**
     * @notice Gets the payment splitter for a token
     * @param tokenId The id of the token
     * @return The address of the payment splitter for the token
     */
    function _paymentSplitterForToken(
        uint256 tokenId
    ) internal view returns (address) {
        return
            __tokenIdHashToPaymentSplitter[
                keccak256(abi.encodePacked(tokenId))
            ];
    }

    /**
     * @notice Sets the payment splitter for a token
     * @param tokenIdHash The id of the token
     * @param splitter The address of the payment splitter
     
     */
    function setPaymentSplitter(
        bytes32 tokenIdHash,
        address splitter
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (splitter == address(0)) {
            revert InvalidSplitter();
        }

        _setPaymentSplitter(tokenIdHash, splitter);
    }

    /**
     * @notice Sets the payment splitter for a token
     * @param tokenIdHash The id of the token
     * @param splitter The address of the payment splitter
     
     */
    function _setPaymentSplitter(
        bytes32 tokenIdHash,
        address splitter
    ) internal {
        address oldSplitter = __tokenIdHashToPaymentSplitter[tokenIdHash];
        __tokenIdHashToPaymentSplitter[tokenIdHash] = splitter;

        emit PaymentSplitterSet(tokenIdHash, oldSplitter, splitter);
    }

    /**
     * @notice Gets the USDC address
     * @return The USDC address
     */
    function usdc() external view override returns (address) {
        return address(_usdc());
    }

    /**
     * @notice Gets the USDC address
     * @return The USDC address
     */
    function _usdc() internal view returns (IERC20) {
        return __usdc;
    }

    /**
     * @notice Updates the USDC address
     * @param usdcAddress_ The new USDC address
     */
    function updateUSDC(
        address usdcAddress_
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        _updateUSDC(usdcAddress_);
    }

    /**
     * @notice Updates the USDC address
     * @param usdcAddress_ The new USDC address
     */
    function _updateUSDC(address usdcAddress_) internal {
        address oldUsdcAddress = address(_usdc());
        __usdc = IERC20(usdcAddress_);

        emit USDCAddressUpdated(oldUsdcAddress, usdcAddress_);
    }

    // // // // // // // // // // // // // // // // // // // //
    // TRANSFER FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Transfers USDC to this contract
     * @param account The account of the sender
     * @param amount The total price of the mint
     */
    function _transferUsdcIn(address account, uint256 amount) internal {
        _usdc().safeTransferFrom(account, address(this), amount);
    }

    /**
     * @notice Transfers USDC from this contract
     * @param account The account of the sender
     * @param amount The total price of the mint
     */
    function _transferUsdcOut(address account, uint256 amount) internal {
        _usdc().safeTransfer(account, amount);
    }

    // // // // // // // // // // // // // // // // // // // //
    // HELPER FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //
    /**
     * @notice Logs a nonce as used
     * @param dataPayload The data payload of the mint
     */
    function _logNonceAsUsed(bytes memory dataPayload) internal {
        // Decode the data payload
        (bytes32 nonce, ) = abi.decode(dataPayload, (bytes32, bytes));

        __nonceUsed[nonce] = true;
    }

    /**
     * @notice Checks if a nonce has been used
     * @param nonce The nonce to check
     * @return True if the nonce has been used, false otherwise
     */
    function nonceUsed(bytes32 nonce) external view override returns (bool) {
        return _nonceUsed(nonce);
    }

    /**
     * @notice Checks if a nonce has been used
     * @param nonce The nonce to check
     * @return True if the nonce has been used, false otherwise
     */
    function _nonceUsed(bytes32 nonce) internal view returns (bool) {
        return __nonceUsed[nonce];
    }

    /**
     * @notice Checks if a mint is allowed
     * @param dataPayload The data payload of the mint
     * @param onchainIds The onchain ids of the mint
     * @param amounts The amounts of the mint
     * @param account The account of the mint
     */
    function mintAllowedCheck(
        bytes memory dataPayload,
        uint256[] memory onchainIds,
        uint256[] memory amounts,
        address account
    ) external view override {
        _mintAllowedCheck(dataPayload, onchainIds, amounts, account);
    }

    /**
     * @notice Checks if a mint is allowed
     * @param dataPayload The data payload of the mint
     * @param onchainIds The onchain ids of the mint
     * @param amounts The amounts of the mint
     * @param account The account of the mint
     */
    function _mintAllowedCheck(
        bytes memory dataPayload,
        uint256[] memory onchainIds,
        uint256[] memory amounts,
        address account
    ) internal view {
        // Decode the data payload
        (bytes32 nonce, bytes memory signature) = abi.decode(
            dataPayload,
            (bytes32, bytes)
        );

        // Check if the nonce is valid
        if (_nonceUsed(nonce)) {
            revert NonceAlreadyUsed();
        }

        // Get the signer of the message
        address platformSigner = ECDSA.recover(
            // bytes32 hash,
            MessageHashUtils.toEthSignedMessageHash(
                keccak256(
                    abi.encodePacked(
                        // bytes32 nonce,
                        nonce,
                        // address account,
                        account,
                        // uint256[] memory onchainIds,
                        onchainIds,
                        // uint256[] memory amounts
                        amounts
                    )
                )
            ),
            // bytes memory signature
            signature
        );

        if (!_isPlatformSigner(platformSigner)) {
            revert InvalidSigner();
        }
    }

    // // // // // // // // // // // // // // // // // // // //
    // GAP
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[44] private __gap;
}
