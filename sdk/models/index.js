const db = require('../helpers/db.js').db;
const config = require('../config');
//const bnb = require('../helpers/bnb.js');
const eth = require('../helpers/eth.js');
const emailer = require('../helpers/emailer.js');
const async = require('async');
//const generator = require('generate-password');
const crypto = require('crypto');
const sha256 = require('sha256');
const bip39 = require('bip39');
// const Web3 = require('web3');
const scrt = require('../helpers/scrt');
const algorithm = 'aes-256-ctr';
const KEY = 'witness canyon foot sing song tray task defense float bottom town obvious faint globe door tonight alpha battle purse jazz flag author choose whisper';

const models = {

  encrypt(text, password){
    let cipher = crypto.createCipher(algorithm,password);
    let crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
  },

  decrypt(text, password){
    let decipher = crypto.createDecipher(algorithm,password);
    let dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
  },

  descryptPayload(req, res, next, callback) {
    const {
      m,
      e,
      t,
      s,
      u,
      p
    } = req.body;

    if(!m || !e || !t ||!s || !u || !p) {
      res.status(501);
      res.body = { 'status': 501, 'success': false, 'message': 'Invalid payload' };
      return next(null, req, res, next)
    }

    const mnemonic = m.hexDecode();
    const encrypted = e.hexDecode();
    const time = t;
    const signature = s;

    const sig = {
      e: e,
      m: m,
      u: u,
      p: p,
      t: t
    };
    const seed = JSON.stringify(sig);
    const compareSignature = sha256(seed);

    if (compareSignature !== signature) {
      res.status(501);
      res.body = { 'status': 501, 'success': false, 'message': 'Signature mismatch' };
      return next(null, req, res, next)
    }

    const payload = decrypt(encrypted, mnemonic);

    let data = null;
    try {
      data = JSON.parse(payload);
      callback(data)
    } catch (ex) {
      res.status(501);
      res.body = { 'status': 501, 'success': false, 'message': ex };
      return next(null, req, res, next)
    }
  },

  decryptCall(req, res, next) {
    models.descryptPayload(req, res, next, (data) => {
      res.status(200);
      res.body = { 'status': 200, 'success': true, 'result': data };
      return next(null, req, res, next)
    })
  },

  // /**
  //  *  Creates a new BNB account for the token (privateKey)
  //  *  Creates a new Eth account for the token (privateKey)
  //  *  Inserts the BNB/Eth pairing into the DB with the Token details
  //  */
  // createToken(req, res, next) {
  //
  //   models.descryptPayload(req, res, next, (data) => {
  //
  //     let result = models.validateCreateToken(data);
  //
  //     if(result !== true) {
  //       res.status(400);
  //       res.body = { 'status': 400, 'success': false, 'result': result };
  //       return next(null, req, res, next)
  //     }
  //
  //     models.insertToken(data, (err, response) => {
  //       if(err || !response) {
  //         console.log(err);
  //         res.status(500);
  //         res.body = { 'status': 500, 'success': false, 'result': err };
  //         return next(null, req, res, next)
  //       } else {
  //         const uuid = response.uuid;
  //
  //         async.parallel([
  //           (callback) => { models.processBNBAccount(data, callback) },
  //           (callback) => { models.processEthAccount(data, callback) }
  //         ], (err, data) => {
  //           if(err) {
  //             console.log(err);
  //             res.status(500);
  //             res.body = { 'status': 500, 'success': false, 'result': 'Unable to process request' };
  //             return next(null, req, res, next)
  //           }
  //           let bnbUUID = data[0];
  //           let ethUUID = data[1];
  //
  //           models.updateTokenAddresses(uuid, bnbUUID, ethUUID, (err, updateResponse) => {
  //             models.getTokenInfo(uuid, (err, getResponse) => {
  //               if(err) {
  //                 console.log(err);
  //                 res.status(500);
  //                 res.body = { 'status': 500, 'success': false, 'result': 'Unable to retrieve token information' };
  //                 return next(null, req, res, next)
  //               }
  //
  //               res.status(205);
  //               res.body = { 'status': 200, 'success': true, 'result': getResponse };
  //               return next(null, req, res, next)
  //             })
  //           })
  //         })
  //
  //       }
  //     })
  //
  //
  //   })
  // },

  // validateCreateToken(body, response) {
  //   const {
  //     name,
  //     symbol,
  //     total_supply,
  //     erc20_address
  //   } = body;
  //   if(!name) {
  //     return 'name is required'
  //   }
  //   if(!symbol) {
  //     return 'symbol is required'
  //   }
  //   if(!total_supply) {
  //     return 'total_supply is required'
  //   }
  //   if(!erc20_address) {
  //     return 'erc20_address is required'
  //   }
  //
  //   return true
  // },
  //
  // insertToken(body, callback) {
  //   let {
  //     name,
  //     symbol,
  //     total_supply,
  //     erc20_address,
  //     mintable
  //   } = body;
  //
  //   total_supply = total_supply*100000000; // multiply by 8 deceimals of binance
  //   total_supply = total_supply.toFixed(0);
  //
  //   db.oneOrNone('insert into tokens (uuid, name, symbol, total_supply, erc20_address, mintable, eth_to_bnb_enabled, bnb_to_eth_enabled, created) values (md5(random()::text || clock_timestamp()::text)::uuid, $1, $2, $3, $4, $5, true, true, now()) returning uuid', [name, symbol, total_supply, erc20_address, mintable])
  //   .then((response) => {
  //     callback(null, response)
  //   })
  //   .catch(callback)
  // },

  // genPassword() {
  //   return generator.generate({
  //     length: 20,
  //     numbers: true,
  //     symbols: false,
  //     uppercase: true,
  //     strict: true
  //   })
  // },

  // processBNBAccount(body, callback) {
  //   const { symbol } = body;
  //   const keyName = config.keyPrepend+symbol+'_key';
  //   const password = models.genPassword();
  //
  //   bnb.createKey(keyName, password, (err, keyData) => {
  //     if(err) {
  //       console.log(err);
  //       callback(err)
  //     }
  //
  //     models.insertBNBAccount(keyName, password, keyData, callback)
  //   })
  // },

  // insertBNBAccount(keyName, keyPassword, keyData, callback) {
  //   const dbPassword = bip39.generateMnemonic();
  //   const password = KEY+':'+dbPassword;
  //   const aes256seed = models.encrypt(keyData.seedPhrase, password);
  //   const aes256password = models.encrypt(keyPassword, password);
  //
  //   db.oneOrNone('insert into bnb_accounts (uuid, public_key, address, seed_phrase, key_name, password, encr_key, created) values (md5(random()::text || clock_timestamp()::text)::uuid, $1, $2, $3, $4, $5, $6, now()) returning uuid;', [keyData.publicKey, keyData.address, aes256seed, keyName, aes256password, dbPassword])
  //   .then((response) => {
  //     callback(null, response)
  //   })
  //   .catch(callback)
  // },

  // processEthAccount(body, callback) {
  //   eth.createAccount((err, account) => {
  //     if(err) {
  //       console.log(err);
  //       return callback(err)
  //     }
  //
  //     models.insertEthAccount(account, callback)
  //   })
  // },

  // insertEthAccount(account, callback) {
  //   const dbPassword = bip39.generateMnemonic();
  //   const password = KEY+':'+dbPassword;
  //   const aes256private = models.encrypt(account.privateKey, password);
  //
  //   db.oneOrNone('insert into eth_accounts (uuid, private_key, address, encr_key, created) values (md5(random()::text || clock_timestamp()::text)::uuid, $1, $2, $3, now()) returning uuid;', [aes256private, account.address, dbPassword])
  //   .then((response) => {
  //     callback(null, response)
  //   })
  //   .catch(callback)
  // },
  //
  // updateTokenAddresses(uuid, bnbUUID, ethUUID, callback) {
  //   db.none('update tokens set bnb_account_uuid=$1, eth_account_uuid=$2 where uuid=$3;', [bnbUUID.uuid, ethUUID.uuid, uuid])
  //   .then(callback)
  //   .catch(callback)
  // },

  getTokenInfo(uuid, callback) {
    db.oneOrNone('select tok.uuid, tok.name, tok.symbol, tok.unique_symbol, tok.total_supply, tok.erc20_address, tok.mintable, tok.fee_per_swap, tok.minimum_swap_amount, bnb.address as bnb_address from tokens tok left join bnb_accounts bnb on bnb.uuid = tok.bnb_account_uuid where tok.uuid = $1;',[uuid])
    .then((token) => {
      callback(null, token)
    })
    .catch(callback)
  },

  /**
   *  Checks whether the account has been funded with the BNB tokens.
   *  Once true
   *  Issues a new token on BNB chain
   *  Mints new tokens on BNB chain
   *  Transfers the funds from our BNB account to their BNB account
   */
  // finalizeToken(req, res, next) {
  //   models.descryptPayload(req, res, next, (data) => {
  //
  //     let result = models.validateFinalize(data);
  //
  //     if(result !== true) {
  //       res.status(400);
  //       res.body = { 'status': 400, 'success': false, 'result': result };
  //       return next(null, req, res, next)
  //     }
  //
  //     let { uuid } = data;
  //
  //     models.getTokenInfo(uuid, (err, tokenInfo) => {
  //       if(err) {
  //         console.log(err);
  //         res.status(500);
  //         res.body = { 'status': 500, 'success': false, 'result': 'Unable to retrieve token information' };
  //         return next(null, req, res, next)
  //       }
  //
  //       models.validateBalances(tokenInfo, (err, code, balanceValidation) => {
  //         if(err) {
  //           console.log(err);
  //           res.status(code);
  //           res.body = { 'status': code, 'success': false, 'result': err };
  //           return next(null, req, res, next)
  //         }
  //
  //         models.getKey(tokenInfo.bnb_address, (err, key) => {
  //           if(err || !key) {
  //             console.log(err);
  //             res.status(500);
  //             res.body = { 'status': 500, 'success': false, 'result': 'Unable to retrieve key' };
  //             return next(null, req, res, next)
  //           }
  //
  //           bnb.issue(tokenInfo.name, tokenInfo.total_supply, tokenInfo.symbol, tokenInfo.mintable, key.key_name, key.password_decrypted, (err, issueResult) => {
  //             if(err) {
  //               console.log(err);
  //               res.status(500);
  //               res.body = { 'status': 500, 'success': false, 'result': err };
  //               return next(null, req, res, next)
  //             }
  //
  //             models.updateUniqueSymbol(uuid, issueResult.uniqueSymbol, (err, result) => {
  //               if(err) {
  //                 console.log(err);
  //                 res.status(500);
  //                 res.body = { 'status': 500, 'success': false, 'result': err };
  //                 return next(null, req, res, next)
  //               }
  //
  //               res.status(205);
  //               res.body = { 'status': 200, 'success': true, 'result': 'Token Issued' };
  //               return next(null, req, res, next)
  //             })
  //           })
  //         })
  //       })
  //     })
  //   })
  // },

  // validateFinalize(body) {
  //   let { uuid } = body;
  //
  //   if(!uuid) {
  //     return 'uuid is required'
  //   }
  //
  //   return true
  // },
  //
  // validateBalances(getResponse, callback) {
  //
  //   bnb.getFees((err, feesData) => {
  //     if(err) {
  //       console.log(err);
  //       return callback(err, 500)
  //     }
  //
  //     const fees = feesData.data;
  //     const reducer = (accumulator, currentValue) => accumulator + currentValue.fee;
  //     let totalRequired = fees.filter((fee) => {
  //       return ['issueMsg'].includes(fee.msg_type)
  //     })
  //     .reduce(reducer, 0);
  //
  //     bnb.getBalance(getResponse.bnb_address, (err, balances) => {
  //       if(err) {
  //         console.log(err);
  //         return callback(err, 500)
  //       }
  //
  //       let accountBalance = 0;
  //       if(balances.length > 0) {
  //         let bal = balances.filter((balance) => {
  //           return balance.symbol === 'BNB'
  //         }).map((balance) => {
  //           return balance.free
  //         });
  //
  //         if(bal.length > 0) {
  //           bal = bal[0];
  //           accountBalance = bal * 100000000
  //         } else {
  //           return callback('Unable to get balances.', 500)
  //         }
  //       }
  //
  //       if(accountBalance < totalRequired) {
  //         return callback('Insufficient funds.', 400, {
  //           accountBalance,
  //           totalRequired
  //         })
  //       } else {
  //         return callback(null, 200, {
  //           accountBalance,
  //           totalRequired
  //         })
  //       }
  //     })
  //   })
  // },

  getKey(address, callback) {
    db.oneOrNone('select key_name, seed_phrase as mnemonic, password, encr_key from bnb_accounts where address = $1;', [address])
    .then((key) => {
      if(key.encr_key) {
        const dbPassword = key.encr_key;
        const password = KEY+':'+dbPassword;
        key.password_decrypted = models.decrypt(key.password, password);
        key.mnemonic = models.decrypt(key.mnemonic, password)
      }
      callback(null, key)
    })
    .catch(callback)
  },

  // updateUniqueSymbol(uuid, uniqueSymbol, callback) {
  //   db.none('update tokens set unique_symbol=$1, processed=true where uuid=$2;', [uniqueSymbol, uuid])
  //   .then(callback)
  //   .catch(callback)
  // },

  /**
   *  Returns a list of tokens
   */
  getTokens(req, res, next) {
    db.manyOrNone('select tok.uuid, tok.name, tok.symbol, tok.unique_symbol, tok.total_supply, tok.minimum_swap_amount, tok.fee_per_swap, tok.listed, tok.listing_proposed, tok.listing_proposal_uuid, tok.erc20_address, tok.process_date, tok.eth_to_bnb_enabled, tok.bnb_to_eth_enabled, eth.address as eth_address from tokens tok left join eth_accounts eth on eth.uuid = tok.eth_account_uuid where processed is true;')
    .then((tokens) => {
      if (!tokens) {
        res.status(404);
        res.body = { 'status': 404, 'success': false, 'result': 'No tokens defined' };
        return next(null, req, res, next)
      } else {
        res.status(205);
        res.body = { 'status': 200, 'success': true, 'result': tokens };
        return next(null, req, res, next)
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
      res.body = { 'status': 500, 'success': false, 'result': err };
      return next(null, req, res, next)
    })
  },

  /**
   *  Returns a specific token details. Deposit addresses
   */
  getToken(req, res, next) {
    db.oneOrNone('select tok.uuid, tok.name, tok.symbol, tok.total_supply, tok.minimum_swap_amount, tok.fee_per_swap, tok.erc20_address, tok.process_date, eth.address as eth_address from tokens tok left join eth_accounts eth on eth.uuid = tok.eth_account_uuid where tok.uuid = $1 and processed is true;',[req.params.uuid])
    .then((token) => {
      if (!token) {
        res.status(404);
        res.body = { 'status': 404, 'success': false, 'result': 'No token defined' };
        return next(null, req, res, next)
      } else {
        res.status(205);
        res.body = { 'status': 200, 'success': true, 'result': token };
        return next(null, req, res, next)
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
      res.body = { 'status': 500, 'success': false, 'result': err };
      return next(null, req, res, next)
    })
  },

  /**
  * Returns the fees associated with the action
  */
  // getFees(req, res, next) {
  //   bnb.getFees((err, feesData) => {
  //     if(err) {
  //       console.log(err);
  //       res.status(500);
  //       res.body = { 'status': 500, 'success': false, 'result': err };
  //       return next(null, req, res, next)
  //     }
  //
  //     const data = feesData.data;
  //     let fees = data.filter((fee) => {
  //       return ['issueMsg', 'dexList', 'submit_proposal'].includes(fee.msg_type)
  //     });
  //
  //     fees.push({ msg_type: 'list_proposal_deposit', fee: config.list_proposal_deposit });
  //
  //     res.status(205);
  //     res.body = { 'status': 200, 'success': true, 'result': fees };
  //     return next(null, req, res, next)
  //   })
  // },

  /**
  * check to see if the BNB address for that token exists.
  * If so, we return the eth address
  * If not, we create a new address then return it.
  */
  swapToken(req, res, next) {
    models.descryptPayload(req, res, next, (data) => {
      let result = models.validateSwap(data);

      if(result !== true) {
        res.status(400);
        res.body = { 'status': 400, 'success': false, 'result': result };
        return next(null, req, res, next)
      }

      const {
        direction
      } = data;

      if(direction === 'EthereumToBinance') {
        models.swapEthereumToBinance(req, res, next, data)
      } else {
        res.status(400);
        res.body = { 'status': 400, 'success': false, 'result': result };
        return next(null, req, res, next)
        //models.swapBinanceToEthereum(req, res, next, data)
      }
    })
  },

  validateSwap(body) {
    const {
      direction,
      scrt_address,
      eth_address
    } = body;

    if(!direction) {
      return 'direction is required'
    }

    if(direction === 'EthereumToBinance') {
      if(!scrt_address) {
        return 'scrt_address is required'
      }

      if(!scrt.validateAddress(scrt_address)) {
        return 'scrt_address is invalid'
      }
    } else {
      if(!eth_address) {
        return 'eth_address is required'
      }

      // if(!eth.validateAddress(eth_address)) {
      //   return 'eth_address is invalid'
      // }
    }

    return true
  },

  swapEthereumToBinance(req, res, next, data) {
    const {
      bnb_address
    } = data;

    models.getClientAccountForBnbAddress(bnb_address, (err, clientAccount) => {
      if(err) {
        console.log(err);
        res.status(500);
        res.body = { 'status': 500, 'success': false, 'result': err };
        return next(null, req, res, next)
      }

      if(clientAccount) {
        res.status(205);
        res.body = { 'status': 200, 'success': true, 'result': clientAccount };
        return next(null, req, res, next)
      } else {
        eth.createAccount((err, account) => {
          if(err) {
            console.log(err);
            res.status(500);
            res.body = { 'status': 500, 'success': false, 'result': err };
            return next(null, req, res, next)
          }

          models.insertClientEthAccount(bnb_address, account, (err, clientAccount) => {
            if(err) {
              console.log(err);
              res.status(500);
              res.body = { 'status': 500, 'success': false, 'result': err };
              return next(null, req, res, next)
            }

            res.status(205);
            res.body = { 'status': 200, 'success': true, 'result': clientAccount };
            return next(null, req, res, next)
          })
        })
      }
    })
  },

  getClientAccountForBnbAddress(bnbAddress, callback) {
    /// Get the matching ETH deposit account for a given scrt address
    db.oneOrNone('select ca.uuid, ca.bnb_address, cea.address as eth_address from client_accounts_bnb ca left join client_eth_accounts cea on cea.uuid = ca.client_eth_account_uuid where ca.bnb_address = $1;', [bnbAddress])
    .then((response) => {
      callback(null, response)
    })
    .catch(callback)
  },

  insertClientEthAccount(bnbAddress, ethAccount, callback) {
    const dbPassword = bip39.generateMnemonic();
    const password = KEY+':'+dbPassword;
    const aes256private = models.encrypt(ethAccount.privateKey, password);

    db.oneOrNone('insert into client_eth_accounts(uuid, private_key, address, encr_key, created) values (md5(random()::text || clock_timestamp()::text)::uuid, $1, $2, $3, now()) returning uuid, address;', [aes256private, ethAccount.address, dbPassword])
    .then((returnedEthAccount) => {
      db.oneOrNone('insert into client_accounts_bnb(uuid, bnb_address, client_eth_account_uuid, created) values (md5(random()::text || clock_timestamp()::text)::uuid, $1, $2, now()) returning uuid, bnb_address;', [bnbAddress, returnedEthAccount.uuid])
      .then((clientAccount) => {
        const returnObj = {
          uuid: clientAccount.uuid,
          bnb_address: clientAccount.bnb_address,
          eth_address: returnedEthAccount.address
        };
        callback(null, returnObj)
      })
      .catch(callback)
    })
    .catch(callback)
  },

  /**
  * Take the token with the eth address, check to see if a transfer was done.
  * Validate that against the swaps that have been recorded previously.
  * Insert all new deposits into swaps.
  * Return all new deposits.
  */
  finalizeSwap(req, res, next) {
    models.descryptPayload(req, res, next, (data) => {

      let result = models.validateFinalizeSwap(data);

      if(result !== true) {
        res.status(400);
        res.body = { 'status': 400, 'success': false, 'result': result };
        return next(null, req, res, next)
      }

      const {
        direction
      } = data;

      if(direction === 'EthereumToBinance') {
        models.finalizeSwapEthereumToBinance(req, res, next, data)
      } else {
        res.status(400);
        res.body = { 'status': 400, 'success': false, 'result': result };
        return next(null, req, res, next)
      }
    })
  },

  finalizeSwapEthereumToBinance(req, res, next, data) {

    const {
      uuid,
      token_uuid,
      direction
    } = data;

    models.getClientAccountForUuidE2B(uuid, (err, clientAccount) => {
      if(err) {
        console.log(err);
        res.status(500);
        res.body = { 'status': 500, 'success': false, 'result': err };
        return next(null, req, res, next)
      }

      if(!clientAccount) {
        res.status(400);
        res.body = { 'status': 400, 'success': false, 'result': 'Unable to find swap details' };
        return next(null, req, res, next)
      }

      models.getTokenInfoForSwap(token_uuid, (err, tokenInfo) => {
        if(err) {
          console.log(err);
          res.status(500);
          res.body = { 'status': 500, 'success': false, 'result': err };
          return next(null, req, res, next)
        }

        if(!tokenInfo) {
          res.status(400);
          res.body = { 'status': 400, 'success': false, 'result': 'Unable to find token details' };
          return next(null, req, res, next)
        }

        async.parallel([
          (callback) => { eth.getTransactionsForAddress(tokenInfo.erc20_address, clientAccount.eth_address, callback) },
          (callback) => { models.getTransactionHashs(token_uuid, uuid, callback) }
        ], (err, data) => {
          if(err) {
            console.log(err);
            res.status(500);
            res.body = { 'status': 500, 'success': false, 'result': 'Unable to process request: ' + err };
            return next(null, req, res, next)
          }

          const ethTransactions = data[0];
          const swaps = data[1];

          if(!ethTransactions || ethTransactions.length === 0) {
            res.status(400);
            res.body = { 'status': 400, 'success': false, 'result': 'Unable to find a deposit' };
            return next(null, req, res, next)
          }

          const newTransactions = ethTransactions.filter((ethTransaction) => {
            if(!ethTransaction || ethTransaction.amount <= 0) {
              return false
            }

            const thisTransaction = swaps.filter((swap) => {
              return swap.deposit_transaction_hash === ethTransaction.transactionHash &&
                  swap.transfer_transaction_hash  // for passing through previously failed swaps
            });

            return thisTransaction.length <= 0;
          });

          if(newTransactions.length === 0) {
            res.status(400);
            res.body = { 'status': 400, 'success': false, 'result': 'Unable to find any new deposits' };
            return next(null, req, res, next)
          }

          models.insertSwaps(newTransactions, clientAccount, token_uuid, direction, (err, newSwaps) => {
            if(err) {
              console.log(err);
              res.status(500);
              res.body = { 'status': 500, 'success': false, 'result': err };
              return next(null, req, res, next)
            }

            models.proccessSwapsE2B(newSwaps, tokenInfo, (err, result) => {
              if(err) {
                console.log(err);
                res.status(500);
                res.body = { 'status': 500, 'success': false, 'result': err };
                return next(null, req, res, next)
              }

              res.status(205);
              res.body = { 'status': 200, 'success': true, 'result': newSwaps };
              return next(null, req, res, next)
            })
          })
        })
      })
    })
  },

  proccessSwapsE2B(swaps, tokenInfo, callback) {

    models.getKey(tokenInfo.bnb_address, (err, key) => {
      if(err || !key) {
        const cbError = err || 'Unable to retrieve key';
        console.error([Error]  + cbError);
        return callback(cbError)
      }

      async.map(swaps, (swap, callbackInner) => {
        models.processSwapE2B(swap, tokenInfo, key, callbackInner)
      }, (err, swapResults) => {
        if(err) {
          return callback(err)
        }

        callback(err, swapResults)
      })
    })
  },

  processSwapE2B(swap, tokenInfo, key, callback) {
    scrt.transfer(key.mnemonic, swap.bnb_address, swap.amount, tokenInfo.unique_symbol, 'BNBridge Swap', (err, swapResult) => {
      if(err) {
        console.log(err);

        return models.revertUpdateWithDepositTransactionHash(swap.uuid, (revertErr) => {
          if(revertErr) {
            console.log(revertErr)
          }

          let text = "BNBridge encountered an error processing a swap.";

          text += '\n\n*********************************************************';
          text += '\nDirection: Ethereum To Binance';
          text += '\nToken: '+tokenInfo.name + ' ('+ tokenInfo.symbol +')';
          text += '\nDeposit Hash: '+swap.deposit_transaction_hash;
          text += '\nFrom: '+swap.eth_address;
          text += '\nTo: '+swap.bnb_address;
          text += '\nAmount: '+swap.amount + ' ' + tokenInfo.symbol;
          text += '\n\nError Received: '+err;
          text += '\n*********************************************************';

          emailer.sendMail('BNBridge error', text);

          return callback(err)
        })
      }

      if (!swapResult.hasOwnProperty('txhash')) {
        return callback(Error('Hash not available in TX'))
      }

      models.updateWithTransferTransactionHash(swap.uuid, swapResult.txhash, (err) => {
        if(err) {
          return callback(err)
        }
        callback(null, swapResult.txhash)
      })
    })
  },

  revertUpdateWithDepositTransactionHash(uuid, callback) {
    db.none('update swaps set deposit_transaction_hash = null where uuid = $1 and transfer_transaction_hash is null;', [uuid])
    .then(callback)
    .catch(callback)
  },

  updateWithTransferTransactionHash(uuid, hash,  callback) {
    db.none('update swaps set transfer_transaction_hash = $2 where uuid = $1;', [uuid, hash])
    .then(callback)
    .catch(callback)
  },

  validateFinalizeSwap(body) {
    const {
      uuid,
      token_uuid,
      direction
    } = body;

    if(!uuid) {
      return 'uuid is required'
    }

    if(!token_uuid) {
      return 'token_uuid is required'
    }

    if(!direction) {
      return 'direction is required'
    }

    return true
  },

  getClientAccountForUuidE2B(uuid, callback) {
    db.oneOrNone('select ca.uuid, ca.bnb_address, cea.address as eth_address from client_accounts_bnb ca left join client_eth_accounts cea on cea.uuid = ca.client_eth_account_uuid where ca.uuid = $1;', [uuid])
    .then((response) => {
      callback(null, response)
    })
    .catch(callback)
  },

  getTokenInfoForSwap(tokenUuid, callback) {
    db.oneOrNone('select tok.uuid, tok.name, tok.symbol, tok.unique_symbol, tok.total_supply, tok.fee_per_swap, tok.minimum_swap_amount, tok.erc20_address, bnb.address as bnb_address, eth.address as eth_address from tokens tok left join bnb_accounts bnb on bnb.uuid = tok.bnb_account_uuid left join eth_accounts eth on eth.uuid = tok.eth_account_uuid where tok.uuid = $1;', [tokenUuid])
    .then((response) => {
      callback(null, response)
    })
    .catch(callback)
  },

  getTransactionHashs(tokenUuid, clientAccountUuid, callback) {
    db.manyOrNone('select * from swaps where token_uuid = $1 and client_account_uuid = $2;', [tokenUuid, clientAccountUuid])
    .then((response) => {
      callback(null, response)
    })
    .catch(callback)
  },

  insertSwaps(transactions, clientAccount, tokenUuid, direction, callback) {
    async.map(transactions,
      function (transaction, callbackInner) {
        if(direction === 'EthereumToBinance') {
          models.insertSwapE2B(transaction, clientAccount, tokenUuid, direction, callbackInner)
        } else {
          models.insertSwapB2E(transaction, clientAccount, tokenUuid, direction, callbackInner)
        }
      },
      function(err, result) {
        if (err) {
          console.log(err);
          return callback(err)
        }

        callback(null, result)
      }
    )
  },

  insertSwapE2B(transaction, clientAccount, tokenUuid, direction, callback) {
    db.oneOrNone('insert into swaps (uuid, token_uuid, eth_address, bnb_address, amount, client_account_uuid, deposit_transaction_hash, direction, created) values (md5(random()::text || clock_timestamp()::text)::uuid, $1, $2, $3, $4, $5, $6, $7, now()) returning uuid, eth_address, bnb_address, amount, deposit_transaction_hash;', [tokenUuid, transaction.from, clientAccount.bnb_address, transaction.amount, clientAccount.uuid, transaction.transactionHash, direction])
    .then((response) => {
      callback(null, response)
    })
    .catch((err) => {
      callback(err)
    })
  },

  /**
  *  GetBnbBalances( bnb_address, token_uuid )
  *  -- Get the current balance BNB address, for the symbol specified
  *  -- Get pending transfers that haven't been processed yet
  */
  getBnbBalance(req, res, next) {
    models.descryptPayload(req, res, next, (data) => {
      let result = models.validateGetBnbBalances(data);

      if(result !== true) {
        res.status(400);
        res.body = { 'status': 400, 'success': false, 'result': result };
        return next(null, req, res, next)
      }

      const {
        bnb_address,
        token_uuid
      } = data;

      models.getTokenInfo(token_uuid, (err, tokenInfo) => {
        if(err) {
          console.log(err);
          res.status(500);
          res.body = { 'status': 500, 'success': false, 'result': err };
          return next(null, req, res, next)
        }

        scrt.getBalance(bnb_address, (err, balances) => {
          if(err) {
            console.log(err);
            res.status(500);
            res.body = { 'status': 500, 'success': false, 'result': err };
            return next(null, req, res, next)
          }


          let balance = 0;

          let filteredBalances = balances.filter((balance) => {
            return balance.symbol === tokenInfo.unique_symbol
          });

          if(filteredBalances.length > 0) {
              balance = filteredBalances[0].free
          }

          models.getPendingBnbBalance(token_uuid, bnb_address, (err, pendingBalance) => {
            if(err) {
              console.log(err);
              res.status(500);
              res.body = { 'status': 500, 'success': false, 'result': err };
              return next(null, req, res, next)
            }

            const returnObj = {
              balance: parseFloat(balance),
              pendingBalance: parseFloat(pendingBalance.pending_balance ? pendingBalance.pending_balance : 0)
            };

            res.status(205);
            res.body = { 'status': 200, 'success': true, 'result': returnObj };
            return next(null, req, res, next)
          })
        })
      })
    })
  },

  validateGetBnbBalances(body) {
    let { bnb_address, token_uuid } = body;

    if(!bnb_address) {
      return 'bnb_address is required'
    }

    if(!token_uuid) {
      return 'token_uuid is required'
    }

    if(!scrt.validateAddress(bnb_address)) {
      return 'bnb_address is invalid'
    }

    return true
  },

  getPendingBnbBalance(tokenUuid, bnbAddress, callback) {
    db.oneOrNone('select sum(swaps.amount::numeric - tok.fee_per_swap::numeric) as pending_balance from swaps left join tokens tok on tok.uuid = swaps.token_uuid where swaps.token_uuid = $1 and swaps.bnb_address = $2 and swaps.deposit_transaction_hash is not null and swaps.transfer_transaction_hash is null;', [tokenUuid, bnbAddress])
    .then((info) => {
      callback(null, info)
    })
    .catch(callback)
  },


  /**
  *  GetEthBalances( eth_address, token_uuid )
  *  -- Get the current balance ErC20 address, for the symbol specified
  *  -- Get pending transfers that haven't been processed yet
  */
  getEthBalance(req, res, next) {
    models.descryptPayload(req, res, next, (data) => {
      let result = models.validateGetEthbalances(data);

      if(result !== true) {
        res.status(400);
        res.body = { 'status': 400, 'success': false, 'result': result };
        return next(null, req, res, next)
      }

      const {
        eth_address,
        token_uuid
      } = data;

      models.getTokenInfo(token_uuid, (err, tokenInfo) => {
        if(err) {
          console.log(err);
          res.status(500);
          res.body = { 'status': 500, 'success': false, 'result': err };
          return next(null, req, res, next)
        }

        eth.getERC20Balance(eth_address, tokenInfo.erc20_address, (err, balance) => {
          if(err) {
            console.log(err);
            res.status(500);
            res.body = { 'status': 500, 'success': false, 'result': err };
            return next(null, req, res, next)
          }

          const returnObj = {
            balance: parseFloat(balance),
          };

          res.status(205);
          res.body = { 'status': 200, 'success': true, 'result': returnObj };
          return next(null, req, res, next)

        })
      })
    })
  },

  validateGetEthbalances(body) {
    let { eth_address, token_uuid } = body;

    if(!eth_address) {
      return 'eth_address is required'
    }

    if(!token_uuid) {
      return 'token_uuid is required'
    }

    return true
  },

  /**
    createAccountBNB()
    creates a new BNB accoutn for the user.
  */
  createAccountSCRT(req, res, next) {
    const account = scrt.createAccountWithMneomnic();

    res.status(205);
    res.body = { 'status': 200, 'success': true, 'result': account };
    return next(null, req, res, next)
  },

  downloadKeystoreSCRT(req, res, next) {
    models.descryptPayload(req, res, next, (data) => {
      let result = models.validateDownloadKeystoreSCRT(data);

      if(result !== true) {
        res.status(400);
        res.body = { 'status': 400, 'success': false, 'result': result };
        return next(null, req, res, next)
      }

      const {
        private_key,
        password
      } = data;

      const account = scrt.generateKeyStore(private_key, password);

      models.returnDownload(req, res, account)
    })
  },

  validateDownloadKeystoreSCRT(body) {
    let {
      password,
      private_key
    } = body;

    if(!private_key) {
      return 'private_key is required'
    }

    if(!password) {
      return 'password is required'
    }

    return true
  },

  returnDownload(req, res, keyStore) {

    let data = JSON.stringify(keyStore);
    res.setHeader('Content-disposition', 'attachment; filename= '+keyStore.id+'_keystore.json');
    res.setHeader('Content-type', 'application/json');
    // res.write(data, function (err) {
    //     res.end();
    // })
    res.send( data )
  },

  getERC20Info(req, res, next) {
    models.descryptPayload(req, res, next, (data) => {
      const {
        contract_address
      } = data;

      eth.getERC20Name(contract_address, (err, name) => {
        if(err) {
          console.log(err);
          res.status(500);
          res.body = { 'status': 500, 'success': false, 'result': err };
          return next(null, req, res, next)
        }
        eth.getERC20Symbol(contract_address, (err, symbol) => {
          if(err) {
            console.log(err);
            res.status(500);
            res.body = { 'status': 500, 'success': false, 'result': err };
            return next(null, req, res, next)
          }
          eth.getERC20TotalSupply(contract_address, (err, totalSupply) => {
            if(err) {
              console.log(err);
              res.status(500);
              res.body = { 'status': 500, 'success': false, 'result': err };
              return next(null, req, res, next)
            }

            const returnObj = {
              name: name,
              symbol: symbol,
              total_supply: totalSupply,
              address: contract_address
            };

            res.status(205);
            res.body = { 'status': 200, 'success': true, 'result': returnObj };
            return next(null, req, res, next)
          })
        })
      })
    })
  },

};

String.prototype.hexEncode = function(){
    let hex, i;
    let result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }
    return result
};
String.prototype.hexDecode = function(){
    let j;
    let hexes = this.match(/.{1,4}/g) || [];
    let back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
};

function decrypt(text,seed){
  let decipher = crypto.createDecipher('aes-256-cbc', seed);
  let dec = decipher.update(text,'base64','utf8');
  dec += decipher.final('utf8');
  return dec;
}

module.exports = models;
