// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFV2PlusWrapperConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract JackpotPool is Ownable, VRFV2PlusWrapperConsumerBase {
    
    address public constant VRF_WRAPPER = 0xb0407dbe851f8318bd31404A49e658143C982F23;
    
    uint32 public callbackGasLimit = 150_000;
    uint16 public requestConfirmations = 3;
    uint32 public constant NUM_WORDS = 1;
    
    uint256 public drawInterval = 1 hours;
    uint256 public lastDrawTime;
    uint256 public minJackpotThreshold = 0.001 ether;
    
    uint256 public currentRound;
    uint256 public activeRequestId;
    
    struct Round {
        uint256 requestId;
        uint256 randomWord;
        uint256 jackpotAmount;
        address winner;
        uint256 timestamp;
        bool fulfilled;
        bool paid;
    }
    
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => uint256) public requestIdToRound;
    
    event DrawRequested(uint256 indexed round, uint256 requestId, uint256 jackpotAmount);
    event DrawFulfilled(uint256 indexed round, uint256 randomWord);
    event WinnerSelected(uint256 indexed round, address indexed winner, uint256 amount);
    event FulfillmentFailed(uint256 indexed requestId, string reason);
    
    constructor() 
        Ownable(msg.sender) 
        VRFV2PlusWrapperConsumerBase(VRF_WRAPPER) 
    {
        lastDrawTime = block.timestamp;
    }
    
    receive() external payable {}
    
    function canExecuteDraw() public view returns (bool) {
        return 
            block.timestamp >= lastDrawTime + drawInterval &&
            address(this).balance >= minJackpotThreshold &&
            activeRequestId == 0;
    }
    
    function requestDraw(bool payInNative) external returns (uint256 requestId) {
        require(canExecuteDraw(), "Draw conditions not met");
        
        uint256 jackpotAmount = address(this).balance;
        require(jackpotAmount >= minJackpotThreshold, "Jackpot too small");
        
        uint256 vrfCost = payInNative 
            ? i_vrfV2PlusWrapper.calculateRequestPriceNative(callbackGasLimit, NUM_WORDS)
            : i_vrfV2PlusWrapper.calculateRequestPrice(callbackGasLimit, NUM_WORDS);
        
        require(jackpotAmount > vrfCost, "Not enough for VRF fee");
        
        currentRound++;
        
        bytes memory extraArgs = VRFV2PlusClient._argsToBytes(
            VRFV2PlusClient.ExtraArgsV1({nativePayment: payInNative})
        );
        
        uint256 paid;
        
        if (payInNative) {
            (requestId, paid) = requestRandomnessPayInNative(
                callbackGasLimit,
                requestConfirmations,
                NUM_WORDS,
                extraArgs
            );
        } else {
            (requestId, paid) = requestRandomness(
                callbackGasLimit,
                requestConfirmations,
                NUM_WORDS,
                extraArgs
            );
        }
        
        rounds[currentRound] = Round({
            requestId: requestId,
            randomWord: 0,
            jackpotAmount: jackpotAmount - paid,
            winner: address(0),
            timestamp: block.timestamp,
            fulfilled: false,
            paid: false
        });
        
        requestIdToRound[requestId] = currentRound;
        activeRequestId = requestId;
        lastDrawTime = block.timestamp;
        
        emit DrawRequested(currentRound, requestId, jackpotAmount - paid);
        
        return requestId;
    }
    
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        uint256 round = requestIdToRound[_requestId];
        if (round == 0) {
            emit FulfillmentFailed(_requestId, "Unknown request");
            return;
        }
        
        Round storage roundData = rounds[round];
        if (roundData.fulfilled) {
            emit FulfillmentFailed(_requestId, "Already fulfilled");
            return;
        }
        
        roundData.randomWord = _randomWords[0];
        roundData.fulfilled = true;
        activeRequestId = 0;
        
        emit DrawFulfilled(round, _randomWords[0]);
    }
    
    function selectWinner(uint256 round, address winner) external {
        Round storage roundData = rounds[round];
        
        require(roundData.fulfilled, "Random word not fulfilled");
        require(!roundData.paid, "Prize already paid");
        require(roundData.winner == address(0), "Winner already selected");
        require(winner != address(0), "Invalid winner");
        
        uint256 prize = roundData.jackpotAmount;
        roundData.winner = winner;
        roundData.paid = true;
        
        (bool success, ) = payable(winner).call{value: prize}("");
        require(success, "Prize transfer failed");
        
        emit WinnerSelected(round, winner, prize);
    }
    
    function getCurrentJackpot() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getRound(uint256 round) external view returns (Round memory) {
        return rounds[round];
    }
    
    function updateDrawInterval(uint256 newInterval) external onlyOwner {
        require(newInterval >= 30 minutes, "Too frequent");
        require(newInterval <= 7 days, "Too infrequent");
        drawInterval = newInterval;
    }
    
    function updateMinJackpot(uint256 newThreshold) external onlyOwner {
        require(newThreshold > 0, "Must be positive");
        minJackpotThreshold = newThreshold;
    }
    
    function updateCallbackGasLimit(uint32 newLimit) external onlyOwner {
        require(newLimit >= 50_000 && newLimit <= 500_000, "Invalid gas limit");
        callbackGasLimit = newLimit;
    }
    
    function emergencyWithdraw(address to) external onlyOwner {
        require(activeRequestId == 0, "Active request pending");
        uint256 balance = address(this).balance;
        (bool success, ) = payable(to).call{value: balance}("");
        require(success, "Withdraw failed");
    }
}