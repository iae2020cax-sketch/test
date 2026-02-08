const Web3 = require('web3');
const contractABI = /* your contract ABI */;
const contractAddress = 'YOUR_CONTRACT_ADDRESS';

exports.handler = async (event) => {
  const { username, password } = JSON.parse(event.body);

  // Initialize web3 and contract
  const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  // TODO: Sign transaction with server's wallet (or a specific account)
  // For demo, assume transaction is signed and sent

  try {
    // Call smart contract method to store user credentials (hashed)
    // You need to implement a method like registerUser(username, hashedPassword)
    // For simplicity, assume the method exists
    const tx = contract.methods.registerUser(username, web3.utils.sha3(password));
    const gas = await tx.estimateGas({ from: 'YOUR_WALLET_ADDRESS' });
    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: contractAddress,
        data: tx.encodeABI(),
        gas,
      },
      'YOUR_PRIVATE_KEY'
    );
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return { statusCode: 200, body: JSON.stringify({ message: 'User registered on blockchain' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Error registering user' }) };
  }
};
