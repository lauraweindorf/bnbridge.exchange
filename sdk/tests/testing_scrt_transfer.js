const scrt = require('../helpers/scrt');

const MNEMONIC = '';
// const HTTP_API = 'https://testnet-dex.binance.org';
const HTTP_API = 'https://mainnet-node.chainofsecrets.org';
const ASSET = 'uscrt';
const AMOUNT = '2';
const ADDRESS_TO = 'enigma1qx5pppsfrqwlnmxj7prpx8rysxm2u5vz4hlwlr';
const MESSAGE = '';
const NETWORK = 'mainnet';
const PREFIX = 'enigma';

const mnemonic = "trash list grow people nasty rookie pupil artefact stuff build buddy clock stairs desk spoil wedding slam village lounge keep essence pottery vicious move"

cb = (err, result) => {
    if (err) {
        console.log(`failed: ${err}`);
    }
    console.log(`Success!`);
    console.log(JSON.stringify(result));
};


scrt.transfer(mnemonic, ADDRESS_TO, AMOUNT, ASSET, MESSAGE, cb);
