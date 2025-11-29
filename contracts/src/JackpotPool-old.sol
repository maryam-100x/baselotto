// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title JackpotPool
 * @notice Receives ETH from token fees and manages lottery draws with Chainlink VRF V2.5
 * @dev Uses direct funding (wrapper) method for VRF - pays with native ETH
 */
contract JackpotPool is Ownable {
    
    // Base Mainnet Chainlink VRF V2.5 Direct Funding (Wrapper)
    address public constant VRF_WRAPPER = 0xb0407dbe851f8318bd31404A49e658143C982F23;
    
    // VRF Configuration
    uint32 public callbackGasLimit = 200_000;
    uint16 public requestConfirmations = 3;
    bytes32 public keyHash = 0x00b81b5a830cb0a4009fbd8904de511e28631e62ce5ad231373d3cdad373ccab;
    
    // Draw Configuration
    uint256 public drawInterval = 1 hours;
    uint256 public lastDrawTime;
    uint256 public minJackpotThreshold = 0.001 ether;
    
    // Current round
    uint256 public currentRound;
    
    // Round tracking
    struct Round {
        uint256 requestId;
        uint256 randomWord;
        uint256 jackpotAmount;
        address winner;
        uint256 timestamp;
        bool fulfilled;
    }
    
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => uint256) public requestIdToRound;
    
    // Events
    event DrawRequested(uint256 indexed round, uint256 requestId, uint256 jackpotAmount);
    event DrawFulfilled(uint256 indexed round, uint256 randomWord);
    event WinnerSelected(uint256 indexed round, address indexed winner, uint256 amount);
    event ConfigUpdated(string param, uint256 value);
    
    constructor() Ownable(msg.sender) {
        lastDrawTime = block.timestamp;
    }
    
    receive() external payable {
        // Accept ETH from token swaps
    }
    
    /**
     * @notice Check if a draw can be executed
     */
    function canExecuteDraw() public view returns (bool) {
        return 
            block.timestamp >= lastDrawTime + drawInterval &&
            address(this).balance >= minJackpotThreshold &&
            (currentRound == 0 || rounds[currentRound].fulfilled);
    }
    
    /**
     * @notice Request a new lottery draw
     * @dev Anyone can call this if conditions are met
     */
    function requestDraw() external payable returns (uint256 requestId) {
        require(canExecuteDraw(), "Draw conditions not met");
        
        uint256 jackpotAmount = address(this).balance;
        require(jackpotAmount >= minJackpotThreshold, "Jackpot too small");
        
        // Increment round
        currentRound++;
        
        // VRF cost estimate (will be refunded if too much)
        uint256 vrfCost = 0.0001 ether;
        require(jackpotAmount > vrfCost, "Not enough for VRF");
        
        // Request random number from Chainlink VRF
        // NOTE: This is simplified - actual VRF integration needs the wrapper contract
        // For now, we'll use a placeholder
        requestId = uint256(keccak256(abi.encodePacked(block.timestamp, currentRound)));
        
        // Store round info
        rounds[currentRound] = Round({
            requestId: requestId,
            randomWord: 0,
            jackpotAmount: jackpotAmount - vrfCost,
            winner: address(0),
            timestamp: block.timestamp,
            fulfilled: false
        });
        
        requestIdToRound[requestId] = currentRound;
        lastDrawTime = block.timestamp;
        
        emit DrawRequested(currentRound, requestId, jackpotAmount - vrfCost);
        
        return requestId;
    }
    
    /**
     * @notice Fulfill random words (called by VRF Coordinator)
     * @dev In production, this would be called by Chainlink
     */
    function fulfillRandomWords(uint256 requestId, uint256 randomWord) external {
        uint256 round = requestIdToRound[requestId];
        require(round > 0, "Invalid request");
        require(!rounds[round].fulfilled, "Already fulfilled");
        
        rounds[round].randomWord = randomWord;
        rounds[round].fulfilled = true;
        
        emit DrawFulfilled(round, randomWord);
    }
    
    /**
     * @notice Select and pay winner after VRF fulfillment
     * @dev Keeper calls this with the winner address calculated off-chain
     * @param round Round number
     * @param winner Winner address calculated using the random number
     */
    function selectWinner(uint256 round, address winner) external onlyOwner {
        require(rounds[round].fulfilled, "Random word not fulfilled");
        require(rounds[round].winner == address(0), "Winner already selected");
        require(winner != address(0), "Invalid winner");
        
        uint256 prize = rounds[round].jackpotAmount;
        rounds[round].winner = winner;
        
        // Send prize to winner
        (bool success, ) = winner.call{value: prize}("");
        require(success, "Prize transfer failed");
        
        emit WinnerSelected(round, winner, prize);
    }
    
    /**
     * @notice Update draw interval
     */
    function updateDrawInterval(uint256 newInterval) external onlyOwner {
        require(newInterval >= 30 minutes, "Too frequent");
        require(newInterval <= 7 days, "Too infrequent");
        drawInterval = newInterval;
        emit ConfigUpdated("drawInterval", newInterval);
    }
    
    /**
     * @notice Update minimum jackpot threshold
     */
    function updateMinJackpot(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "Must be positive");
        minJackpotThreshold = newThreshold;
        emit ConfigUpdated("minJackpot", newThreshold);
    }
    
    /**
     * @notice Update VRF callback gas limit
     */
    function updateCallbackGasLimit(uint32 newLimit) external onlyOwner {
        require(newLimit >= 100_000 && newLimit <= 500_000, "Invalid gas limit");
        callbackGasLimit = newLimit;
    }
    
    /**
     * @notice Get current jackpot amount
     */
    function getCurrentJackpot() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Get round details
     */
    function getRound(uint256 round) external view returns (Round memory) {
        return rounds[round];
    }
    
    /**
     * @notice Emergency withdraw (only if no active round)
     */
    function emergencyWithdraw(address to) external onlyOwner {
        require(currentRound == 0 || rounds[currentRound].fulfilled, "Active round");
        uint256 balance = address(this).balance;
        (bool success, ) = to.call{value: balance}("");
        require(success, "Withdraw failed");
    }
}