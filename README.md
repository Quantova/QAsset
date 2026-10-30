# QAsset

QAsset is a live production post quantum title registry and chain of custody tool for real world assets on the Quantova network. It proves the registration, custody, transfer and retirement of land, vehicles, vessels, equipment and artworks, and it lets any third party confirm that history without trusting the party that created it.

QAsset proves records without disclosing them. Asset identities and holder details stay private on the systems of the party that holds them. Only a salted cryptographic commitment is written to the chain.

## What it records

Each record is a signed envelope of one of four types.

1. register, a registrar records a titled asset with its class, its registry identifier, its jurisdiction and its first owner of record.
2. custody, a custodian states that an asset is held at a named location.
3. transfer, the owner of record moves the asset to another party.
4. retire, a registrar removes an asset from the register and states why.

Every record is signed with ML-DSA-65 under FIPS 204 by the party whose role it names, and each later record links to the one before it so the whole life of an asset forms a chain.

## Install

```
npm install @quantovainc/qasset
```

## Use

```js
const qasset = require('@quantovainc/qasset');

const registrar = qasset.generateKey();
const owner = qasset.generateKey();
const title = qasset.register({ key: registrar, assetClass: 'land', identifier: 'Parcel 12 / Block 7', jurisdiction: 'gb', owner: qasset.keyId(owner), registrarLabel: 'Land Registry' });
const anchored = await qasset.anchor(title, { seed, index: 0, network: 'testnet' });
const result = await qasset.verify(anchored[0], { type: 'register', network: 'testnet' });
```

## What a record does not establish

1. It does not show that the stated ownership is lawful. It shows only that the registrar stated it and that the statement existed unchanged at a point in time.
2. It does not identify a natural or legal person. The signer is a chain address, and linking an address to a registrar, custodian or owner is a separate attestation.

## License

Apache-2.0 OR MIT
