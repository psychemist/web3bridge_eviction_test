import { ethers } from "hardhat";


async function main() {
    // Store contract and holder addresses
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const TOKEN_HOLDER = "0x82810e81CAD10B8032D39758C8DBa3bA47Ad7092";

    // ERC20 Token addresses
    const USDT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
    const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH

    // Impersonate mainnet account for forking
    const impersonatedSigner = await ethers.getImpersonatedSigner(TOKEN_HOLDER);

    // Get contracts from interfaces
    const ROUTER = await ethers.getContractAt("IUniswapV2Router01", ROUTER_ADDRESS, impersonatedSigner);
    const USDT_CONTRACT = await ethers.getContractAt("IERC20", USDT_ADDRESS, impersonatedSigner);
    const wETH_CONTRACT = await ethers.getContractAt("IERC20", WETH_ADDRESS, impersonatedSigner);

    // **** SWAP TOKENS FOR EXACT ETH **** //

    const amountOut = ethers.parseEther("0.1"); // Ether
    const amountInMax = ethers.parseUnits("300", 6); // USDT tokens
    const deadline = Math.floor(Date.now() / 1000) + (60 * 5);

    const usdtBal = await USDT_CONTRACT.balanceOf(impersonatedSigner.address);
    const ethBal = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("================================================");

    console.log("USDT Balance Before Swap1:", ethers.formatUnits(usdtBal, 6));
    console.log("ETH Balance Before Swap1:", ethers.formatEther(ethBal));

    await USDT_CONTRACT.approve(ROUTER, ethers.parseUnits("500", 6));

    await ROUTER.swapTokensForExactETH(
        amountOut,
        amountInMax,
        [USDT_ADDRESS, WETH_ADDRESS],
        impersonatedSigner.address,
        deadline
    );

    const usdtBalAfter = await USDT_CONTRACT.balanceOf(impersonatedSigner.address);
    const ethBalAfter = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("================================================");

    console.log("USDT Balance After Swap1:", ethers.formatUnits(usdtBalAfter, 6));
    console.log("ETH Balance After Swap1:", ethers.formatEther(ethBalAfter));


    // *** SWAP EXACT TOKENS FOR ETH *** //

    const amountIn = ethers.parseUnits("250", 6);
    const amountOutMin = ethers.parseEther("0.1");

    const usdtBalBeforeSwap = await USDT_CONTRACT.balanceOf(impersonatedSigner.address);
    const ethBalBeforeSwap = await ethers.provider.getBalance(impersonatedSigner.address);


    console.log("================================================");

    console.log(`USDT Balance Before Swap2: ${ethers.formatUnits(usdtBalBeforeSwap, 6)}`);
    console.log(`ETH Balance Before Swap2: ${ethers.formatEther(ethBalBeforeSwap)}`);

    await ROUTER.swapExactTokensForETH(
        amountIn,
        amountOutMin,
        [USDT_ADDRESS, WETH_ADDRESS],
        impersonatedSigner.address,
        deadline
    );

    const usdtBalAfterSwap = await USDT_CONTRACT.balanceOf(impersonatedSigner.address);
    const ethBalAfterSwap = await ethers.provider.getBalance(impersonatedSigner.address);

    console.log("================================================");

    console.log(`USDT Balance After Swap2: ${ethers.formatUnits(usdtBalAfterSwap, 6)}`);
    console.log(`ETH Balance After Swap2: ${ethers.formatEther(ethBalAfterSwap)}`);

    console.log("================================================");
}


main().catch((error) => {
    console.log(error)
    process.exit(1);
})