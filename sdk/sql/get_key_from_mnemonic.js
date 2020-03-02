const cosmosjs = require("@cosmostation/cosmosjs");
const arrayBufferToHex = require('array-buffer-to-hex');
const chainId = "enigma-1";
const crypto = require('crypto');

const KEY = 'witness canyon foot sing song tray task defense float bottom town obvious faint globe door tonight alpha battle purse jazz flag author choose whisper';


function encrypt(text, password) {
    var cipher = crypto.createCipher('aes-256-ctr', password);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

const cosmos = cosmosjs.network("http://n3.scrt.cashmaney.com", chainId);
cosmos.setBech32MainPrefix("enigma");
const mnemonic = "trash list grow people nasty rookie pupil artefact stuff build buddy clock stairs desk spoil wedding slam village lounge keep essence pottery vicious move"
// cosmos.setPath("m/44'/118'/0'/0/0");
const address = cosmos.getAddress(mnemonic);
const ecpairPriv = cosmos.getECPairPriv(mnemonic);

const pubkey = "enigmapub1addwnpepqvya7p9g0wf6ql7gwmma6g8ry43nctt3xfdmq7dcvrv0yujpr2hvw49hm4n"

const priv =  mnemonic;
const dbPassword = "postgres";
const encryptionKey =+ KEY + ':' + dbPassword;
const enc_passwd = encrypt("postgres", encryptionKey);
// aka `private_key` in schema
const encPK = encrypt(priv, enc_passwd);
console.log("%s,%s,%s,%s,%s", pubkey, address, encPK, dbPassword, enc_passwd);

// console.log(`${address}, ${arrayBufferToHex(ecpairPriv)}`);