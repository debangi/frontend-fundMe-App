import { ethers } from './ethers-5.6.esm.min.js';
import { abi, contractAddress } from './constants.js';

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');
const balanceButton = document.getElementById('balanceButton');
const withdrawButton = document.getElementById('withdrawButton');

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

console.log(ethers);

async function connect() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('Metamask is present!');
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    connectButton.innerHTML = 'Connected';
    console.log('Connected!');
  } else {
    console.log('No metamask');
    connectButton.innerHTML = 'Please install metamask!';
  }
}

async function getBalance() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
    document.getElementById('balanceAmount').innerHTML =
      ethers.utils.formatEther(balance);
  }
}

// fund function
async function fund() {
  const ethAmount = document.getElementById('ethAmount').value;
  console.log(`funding with ${ethAmount}`);
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      // wait for this TX to finish
      await listenForTransactionMine(transactionResponse, provider);
      console.log('Done');
      document.getElementById('ethAmount').value = '';
      getBalance();
    } catch (e) {
      console.log('error');
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

// withdraw function
async function withdraw() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('Withdrawing...');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      getBalance();
    } catch (e) {
      console.log('error');
    }
  }
}
