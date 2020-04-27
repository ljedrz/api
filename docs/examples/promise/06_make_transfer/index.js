/* eslint-disable header/header */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */

// Import the API, Keyring and some utility functions
const { ApiPromise } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');

// Dave's account address
const dave = '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy';

// Ferdie's account address
const ferdie = '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL';

async function main () {
  // Instantiate the API
  const api = await ApiPromise.create({
    types: {
      // mapping the actual specified address format
      Address: 'AccountId',
      // mapping the lookup
      LookupSource: 'AccountId'
    }
  });

  // import the test keyring (already has dev keys for Alice, Bob, Charlie, Eve & Ferdie)
  const testKeyring = require('@polkadot/keyring/testing');
  const keyring = testKeyring.default();

  // Retrieve the sudo key from the chain state
  const adminId = await api.query.sudo.key();

  // Find the actual keypair in the keyring (if this is a changed value, the key
  // needs to be added to the keyring before - this assumes we have defaults, i.e.
  // Alice as the key - and this already exists on the test keyring)
  const adminPair = keyring.getPair(adminId.toString());

  // The amount to send
  const amount = 7777777;

  const sudo_infusion = api.tx.balances.setBalance(dave, amount, 0);
  const sudo_infusion_hash = api.tx.sudo.sudo(sudo_infusion);

  const sudo_transfer = api.tx.balances.forceTransfer(dave, ferdie, amount);
  const sudo_transfer_hash = api.tx.sudo.sudo(sudo_transfer);

  const something = api.tx.templateModule.doSomething(Math.floor(Date.now() / 1000));

  const txs = [
    sudo_infusion_hash,
    sudo_transfer_hash,
    something
  ];

  const ret = await api.tx.utility.batch(txs).signAndSend(adminPair);
}

main().catch(console.error).finally(() => process.exit());
