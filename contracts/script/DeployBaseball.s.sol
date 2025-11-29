// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/LotteryToken.sol";
import "../src/JackpotPool.sol";

contract DeployBaseball is Script {
    
    // Token configuration
    string constant TOKEN_NAME = "Baseball";
    string constant TOKEN_SYMBOL = "BASEBALL";
    uint256 constant TOTAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("==========================================");
        console.log("BASEBALL LOTTERY DEPLOYMENT");
        console.log("==========================================");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("------------------------------------------");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy JackpotPool first
        console.log("\n[1/2] Deploying JackpotPool...");
        JackpotPool pool = new JackpotPool();
        console.log("JackpotPool deployed at:", address(pool));
        
        // Step 2: Deploy LotteryToken with pool address
        console.log("\n[2/2] Deploying LotteryToken...");
        LotteryToken token = new LotteryToken(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            TOTAL_SUPPLY,
            address(pool)
        );
        console.log("LotteryToken deployed at:", address(token));
        console.log("Uniswap Pair created at:", token.uniswapV2Pair());
        
        vm.stopBroadcast();
        
        // Print summary
        console.log("\n==========================================");
        console.log("DEPLOYMENT COMPLETE!");
        console.log("==========================================");
        console.log("LotteryToken:", address(token));
        console.log("JackpotPool:", address(pool));
        console.log("Uniswap Pair:", token.uniswapV2Pair());
        console.log("==========================================");
        console.log("\nSAVE THESE ADDRESSES!");
        console.log("You'll need them for the frontend.");
        console.log("==========================================");
    }
}
