// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {GreenSupplyChain1155} from "../src/GreenSupplyChain1155.sol";

// Los tests validan: gestión de usuarios, creación y transformación con features, flujo con aceptación/rechazo, consumo, 
// rutas inválidas, pausa y bloqueo de transferencias directas.

contract UserManagementTest is Test {
    GreenSupplyChain1155 sc;
    address admin = address(0xA11CE);   // makeAddr("admin");
    address producer = address(0xBEEF); //makeAddr("producer")
    address factory  = address(0xFACA); // makeAddr("factory")
    address retailer = address(0xCAFE); // makeAddr("retailer")
    address consumer = address(0xC0DE); // makeAddr("consumer");

    function setUp() public {
        vm.startPrank(admin);
        sc = new GreenSupplyChain1155("https://base.example/");
        vm.stopPrank();
    }

    function testRegisterApproveFlow() public {
        // Registrar usuarios
        vm.prank(producer);
        sc.register(GreenSupplyChain1155.Role.PRODUCER);

        vm.prank(factory);
        sc.register(GreenSupplyChain1155.Role.FACTORY);

        vm.prank(retailer);
        sc.register(GreenSupplyChain1155.Role.RETAILER);

        vm.prank(consumer);
        sc.register(GreenSupplyChain1155.Role.CONSUMER);

        // Aprobar por admin
        vm.startPrank(admin);
        sc.approveUser(producer, GreenSupplyChain1155.Role.PRODUCER);
        sc.approveUser(factory,  GreenSupplyChain1155.Role.FACTORY);
        sc.approveUser(retailer, GreenSupplyChain1155.Role.RETAILER);
        sc.approveUser(consumer, GreenSupplyChain1155.Role.CONSUMER);
        vm.stopPrank();

        // Admin no es actor operativo: opcionalmente está en users con NONE
        (GreenSupplyChain1155.Role r, GreenSupplyChain1155.UserStatus s) = sc.users(admin);
        assertEq(uint256(r), uint256(GreenSupplyChain1155.Role.NONE));
        assertEq(uint256(s), uint256(GreenSupplyChain1155.UserStatus.Approved));
    }

    function testRejectThenApprove() public {
        vm.prank(producer);
        sc.register(GreenSupplyChain1155.Role.PRODUCER);

        vm.prank(admin);
        sc.rejectUser(producer);

        // Se puede aprobar luego
        vm.prank(admin);
        sc.approveUser(producer, GreenSupplyChain1155.Role.PRODUCER);
    }

    function testCancelMyRegistration() public {
        vm.prank(producer);
        sc.register(GreenSupplyChain1155.Role.PRODUCER);

        vm.prank(producer);
        sc.cancelMyRegistration();
    }
}