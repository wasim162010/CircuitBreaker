const express = require('express');
const app = express();
const config = require('./config')

const Web3 = require('web3');
const web3 = new Web3("https://mainnet.infura.io/v3/9116e53c01e14b0580e566fc02645003");

app.get('/healthcheck', (req, res) => {
    res.json({status: 'ok'});
});

const port = config.port;


/*
a/c tx              : 0xbeae83e379e9a4c986cfc453fe90e1fa2ca50eaa692ad99abe2aee2214208132
erc20 transfer      : 0xee33a6c25198bf980c80803b25b30dbc195018d9ec9c97e087a9f1902ead45a9
contract execution  : 0xda207ae2980e09742ad28f2e604a964387df13afc8831c5762fc5b7b240b0502
*/

app.listen(port, function () {
    console.log('Node server is running! Check the route bellow.');
    console.log(`http://localhost:${port}/healthcheck`);
});

async function fetchDetailByTxId(txid) {
    
    let resp;
    console.log("Calling fetchTransactionType");
    var type = await fetchTransactionType(txid);
    console.log("type " + type.v)

    if(type.v == "0x25") { //0x25 account transfer
        console.log("Account transfer transaction")  
    } else if(type.v == "0x1c") {
        console.log("contract execution transaction")  
    } else if(type.v == "0x26") { //Erd20 token transfer
        console.log("ERC20 token transfer transaction")  
    }

    try {
         resp = await executeTx(txid);
    } catch(err) {
        resp = err;
    }
    return resp;
}


app.get('/eth/api/v1/transaction', function(req, res){

    console.log("querytx");
    var tx = req.query.tx;

    let resp;
    console.log(tx); 
    console.log("Calling fetchDetailByTxId");
    fetchDetailByTxId(tx).then( (data)=> {
        resp = data;
        res.send(resp);
    },(data) => {
        console.log("error" + data);
      }
    )

 });

 async function executeTx(txid) {
    let res;
    await web3.eth.getTransactionReceipt(txid, function(error, result) {
        res = result;
    });

    // await web3.eth.getTransaction(txid, function(error, result) {
    //     res = result;
    // });
    return res;
}

async function fetchTransactionType(txid) {
    let res;
    await web3.eth.getTransaction(txid, function(error, result) {
        res = result;
    });
    console.log(res.v)
    return res;
}


