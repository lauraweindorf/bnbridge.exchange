#!/bin/bash

# Gen encryption keys and encrypted password
var=$(node get_key_from_mnemonic.js)
echo "$var"
bnbPubKey=$(echo $var | cut -d, -f1)
bnbAddress=$(echo $var | cut -d, -f2)
bnbEncrSeed=$(echo $var | cut -d, -f3)
bnbEncrKey=$(echo $var | cut -d, -f4)
bnbEncrPasswd=$(echo $var | cut -d, -f5)

echo "bnbEncrPasswd = $bnbEncrPasswd"
echo "bnbEncrSeed = $bnbEncrSeed"
# echo "bnbEncrClipassword = $bnbEncrClipassword"
echo "bnbEncrKey = $bnbEncrKey"
echo "bnbPubKey = $bnbPubKey"
echo "bnbAddress = $bnbAddress"