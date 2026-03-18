// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Minimal IERC20 interface needed for the transferFrom function
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/**
 * @title AgentGasRouter
 * @dev A simple router to bundle Native MATIC and ERC-20 USDT into a single transaction.
 * This is used to fund autonomous agents with both payment and gas reserves.
 */
contract AgentGasRouter {
    /**
     * @dev Transfers native gas tokens and ERC-20 tokens to the agent in one call.
     * @param agentWallet The address of the deployed autonomous agent.
     * @param usdt The address of the accepted ERC-20 Token contract.
     * @param usdtAmount The amount of ERC-20 tokens to send.
     */
    function payAgent(
        address agentWallet,
        address usdt,
        uint256 usdtAmount
    ) external payable {
        // 1. Forward Native MATIC to the agent (used for gas reservoir)
        if (msg.value > 0) {
            (bool success, ) = agentWallet.call{value: msg.value}("");
            require(success, "AgentGasRouter: MATIC transfer failed");
        }
        
        // 2. Forward ERC-20 Token to the agent (used for task payment)
        // Note: The caller MUST have approved this contract to spend their USDT before calling.
        require(
            IERC20(usdt).transferFrom(msg.sender, agentWallet, usdtAmount),
            "AgentGasRouter: USDT transfer failed"
        );
    }
}
