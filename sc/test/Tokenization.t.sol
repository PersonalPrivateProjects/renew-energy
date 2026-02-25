// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {GreenSupplyChain1155} from "../src/GreenSupplyChain1155.sol";

contract TokenizationTest is Test {
    GreenSupplyChain1155 sc;
    address admin    = address(0xA11CE);
    address producer = address(0xBEEF);
    address factory  = address(0xFACA);

   
    function setUp() public {
       vm.startPrank(admin);
       sc = new GreenSupplyChain1155("https://base.example/");
       vm.stopPrank();
   
       // Producer register + approve
       vm.prank(producer);
       sc.register(GreenSupplyChain1155.Role.PRODUCER);
       vm.prank(admin);
       sc.approveUser(producer, GreenSupplyChain1155.Role.PRODUCER);
   
       // Factory register + approve
       vm.prank(factory);
       sc.register(GreenSupplyChain1155.Role.FACTORY);
       vm.prank(admin);
       sc.approveUser(factory, GreenSupplyChain1155.Role.FACTORY);
    }


    function testMintRawAndTransformWithFeatures() public {
        vm.prank(producer);
        uint256 rawId = sc.mintRaw(100, "ipfs://raw.json", '{"tipo":"crudo","fuente":"solar"}');

        assertTrue(sc.exists(rawId));
        assertEq(sc.totalSupply(rawId), 100);
        assertEq(sc.parentOf(rawId), 0);
        assertEq(sc.uri(rawId), "ipfs://raw.json");
        assertEq(sc.featuresOf(rawId), '{"tipo":"crudo","fuente":"solar"}');

        // Transferencia controlada Producer -> Factory (aceptada)
        vm.prank(producer);
        sc.initiateTransfer(factory, rawId, 60);

        vm.prank(factory);
        sc.acceptTransfer(1);

        // Transformación: burn 50 del padre, mint child 50
        vm.prank(factory);
        uint256 childId = sc.transform(rawId, 50, "ipfs://cert.json", '{"tipo":"cert","kWh":50}');

        assertTrue(sc.exists(childId));
        assertEq(sc.totalSupply(childId), 50);
        assertEq(sc.balanceOf(factory, rawId), 10);   // 60 recibidos - 50 transformados
        assertEq(sc.balanceOf(factory, childId), 50); // acuñados en factory
        assertEq(sc.parentOf(childId), rawId);
        assertEq(sc.featuresOf(childId), '{"tipo":"cert","kWh":50}');
    }

    function testDirectTransferDisabled() public {
        vm.prank(producer);
        uint256 rawId = sc.mintRaw(10, "ipfs://raw.json", "{}");

        // Ya en setUp se aprueba a factory, así que no es necesario aprobarlo nuevamente aquí
        // vm.prank(admin);
        // sc.approveUser(factory, GreenSupplyChain1155.Role.FACTORY);

        vm.prank(producer);
        vm.expectRevert(GreenSupplyChain1155.DirectTransferDisabled.selector);
        sc.safeTransferFrom(producer, factory, rawId, 1, "");
    }
}