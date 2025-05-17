// Copyright 2025, Ombruja
// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.25;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PaymentSplitter
 * @dev This contract allows to split Ether payments among a group of accounts. The sender does not need to be aware
 * that the Ether will be split in this way, since it is handled transparently by the contract.
 *
 * The split can be in equal parts or in any other arbitrary proportion. The way this is specified is by assigning each
 * account to a number of shares. Of all the Ether that this contract receives, each account will then be able to claim
 * an amount proportional to the percentage of total shares they were assigned. The distribution of shares is set at the
 * time of contract deployment and can't be updated thereafter.
 *
 * `PaymentSplitter` follows a _pull payment_ model. This means that payments are not automatically forwarded to the
 * accounts but kept in this contract, and the actual transfer is triggered as a separate step by calling the {release}
 * function.
 *
 * NOTE: This contract assumes that ERC20 tokens will behave similarly to native tokens (Ether). Rebasing tokens, and
 * tokens that apply fees during transfers, are likely to not be supported as expected. If in doubt, we encourage you
 * to run tests before sending real value to this contract.
 */
interface IPaymentSplitterUpgradeable {
    // // // // // // // // // // // // // // // // // // // //
    // EVENTS
    // // // // // // // // // // // // // // // // // // // //
    /**
     * @notice Emitted when a new payee is added
     * @param account the address of the payee
     * @param shares the number of shares owned by the payee
     */
    event PayeeAdded(address indexed account, uint256 shares);

    /**
     * @notice Emitted when a payee is removed
     * @param account the address of the payee
     * @param shares the number of shares owned by the payee
     */
    event PayeeRemoved(address indexed account, uint256 shares);

    /**
     * @notice Emitted when a payment is released
     * @param to the address of the payee
     * @param amount the amount of Ether released
     */
    event PaymentReleased(address indexed to, uint256 amount);

    /**
     * @notice Emitted when a payment is released
     * @param token The address of the token
     * @param to the address of the payee
     * @param amount the amount of Ether released
     */
    event ERC20PaymentReleased(
        address indexed token,
        address indexed to,
        uint256 amount
    );

    /**
     * @notice Emitted when a payment is received
     * @param from the address of the sender
     * @param amount the amount of Ether received
     */
    event PaymentReceived(address from, uint256 amount);

    // // // // // // // // // // // // // // // // // // // //
    // CONSTRUCTOR
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Initializes the contract
     * @param payees_ The addresses of the payees.
     * @param shares_ The number of shares owned by each payee.
     */
    function initialize(
        address[] memory payees_,
        uint256[] memory shares_
    ) external;

    // // // // // // // // // // // // // // // // // // // //
    // VERSION FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Tells the current version of the contract
     * @return The numbered version (major, minor, sub)
     */
    function version() external pure returns (uint256, uint256, uint256);

    // // // // // // // // // // // // // // // // // // // //
    // PAUSER FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @notice Pauses the contract
     */
    function pause() external;

    /**
     * @notice Unpauses the contract
     */
    function unpause() external;

    // // // // // // // // // // // // // // // // // // // //
    // ADMIN FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @dev Adds a new payee to the contract.
     * @param account The address of the payee to add.
     * @param shares_ The number of shares owned by the payee.
     */
    function addPayee(address account, uint256 shares_) external;

    /**
     * @dev Removes the shares of the specified address.
     * @param account The address whose shares are to be removed.
     */
    function removePayee(address account) external;

    // // // // // // // // // // // // // // // // // // // //
    // CORE FUNCTIONS
    // // // // // // // // // // // // // // // // // // // //

    /**
     * @dev Getter for the total shares held by payees.
     */
    function totalShares() external view returns (uint256);

    /**
     * @dev Getter for the total amount of Ether already released.
     */
    function totalReleased() external view returns (uint256);

    /**
     * @dev Getter for the total amount of `token` already released. `token` should be the address of an IERC20
     * contract.
     */
    function totalReleased(IERC20 token) external view returns (uint256);

    /**
     * @dev Getter for the amount of shares held by an account.
     */
    function shares(address account) external view returns (uint256);

    /**
     * @dev Getter for the amount of Ether already released to a payee.
     */
    function released(address account) external view returns (uint256);

    /**
     * @dev Getter for the amount of `token` tokens already released to a payee. `token` should be the address of an
     * IERC20 contract.
     */
    function released(
        IERC20 token,
        address account
    ) external view returns (uint256);

    /**
     * @dev Getter for the list of payees.
     */
    function payees() external view returns (address[] memory);

    /**
     * @dev Getter for the address of the payee number `index`.
     */
    function payee(uint256 index) external view returns (address);

    /**
     * @dev Getter for the amount of payee's releasable Ether.
     */
    function releasable(address account) external view returns (uint256);

    /**
     * @dev Getter for the amount of payee's releasable `token` tokens. `token` should be the address of an
     * IERC20 contract.
     */
    function releasable(
        IERC20 token,
        address account
    ) external view returns (uint256);

    /**
     * @dev Triggers a transfer to `account` of the amount of Ether they are owed, according to their percentage of the
     * total shares and their previous withdrawals.
     */
    function release(address payable account) external;

    /**
     * @dev Triggers a transfer to `account` of the amount of `token` tokens they are owed, according to their
     * percentage of the total shares and their previous withdrawals. `token` must be the address of an IERC20
     * contract.
     */
    function release(IERC20 token, address account) external;
}
