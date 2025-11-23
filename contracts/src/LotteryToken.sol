// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IUniswapV2Factory.sol";

/**
 * @title LotteryToken
 * @notice ERC-20 token with automatic trading fees that fund a lottery jackpot
 * @dev All trading fees are automatically swapped to ETH and sent to lottery pool
 */
contract LotteryToken is ERC20, Ownable {
    
    IUniswapV2Router02 public immutable uniswapV2Router;
    address public immutable uniswapV2Pair;
    
    address public lotteryPool;
    
    // Tax configuration (in basis points: 100 = 1%)
    uint256 public buyTaxBps = 500;   // 5% buy tax
    uint256 public sellTaxBps = 500;  // 5% sell tax
    uint256 public constant MAX_TAX_BPS = 1000; // 10% max
    
    // Swap configuration
    uint256 public swapTokensAtAmount;
    bool private swapping;
    
    // Exclusions from fees
    mapping(address => bool) public isExcludedFromFees;
    
    // AMM pairs
    mapping(address => bool) public automatedMarketMakerPairs;
    
    event ExcludeFromFees(address indexed account, bool isExcluded);
    event SetAutomatedMarketMakerPair(address indexed pair, bool indexed value);
    event SwapAndSendToLottery(uint256 tokensSwapped, uint256 ethSent);
    event TaxUpdated(uint256 buyTax, uint256 sellTax);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address _lotteryPool
    ) ERC20(name, symbol) Ownable(msg.sender) {
        
        require(_lotteryPool != address(0), "Lottery pool cannot be zero address");
        
        // Uniswap V2 Router on Base
        IUniswapV2Router02 _router = IUniswapV2Router02(
            0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24
        );
        uniswapV2Router = _router;
        
        // Create pair
        uniswapV2Pair = IUniswapV2Factory(_router.factory())
            .createPair(address(this), _router.WETH());
        
        automatedMarketMakerPairs[uniswapV2Pair] = true;
        
        lotteryPool = _lotteryPool;
        
        // Set swap threshold to 0.05% of total supply
        swapTokensAtAmount = (totalSupply * 5) / 10000;
        
        // Exclude from fees
        isExcludedFromFees[msg.sender] = true;
        isExcludedFromFees[address(this)] = true;
        isExcludedFromFees[_lotteryPool] = true;
        isExcludedFromFees[address(0xdead)] = true;
        
        // Mint total supply to deployer
        _mint(msg.sender, totalSupply);
        
        // Approve router for swapback
        _approve(address(this), address(uniswapV2Router), type(uint256).max);
    }
    
    receive() external payable {}
    
    /**
     * @notice Override transfer function to apply taxes
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override {
        
        if (amount == 0) {
            super._update(from, to, 0);
            return;
        }
        
        // Swap collected fees to ETH
        uint256 contractBalance = balanceOf(address(this));
        bool canSwap = contractBalance >= swapTokensAtAmount;
        
        if (
            canSwap &&
            !swapping &&
            !automatedMarketMakerPairs[from] && // Not during buy
            from != owner() &&
            to != owner()
        ) {
            swapping = true;
            swapBack(contractBalance);
            swapping = false;
        }
        
        bool takeFee = !swapping;
        
        // Remove fees if sender or receiver is excluded
        if (isExcludedFromFees[from] || isExcludedFromFees[to]) {
            takeFee = false;
        }
        
        uint256 fees = 0;
        
        if (takeFee) {
            // SELL: tokens going to AMM pair
            if (automatedMarketMakerPairs[to] && sellTaxBps > 0) {
                fees = (amount * sellTaxBps) / 10000;
            }
            // BUY: tokens coming from AMM pair
            else if (automatedMarketMakerPairs[from] && buyTaxBps > 0) {
                fees = (amount * buyTaxBps) / 10000;
            }
            
            if (fees > 0) {
                super._update(from, address(this), fees);
                amount -= fees;
            }
        }
        
        super._update(from, to, amount);
    }
    
    /**
     * @notice Swap accumulated tokens for ETH and send to lottery pool
     */
    function swapBack(uint256 tokenAmount) private {
        if (tokenAmount == 0) return;
        
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = uniswapV2Router.WETH();
        
        try uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokenAmount,
            0,
            path,
            address(this),
            block.timestamp
        ) {
            uint256 ethBalance = address(this).balance;
            
            if (ethBalance > 0) {
                // Send all ETH to lottery pool
                (bool success, ) = lotteryPool.call{value: ethBalance}("");
                require(success, "ETH transfer to lottery failed");
                
                emit SwapAndSendToLottery(tokenAmount, ethBalance);
            }
        } catch {
            // Swap failed, continue without reverting
        }
    }
    
    /**
     * @notice Set new lottery pool address
     */
    function setLotteryPool(address _lotteryPool) external onlyOwner {
        require(_lotteryPool != address(0), "Cannot be zero address");
        lotteryPool = _lotteryPool;
    }
    
    /**
     * @notice Update buy and sell taxes
     */
    function updateTaxes(uint256 _buyTaxBps, uint256 _sellTaxBps) external onlyOwner {
        require(_buyTaxBps <= MAX_TAX_BPS, "Buy tax too high");
        require(_sellTaxBps <= MAX_TAX_BPS, "Sell tax too high");
        
        buyTaxBps = _buyTaxBps;
        sellTaxBps = _sellTaxBps;
        
        emit TaxUpdated(_buyTaxBps, _sellTaxBps);
    }
    
    /**
     * @notice Exclude or include address from fees
     */
    function excludeFromFees(address account, bool excluded) external onlyOwner {
        isExcludedFromFees[account] = excluded;
        emit ExcludeFromFees(account, excluded);
    }
    
    /**
     * @notice Set AMM pair
     */
    function setAutomatedMarketMakerPair(address pair, bool value) external onlyOwner {
        require(pair != uniswapV2Pair, "Cannot remove main pair");
        automatedMarketMakerPairs[pair] = value;
        emit SetAutomatedMarketMakerPair(pair, value);
    }
    
    /**
     * @notice Update swap threshold
     */
    function updateSwapTokensAtAmount(uint256 newAmount) external onlyOwner {
        require(newAmount >= totalSupply() / 100000, "Amount too low");
        require(newAmount <= totalSupply() / 1000, "Amount too high");
        swapTokensAtAmount = newAmount;
    }
}
