// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {GreenSupplyChain1155} from "../src/GreenSupplyChain1155.sol";

contract TransfersFlowTest is Test {
    GreenSupplyChain1155 sc;

    // Direcciones cortas (válidas en tests)
    address admin    = address(0xA11CE);
    address producer = address(0xBEEF);
    address factory  = address(0xFACA);
    address retailer = address(0xCAFE);
    address consumer = address(0xC0DE);

    function setUp() public {
        // Deploy
        vm.startPrank(admin);
        sc = new GreenSupplyChain1155("https://base.example/");
        vm.stopPrank();

        // 1) register
        vm.prank(producer);
        sc.register(GreenSupplyChain1155.Role.PRODUCER);
        vm.prank(factory);
        sc.register(GreenSupplyChain1155.Role.FACTORY);
        vm.prank(retailer);
        sc.register(GreenSupplyChain1155.Role.RETAILER);
        vm.prank(consumer);
        sc.register(GreenSupplyChain1155.Role.CONSUMER);

        // 2) approve (admin)
        vm.startPrank(admin);
        sc.approveUser(producer, GreenSupplyChain1155.Role.PRODUCER);
        sc.approveUser(factory,  GreenSupplyChain1155.Role.FACTORY);
        sc.approveUser(retailer, GreenSupplyChain1155.Role.RETAILER);
        sc.approveUser(consumer, GreenSupplyChain1155.Role.CONSUMER);
        vm.stopPrank();

        // 3) Mint inicial (Producer)
        vm.prank(producer);
        sc.mintRaw(100, "ipfs://raw.json", "{\"tipo\":\"crudo\"}");
        // => rawId = 1

        // 4) Producer -> Factory: 80 (aceptado)
        vm.prank(producer);
        sc.initiateTransfer(factory, 1, 80); // transferId = 1
        vm.prank(factory);
        sc.acceptTransfer(1);

        // 5) Factory transforma 70 a derivado (childId = 2)
        vm.prank(factory);
        sc.transform(1, 70, "ipfs://prod.json", "{\"tipo\":\"cert\",\"kWh\":70}");
        // Estado tras setUp:
        // - Producer: rawId(1) = 20
        // - Factory:  rawId(1) = 10, childId(2) = 70
        // - Retailer: 0
        // - Consumer: 0
    }

    function testInvalidFlowProducerToRetailerReverts() public {
        // Producer -> Retailer (flujo inválido)
        vm.prank(producer);
        vm.expectRevert(); // InvalidFlow(from=PRODUCER,to=RETAILER)
        sc.initiateTransfer(retailer, 1, 10);
    }

    function testRejectReturnsToSender() public {
        // Factory -> Retailer (pendiente)
        vm.prank(factory);
        sc.initiateTransfer(retailer, 2, 20); // transferId = 2

        // Retailer rechaza, tokens vuelven a Factory
        vm.prank(retailer);
        sc.rejectTransfer(2);

        // Factory debía tener 70 del childId(2); tras rechazo sigue con 70
        assertEq(sc.balanceOf(factory, 2), 70);
        assertEq(sc.balanceOf(retailer, 2), 0);
    }

    function testRetailerToConsumerAndRedeem() public {
        // Factory -> Retailer (acepta) 30 del childId(2)
        vm.prank(factory);
        sc.initiateTransfer(retailer, 2, 30); // transferId = 2
        vm.prank(retailer);
        sc.acceptTransfer(2);

        // Retailer -> Consumer (acepta) 25 del childId(2)
        vm.prank(retailer);
        sc.initiateTransfer(consumer, 2, 25); // transferId = 3
        vm.prank(consumer);
        sc.acceptTransfer(3);

        // Consumer redime 10 del childId(2)
        vm.prank(consumer);
        sc.redeem(2, 10);

        // Saldos finales:
        // Factory: 70 - 30 = 40
        // Retailer: 30 - 25 = 5
        // Consumer: 25 - 10 = 15
        assertEq(sc.balanceOf(factory, 2), 40);
        assertEq(sc.balanceOf(retailer, 2), 5);
        assertEq(sc.balanceOf(consumer, 2), 15);

        // totalSupply(2): 70 inicial - 10 quemados = 60
        assertEq(sc.totalSupply(2), 60);
    }

    function testPauseStopsMutations() public {
        // Pausa (admin)
        vm.prank(admin);
        sc.pause();

        // Registrar (nuevo) debería fallar
        address x = address(0x1111);
        vm.prank(x);
        vm.expectRevert(); // Pausable: paused
        sc.register(GreenSupplyChain1155.Role.PRODUCER);

        // Iniciar transferencia también debe fallar
        vm.prank(factory);
        vm.expectRevert();
        sc.initiateTransfer(retailer, 2, 1);

        // Unpause
        vm.prank(admin);
        sc.unpause();

        // Ahora sí debería permitir iniciar
        vm.prank(factory);
        sc.initiateTransfer(retailer, 2, 1);
    }
}