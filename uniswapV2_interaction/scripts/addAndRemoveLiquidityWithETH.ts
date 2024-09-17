import { ethers } from "hardhat";


async function main() {
    // UniswapV2 contract address
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    // Token holder address
    const TOKEN_HOLDER = "0x82810e81CAD10B8032D39758C8DBa3bA47Ad7092";

    // ERC20 Token addresses
    const USDT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
    const USDT_WETH_PAIR_ADDRESS = "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852";

    // Impersonate mainnet account holder
    const impersonatedSigner = await ethers.getImpersonatedSigner(TOKEN_HOLDER);

    // Save contracts using custom interfaces and addresses
    const ROUTER = await ethers.getContractAt("IUniswapV2Router01", ROUTER_ADDRESS, impersonatedSigner);
    const USDT_CONTRACT = await ethers.getContractAt("IERC20", USDT_ADDRESS, impersonatedSigner);
    const LP_CONTRACT = await ethers.getContractAt("IERC20", USDT_WETH_PAIR_ADDRESS, impersonatedSigner);


    // **** ADD LIQUIDITY USING ETH **** //

    // Calculate minimumand desired token amounts
    const amountTokenDesired = ethers.parseUnits("125", 6);
    const amountTokenMin = ethers.parseUnits("50", 6);
    const amountETHDesired = ethers.parseEther("0.05");
    const amountETHMin = ethers.parseEther("0.04");

    // Calculate deadline before tranasaction reverts
    const deadline = Math.floor(Date.now() / 1000) + (60 * 5);

    // Get account token balances before adding liquidity
    const usdtBal = await USDT_CONTRACT.balanceOf(impersonatedSigner.address);
    const ethBal = await ethers.provider.getBalance(impersonatedSigner.address);
    const lpBal = await LP_CONTRACT.balanceOf(impersonatedSigner.address);

    console.log("====================================================================");

    console.log("Holder's USDT Balance Before Adding Liquidity", ethers.formatUnits(usdtBal, 6));
    console.log("Holder's ETH Balance Before Adding Liquidity", ethers.formatEther(ethBal));
    console.log("Holder's LP Balance Before Adding Liquidity", ethers.formatUnits(lpBal, 18));

    // Approve token contracts to spend on behalf of impersonated signer
    await USDT_CONTRACT.approve(ROUTER, ethers.parseUnits("125", 6));

    // Interact with the UniswapV2 Router function and add to liquidity pool
    await ROUTER.addLiquidityETH(
        USDT_ADDRESS,
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        impersonatedSigner.address,
        deadline,
        { value: amountETHDesired }
    );

    // Get account token balances after adding liquidity
    const usdtNewBal = await USDT_CONTRACT.balanceOf(impersonatedSigner.address);
    const ethNewBal = await ethers.provider.getBalance(impersonatedSigner.address);
    const lpNewBal = await LP_CONTRACT.balanceOf(impersonatedSigner.address);

    // Display new balances
    console.log("====================================================================");

    console.log("Holder's USDT Balance After Adding Liquidity", ethers.formatUnits(usdtNewBal, 6));
    console.log("Holder's ETH Balance After Adding Liquidity", ethers.formatEther(ethNewBal));
    console.log("Holder's LP Balance After Adding Liquidity", ethers.formatUnits(lpNewBal, 18));

    console.log("********************************************************************");

    console.log("Holder spent:", ethers.formatUnits((usdtNewBal - usdtBal), 6), "USDT");
    console.log("Holder spent:", ethers.formatEther((ethNewBal - ethBal)), "ETH");
    console.log("Holder received:", ethers.formatUnits((lpNewBal - lpBal), 18), "LP Tokens");

    console.log("********************************************************************");


    // *** REMOVE LIQUIDITY USING ETH **** //

    // Calculate amount of tokens desired and available to be removed
    const liquidity = ethers.parseUnits("0.0000005", 18);
    const amountTokenMinimum = ethers.parseUnits("50", 6);
    const amountETHMinimum = ethers.parseEther("0.02");

    // Get account token balances before removing liquidity
    const usdtNewBalBefore = await USDT_CONTRACT.balanceOf(impersonatedSigner.address);
    const ethNewBalBefore = await ethers.provider.getBalance(impersonatedSigner.address);
    const lpNewBalBefore = await LP_CONTRACT.balanceOf(impersonatedSigner.address);

    // Approve LP token contract to remove liquidity tokens from impersonated account
    await LP_CONTRACT.approve(ROUTER, ethers.parseUnits("0.1", 18));

    console.log("====================================================================");

    console.log("Holder's USDT Balance Before Removing Liquidity", ethers.formatUnits(usdtNewBalBefore, 6));
    console.log("Holder's ETH Balance Before Removing Liquidity", ethers.formatEther(ethNewBalBefore));
    console.log("Holder's LP Balance Before Removing Liquidity", ethers.formatUnits(lpNewBalBefore, 18));

    // Interact with UniswapV2Router function and remove from liquidity pool
    await ROUTER.removeLiquidityETH(
        USDT_ADDRESS,
        liquidity,
        amountTokenMinimum,
        amountETHMinimum,
        impersonatedSigner.address,
        deadline,
    );

    // Get account token balances after removing liquidity
    const usdtNewBalAfter = await USDT_CONTRACT.balanceOf(impersonatedSigner.address);
    const ethNewBalAfter = await ethers.provider.getBalance(impersonatedSigner.address);
    const lpNewBalAfter = await LP_CONTRACT.balanceOf(impersonatedSigner.address);

    // Display new balances
    console.log("====================================================================");

    console.log("Holder's USDT Balance After Removing Liquidity", ethers.formatUnits(usdtNewBalAfter, 6));
    console.log("Holder's ETH Balance After Removing Liquidity", ethers.formatEther(ethNewBalAfter));
    console.log("Holder's LP Balance After Removing Liquidity", ethers.formatUnits(lpNewBalAfter, 18));

    console.log("********************************************************************");

    console.log("Holder received:", ethers.formatUnits((usdtNewBalAfter - usdtNewBalBefore), 6), "USDT");
    console.log("Holder received:", ethers.formatEther((ethNewBalAfter - ethNewBalBefore)), "ETH");
    console.log("Holder spent:", ethers.formatUnits((lpNewBalAfter - lpNewBalBefore), 18), "LP Tokens");

    console.log("********************************************************************");

    console.log("====================================================================");
}



main().catch((error) => {
    console.log(error)
    process.exit(1);
})