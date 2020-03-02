const bip39 = require('bip39');
const cosmosjs = require('@cosmostation/cosmosjs');
const axios = require('axios');
const config = require('../config');

const os = require('os');
const pty = require('node-pty');
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const httpClient = axios.create({ baseURL: config.api });

const cosmos = cosmosjs.network(config.api, config.chainID);
cosmos.setBech32MainPrefix(config.prefix);
cosmos.setPath("m/44'/118'/0'/0/0");

const scrt = {
  spawnProcess() {
    return pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 8000,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env
    });
  },

  test(callback) {
    const ptyProcess = scrt.spawnProcess();

    ptyProcess.on('data', function(data) {
      callback(data)
    });

    ptyProcess.write('cd '+config.filePath+'\r');
    ptyProcess.write('./'+config.fileName+' status -n '+config.nodeHTTPS+'\r');
    ptyProcess.write('exit\r');
  },

  validateAddress(address) {
    // TODO: add this if necessary
    return true
  },

  // getFees(callback) {
  //   const url = `${config.api}api/v1/fees`;
  //
  //   httpClient
  //     .get(url)
  //     .then((res) => {
  //       callback(null, res)
  //     })
  //     .catch((error) => {
  //       callback(error)
  //     });
  // },

  createKey(name, password, callback) {
    const ptyProcess = scrt.spawnProcess();

    let buildResponse = "";

    ptyProcess.on('data', function(data) {
      process.stdout.write(data);

      if(data.includes("Enter a passphrase")) {
        // process.stdout.write('Setting password to '+password);
        ptyProcess.write(password+'\r');
      }

      if(data.includes("Repeat the passphrase")) {
        // process.stdout.write('Confirming password to '+password);
        ptyProcess.write(password+'\r');
      }

      if(os.platform() !== 'win32') {
        buildResponse = buildResponse + data;

        if(data.split(' ').length === 24) {


          const tmpData = buildResponse.split('\n');

          let publicKey = '';
          let address = '';
          let seedPhrase = '';

          for(let i = 0; i < tmpData.length; i++) {
            if(tmpData[i].indexOf("NAME:") >= 0 && tmpData[i].indexOf("TYPE:") >= 0 && tmpData[i].indexOf("ADDRESS:") >= 0 && tmpData[i].indexOf("PUBKEY:") >= 0) {

              let arr = tmpData[i+1].split('\t').filter(Boolean);
              address = arr[2].replace('\r','');
              publicKey = arr[3].replace('\r','');
              console.log(arr)

            }

            if(tmpData[i].split(" ").length === 24) {
              seedPhrase = tmpData[i].replace('\r','')
            }
          }

          ptyProcess.write('exit\r');

          callback(null, {
            address,
            publicKey,
            seedPhrase
          })
        }
      } else {
        if(data.includes("**Important**")) {
          // process.stdout.write(data);
          const tmpData = data.replace(/\s\s+/g, ' ').replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').split(' ');
          const address = tmpData[6];
          const publicKey = tmpData[7];
          const seedPhrase = tmpData.slice(33, 57).join(' ');

          ptyProcess.write('exit\r');
          callback(null, {
            address,
            publicKey,
            seedPhrase
          })
        }
      }


      if(data.includes("override the existing name")) {
        ptyProcess.write('n\r');
        ptyProcess.write('exit\r');
        callback('Symbol already exists')
      }
    });

    ptyProcess.write('cd '+config.filePath+'\r');
    ptyProcess.write('./'+config.fileName+' keys add '+name+'\r');
  },

  mint(amount, symbol, keyName, callback) {
    const ptyProcess = scrt.spawnProcess();

    ptyProcess.on('data', function(data) {
      // process.stdout.write(data);
      callback(null, data);
      ptyProcess.write('exit\r');
    });

    ptyProcess.write('cd '+config.filePath+'\r');
    ptyProcess.write('./'+config.fileName+' token mint --amount '+amount+' --symbol '+symbol+' --from '+keyName+' --chain-id='+config.chainID+' --node='+config.nodeData+' --trust-node\r');
  },

  generateKeyStore(privateKey, password) {
    // const result = BnbApiClient.crypto.generateKeyStore(privateKey, password);
    //
    // return result
    throw(Error('Unimplemented!'))
  },

  transferMsg(from, to, amount, asset, chainId) {
    return cosmos.getAccounts(from).then(data => {
      return cosmos.newStdMsg({
        msgs: [
          {
            type: "cosmos-sdk/MsgSend",
            value: {
              amount: [
                {
                  amount: String(amount * (10 ** config.scrtFractions)),
                  denom: asset
                }
              ],
              from_address: from,
              to_address: to
            }
          }
        ],
        chain_id: chainId,
        fee: {amount: [{amount: String(2000), denom: asset}], gas: String(200000)},
        memo: "",
        account_number: String(data.result.value.account_number),
        sequence: String(data.result.value.sequence)
      });
    });
  },

  transfer(mnemonic, publicTo, amount, asset, message, callback) {

    mnemonic = mnemonic.replace(/(\r\n|\n|\r)/gm, "");

    const publicFrom = cosmos.getAddress(mnemonic);
    const privateFrom = cosmos.getECPairPriv(mnemonic);

    // const privateFrom = BnbApiClient.crypto.getPrivateKeyFromMnemonic(mnemonic);
    // const publicFrom = BnbApiClient.crypto.getAddressFromPrivateKey(privateFrom, config.prefix);

    // const sequenceURL = `${config.api}api/v1/account/${publicFrom}/sequence`;
    //
    // const bnbClient = new BnbApiClient(config.api);
    // bnbClient.setPrivateKey(privateFrom);
    // bnbClient.initChain();
    scrt.transferMsg(publicFrom, publicTo, amount, asset, cosmos.chainId).then(msg => {
        console.log(`Sent SCRT TX: ${JSON.stringify(msg)}`);
        const signedTx = cosmos.sign(msg, privateFrom);
        cosmos.broadcast(signedTx).then(result => {
          console.log(`Response SCRT TX: ${JSON.stringify(result)}`);
          if (!result.hasOwnProperty('code') && result.code !== "0") {
              callback(null, result)
          } else {
              callback(result)
          }
        });
    })
    .catch((error) => {
      callback(error)
    });
  },

  getBalance(address, callback) {
    cosmos.getAccounts(address).then(data => { callback(null, data.balance ) });
  },

  createAccountWithMneomnic(password) {
    // todo: This doesn't work yet obviously
    const signMnemonic = bip39.generateMnemonic();
    return cosmos.getAddress(signMnemonic)
  },

  // getTransactionsForAddress(address, symbol, callback) {
  //   const url = `${config.api}api/v1/transactions?address=${address}&txType=TRANSFER&txAsset=${symbol}&side=RECEIVE`;
  //
  //   httpClient
  //     .get(url)
  //     .then((res) => {
  //       callback(null, res)
  //     })
  //     .catch((error) => {
  //       callback(error)
  //     });
  //
  // }

};

module.exports = scrt;
