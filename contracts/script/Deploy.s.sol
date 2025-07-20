// === File: script/Deploy.s.sol ===
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/BlueFireFactory.sol";
import "../contracts/UnitProjectERC721.sol";

/**
 * @title Deploy
 * @notice Deployment script for Blue Fire platform
 * @dev Run with: forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying Blue Fire platform...");
        console.log("Deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy project implementation
        console.log("Deploying UnitProjectERC721 implementation...");
        UnitProjectERC721 projectImplementation = new UnitProjectERC721();
        console.log("UnitProjectERC721 implementation deployed at:", address(projectImplementation));
        
        // Deploy factory
        console.log("Deploying BlueFireFactory...");
        BlueFireFactory factory = new BlueFireFactory(address(projectImplementation));
        console.log("BlueFireFactory deployed at:", address(factory));
        
        vm.stopBroadcast();
        
        console.log("Deployment completed successfully!");
        console.log("Factory admin:", factory.admin());
        console.log("Project implementation:", factory.projectImplementation());
    }
} 