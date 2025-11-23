// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IVRFCoordinatorV2Plus {
    function requestRandomWords(
        bytes32 keyHash,
        uint256 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        bytes memory extraArgs
    ) external payable returns (uint256 requestId);
}