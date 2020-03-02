# BNBridge

### Features:
- [x] Swap a token from ERC20 to SCRT.

### Repository
## ./bnbridge
Front end website allowing for ERC to SCRT swaps.

## ./cli
Binance CLI utility.

## ./sdk
API used to interact with the CLI utility, Binance javascript SDK and Web3.js to enable BNB to ERC bridge utility.


### Installation
    git clone the repo

    cd ./sdk

    npm install
    
    run ./sql/testnet_setup.sh to instantiate the DB (don't forget to set DB parameters and stuff).
    
    update ./config/index.js with
        - databse connection details.

    npm start

    Frontend:

    cd ../bnbridge

    npm install

    npm start