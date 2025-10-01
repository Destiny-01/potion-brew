// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Potion
 * @notice A demo contract built on top of Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine).
 *
 * The purpose of this contract is to show how encrypted values (inputs, operations, and comparisons)
 * can be used in Solidity while preserving privacy. Players submit 5 encrypted values,
 * which are processed in a homomorphic computation pipeline:
 *
 * This results in a scaled potion "power score" that is *never revealed in plaintext* inside the EVM.
 * Each player keeps track of their **highest computed score** (also encrypted).
 *
 * Key Features:
 * - Encrypted inputs are submitted from clients using TFHE-WASM → encrypted → externalEuint handles.
 * - Homomorphic arithmetic (add/mul/gt/select) ensures no plaintext ever leaks.
 * - Each player only learns their own result and can see their best score (decrypted with permission).
 * - The best score is also made **publicly decryptable**, meaning the wider community can later
 *   request to reveal the leaderboard.
 *
 * This design simulates a "Potion Brewing Leaderboard" where results are encrypted but usable.
 */

import {FHE, externalEuint8, euint8, euint16, ebool, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract PotionBrew is SepoliaConfig {
    /// @notice Tracks the highest encrypted score of each player
    mapping(address => euint16) public highestPlayerGuess;

    /// @notice Tracks whether an address has participated before
    mapping(address => bool) public hasPlayed;

    /// @notice Ordered list of all unique players
    address[] public players;

    /**
     * @notice Emitted whenever a player computes a potion score.
     * @param value The encrypted potion score (euint16).
     **/
    event ComputeResult(euint16 value);

    /**
     * @notice Compute a player's potion score from 5 encrypted ingredients.
     * @param aExt Encrypted input #1 (external handle)
     * @param bExt Encrypted input #2 (external handle)
     * @param cExt Encrypted input #3 (external handle)
     * @param dExt Encrypted input #4 (external handle)
     * @param eExt Encrypted input #5 (external handle)
     * @param attestation Attestation data proving ciphertext validity
     *
     * @return result The newly computed potion score (encrypted)
     */
    function compute(
        externalEuint8 aExt,
        externalEuint8 bExt,
        externalEuint8 cExt,
        externalEuint8 dExt,
        externalEuint8 eExt,
        bytes calldata attestation
    ) public returns (euint16 result) {
        // TODO: Implement function to encrypt results from external inputs, compute the impute and emit the event back
    }

    /**
     * @notice Retrieve all players and their encrypted best scores.
     *
     * @return allPlayers List of player addresses
     * @return guesses List of encrypted best scores (euint16)
     */
    function getAllHighestGuesses() public view returns (address[] memory allPlayers, euint16[] memory guesses) {
        // TODO: Implement function to getAllHighestGuesses
    }
}
