// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../contracts/BlueFireFactory.sol";
import "../contracts/UnitProjectERC721.sol";

contract DeployLocal is Script {
    function run() external {
        // Use anvil's first account (has lots of ETH)
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        vm.startBroadcast(deployerPrivateKey);

        // Deploy implementation
        UnitProjectERC721 implementation = new UnitProjectERC721();
        console.log("Implementation deployed at:", address(implementation));

        // Deploy factory
        BlueFireFactory factory = new BlueFireFactory(address(implementation));
        console.log("Factory deployed at:", address(factory));

        // Create a test project
        uint256 projectId = factory.createProject(
            "Lagos Water Plant #1",
            "Lagos, Nigeria", 
            "AquaGen-3000",
            100 ether, // 100 ETH funding cap
            address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8) // anvil account #1 as beneficiary
        );
        
        address projectAddress = factory.getProjectAddress(projectId);
        console.log("Project #1 created at:", projectAddress);
        
        // Set Alice (operator) - anvil account #2
        factory.setAlice(projectId, address(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC));
        
        vm.stopBroadcast();
        
        // Print useful addresses for frontend integration
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("Factory Address:", address(factory));
        console.log("Project Address:", projectAddress);
        console.log("Admin Address (deployer):", address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266));
        console.log("Beneficiary Address:", address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8));
        console.log("Alice Address:", address(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC));
        console.log("Project ID:", projectId);
        console.log("\nRPC URL: http://localhost:8545");
        console.log("Chain ID: 31337");
    }
} 