# wallet-evm

A simple and secure package to manage BIP-44 wallets for EVM (Ethereum Virtual Machine) blockchains. This package provides a clean API for creating, managing, and interacting with Ethereum-compatible wallets using BIP-39 seed phrases and BIP-44 derivation paths.

## Features

* **BIP-39 Seed Phrase Support**: Generate and validate BIP-39 mnemonic seed phrases
* **EVM Derivation Paths**: Support for BIP-44 standard derivation paths for Ethereum (m/44'/60')
* **Multi-Account Management**: Create and manage multiple accounts from a single seed phrase
* **EVM Address Support**: Generate and manage Ethereum-compatible addresses using ethers.js
* **Message Signing**: Sign and verify messages using EVM cryptography
* **Transaction Management**: Send transactions and get fee estimates with EIP-1559 support
* **ERC20 Support**: Query native token and ERC20 token balances using smart contract interactions
* **Batch Token Balance Queries**: Fetch balances for multiple ERC20 tokens in one call with `getTokenBalances`
* **TypeScript Support**: Full TypeScript definitions included
* **Memory Safety**: Secure private key management with memory-safe HDNodeWallet implementation
* **Provider Flexibility**: Support for both JSON-RPC URLs and EIP-1193 browser providers
* **Gas Optimization**: Support for EIP-1559 maxFeePerGas and maxPriorityFeePerGas
* **Fee Estimation**: Dynamic fee calculation with normal (1.1x) and fast (2.0x) multipliers

## Supported Networks

This package works with any EVM-compatible blockchain, including:

* **Ethereum**: Mainnet, Sepolia
* **Polygon**: Mainnet, Amoy
* **Binance Smart Chain (BSC)**: Mainnet, Testnet
* **Arbitrum**: One, Nova
* **Optimism**: Mainnet, Sepolia
* **Avalanche C-Chain**: Mainnet, Fuji
* **And many more...**

## Next Steps

<table data-card-size="large" data-view="cards"><thead><tr><th></th><th></th><th></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><i class="fa-code">:code:</i></td><td><strong>Node.js Quickstart</strong></td><td>Get started with WDK in a Node.js environment</td><td><a href="../../start-building/nodejs-bare-quickstart">nodejs-bare-quickstart</a></td></tr><tr><td><i class="fa-code">:code:</i></td><td><strong>WDK EVM Wallet Configuration</strong></td><td>Get started with WDK's EVM Wallet configuration</td><td><a href="wallet-evm/configuration">configuration</a></td></tr><tr><td><i class="fa-code">:code:</i></td><td><strong>WDK EVM Wallet API</strong></td><td>Get started with WDK's EVM Wallet API</td><td><a href="wallet-evm/api-reference">api-reference</a></td></tr><tr><td><i class="fa-code">:code:</i></td><td><strong>WDK EVM Wallet Usage</strong></td><td>Get started with WDK's EVM Wallet usage</td><td><a href="wallet-evm/usage">usage</a></td></tr></tbody></table>

***

### Need Help?

<table data-view="cards"><thead><tr><th></th><th></th><th></th><th></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><i class="fa-discord">:discord:</i></td><td><strong>Discord Community</strong></td><td>Connect with developers, ask questions, share your projects</td><td><a href="https://discord.gg/arYXDhHB2w" class="button primary">Join Community</a></td><td><a href="https://discord.gg/arYXDhHB2w">https://discord.gg/arYXDhHB2w</a></td></tr><tr><td><i class="fa-github">:github:</i></td><td><strong>GitHub Issues</strong></td><td>Report bugs, request features, and get technical help</td><td><a href="https://github.com/tetherto/wdk-core" class="button secondary">Open an Issue</a></td><td><a href="https://github.com/tetherto/wdk-core">https://github.com/tetherto/wdk-core</a></td></tr><tr><td><i class="fa-envelope">:envelope:</i></td><td><strong>Email Contact</strong></td><td>For sensitive or private matters, contact our team directly</td><td><a href="mailto:wallet-info.tether.io" class="button secondary">Send an email</a></td><td><a href="mailto:wallet-info.tether.io">mailto:wallet-info.tether.io</a></td></tr></tbody></table>
