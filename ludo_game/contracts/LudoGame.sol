// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LudoGame {
    error GameFull();
    error ZeroAddressDetected();

    uint8 playerCount;
    uint totalStepsRoundBoard = 32;
    uint totalStepsInGame= 36;

    struct Player {
        uint8 id;
        uint8 stepCounter;
        uint8 stepsLeft;
        bool lastStretch;
        bool inHouse;
        bool hasWon;
    }

    mapping(uint8 id=> Player) players;

    function rollDice() {
    }

    function createPlayer() {
        // Perform sanity check
        _checkAddressZero();

        // Increment player count up to player
        playerCount++;

        uint8 playerId = playerCount;
        if (playerId > 4) {
            revert GameFull();
        }

        // Create new player
        Player memory pl = Player(playerId, 0, true, false);

        // Add player to players mapping
        players[playerId] = pl;
    }

    function playGame(uint8 _playerId) external returns (uint8 steps_) {
        Player storage pl = players[_playerId];

        require(pl.id != 0,"Player not found");
        require(pl.hasWon, "Player Won! Game Over")

        uint256 currentSteps = rollDice();

        if (pl.stepCounter + currentSteps >= totalStepsRoundBoard) {
            pl.lastStretch = true; 
        }

        if (pl.stepCounter >= totalStepsRoundBoard) {

        }

        pl.stepCounter += currentSteps;
    }

    function rollDice() returns(uint256) {
        uint256 seed = block.timestamp / 100000000 & 0x7fffffff

        return (seed % 6) + 1
    }

    function _checkAddressZero() {
         if (msg.sender == address(0)) {
            revert ZeroAddressDetected();
        }
    }

    // SIMPLE LUDO BOARD
    /*

    */
}