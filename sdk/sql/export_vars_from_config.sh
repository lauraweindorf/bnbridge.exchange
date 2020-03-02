#!/bin/bash

export DBHOST=localhost
export DBPASSWORD=postgres
export DBUSER=postgres
export DBNAME=postgres
export BNB_PRIVATE_KEY=2d1bf68705042b6c7095133e90c1b236009506cc8c0418563b8f9eac68f985c7
export BNB_ENCRYPTION_KEY=postgres
export ERC20_ADDRESS=0xa5d12ea873e33806b9f2a87b779facee297748cd
export ETH_ACCOUNT_ADDRESS=0xFBa98aD256A3712a88ab13E501832F1E3d54C645
export ETH_PRIVATE_KEY=postgres

echo "DBHOST = $DBHOST"
echo "DBPASSWORD = $DBPASSWORD"
echo "dbuser = $DBUSER"
echo "DBNAME = $DBNAME"
echo "BNB_PRIVATE_KEY = $BNB_PRIVATE_KEY"
echo "BNB_ENCRYPTION_KEY = $BNB_ENCRYPTION_KEY"
echo "erc20_address = $ERC20_ADDRESS"
echo "eth_account_address = $ETH_ACCOUNT_ADDRESS"
echo "eth_private_key = $ETH_PRIVATE_KEY"