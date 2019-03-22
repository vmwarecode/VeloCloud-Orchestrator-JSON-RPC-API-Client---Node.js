#!/usr/bin/env node
'use strict';

//
// A VCO live mode demo to retrieve real-time link stats from an Edge and dump them to the console
//
// Requires that the following environment variables are specified:
//  - VCO_HOST : VCO hostname or IP address (e.g. 'vco.velocloud.net' or '12.34.56.7')
//  - VCO_USERNAME
//  - VCO_PASSWORD
//
// If operating as a VCO operator user, the IS_OPERATOR_USER flag below must be set to `true`
//

const {inspect, promisify} = require('util');
const Client = require('./PortalJSONRPCClient.js');

const IS_OPERATOR_USER = false;
const POLL_INTERVAL_MS = 3000;
const ENTERPRISE_ID = 1;
const EDGE_ID = 1;

const setTimeoutAsync = promisify(setTimeout);
function sleep(ms) {
    return setTimeoutAsync(ms);
}

async function main() {

    const client = new Client(process.env.VCO_HOST);
    await client.authenticate(process.env.VCO_USERNAME, process.env.VCO_PASSWORD, IS_OPERATOR_USER);

    const {token} = await client.callApi('/liveMode/enterLiveMode', {
        enterpriseId: ENTERPRISE_ID,
        id: EDGE_ID
    });

    while ( true ) {
        await sleep(POLL_INTERVAL_MS);
        let data = await client.readLiveData({token});
        // PROCESS DATA HERE
        console.log(inspect(data, { depth: Infinity }));
    }

    await client.callApi('/liveMode/exitLiveMode', {
        enterpriseId: ENTERPRISE_ID,
        id: EDGE_ID
    });

}

(async () => {
    try {
        await main();
    } catch (err) {
        console.error(err);
    }
})();
