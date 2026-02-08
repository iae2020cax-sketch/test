const Web3 = require('web3');
// Replace with your contract's ABI
const contractABI = [ /* your contract ABI here */ ];
const contractAddress = 'YOUR_CONTRACT_ADDRESS'; // your deployed contract address

const providerUrl = 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID';
const privateKey = 'YOUR_PRIVATE_KEY'; // Your wallet's private key

exports.handler = async (event) => {
  const { action, username, password } = JSON.parse(event.body);

  const web3 = new Web3(providerUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  const contract = new web3.eth.Contract(contractABI, contractAddress);

  if (action === 'register') {
    // Hash password
    const hashedPassword = web3.utils.sha3(password);
    try {
      const tx = contract.methods.registerUser(username, hashedPassword);
      const gas = await tx.estimateGas({ from: account.address });
      const gasPrice = await web3.eth.getGasPrice();

      const signedTx = await web3.eth.accounts.signTransaction(
        {
          to: contractAddress,
          data: tx.encodeABI(),
          gas,
          gasPrice,
        },
        privateKey
      );

      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Registration successful', transactionHash: receipt.transactionHash }),
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Registration failed', error: error.message }),
      };
    }

  } else if (action === 'login') {
    // Hash the input password
    const hashedPassword = web3.utils.sha3(password);
    try {
      // Call verifyUser (assumed to be a view function)
      const isValid = await contract.methods.verifyUser(username, hashedPassword).call();

      if (isValid) {
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Login successful' }),
        };
      } else {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Invalid username or password' }),
        };
      }
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error during login', error: error.message }),
      };
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid action' }),
    };
  }
};
