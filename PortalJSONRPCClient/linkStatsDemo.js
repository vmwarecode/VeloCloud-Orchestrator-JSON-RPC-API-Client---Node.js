#!/usr/bin/env node
'use strict';

//
// A demo script that reports aggregate link performance metrics for all active links (those reporting any activity in
// the last 24 hours) on an enterprise or set thereof.
//
// Requires that the following environment variables are specified:
//  - VCO_HOST : VCO hostname or IP address (e.g. 'vco.velocloud.net' or '12.34.56.7')
//  - VCO_USERNAME
//  - VCO_PASSWORD
//
// If operating as a VCO operator user, the IS_OPERATOR_USER flag below must be set to `true`
//

const {inspect} = require('util');
const Client = require('./PortalJSONRPCClient.js');

const IS_OPERATOR_USER = false;
const ENTERPRISE_IDS = [4];
const INTERVAL_START = Date.now() - 1000*60*60; // one hour ago (a ms-precision epoch timestamp)
// const INTERVAL_END = Date.now(); // current time in UTC is implied when this is not explicitly specified

async function main() {

    const client = new Client(process.env.VCO_HOST);
    await client.authenticate(process.env.VCO_USERNAME, process.env.VCO_PASSWORD, IS_OPERATOR_USER);

    const data = await client.callApi('/monitoring/getAggregateEdgeLinkMetrics', {
        enterprises: ENTERPRISE_IDS,
        interval: {
          start: INTERVAL_START,
          // end: INTERVAL_END
        }
    });

    console.log(inspect(data, { depth: Infinity }));

}

(async () => {
    try {
        await main();
    } catch (err) {
        console.error(err);
    }
})();
