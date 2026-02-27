// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import { GreenSupplyChain1155 } from "../src/GreenSupplyChain1155.sol";

contract Deploy is Script {
    /// @dev Ejecuta el deployment recibiendo el baseURI como argumento del script
    ///      usando --sig "run(string)" "<baseURI>".
    function run(string memory baseURI) external returns (GreenSupplyChain1155 instance) {
        // Comienza a firmar transacciones con la cuenta que pases por CLI (--private-key)
        vm.startBroadcast();

        instance = new GreenSupplyChain1155(baseURI);

        vm.stopBroadcast();

        // Log útil en consola
        console2.log("Deployed GreenSupplyChain1155 at:", address(instance));
    }
}