const { parentPort } = require("worker_threads");

parentPort.on("message", async (task) => {
  try {
    const { walletPrivateKey, rpc, tx } = task;

    const { ethers } = require("ethers");

    const provider = new ethers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(walletPrivateKey, provider);

    const sent = await wallet.sendTransaction(tx);
    const receipt = await sent.wait();

    parentPort.postMessage({
      success: true,
      hash: sent.hash,
      receipt
    });
  } catch (err) {
    parentPort.postMessage({
      success: false,
      error: err.message
    });
  }
});
