# WIP -- DO NOT USE -- DRAFT

# Remote Tezos Signer for Azure Cloud HSM

This is a remote signer for the Tezos network, enabling bakers to run on Azure's inexpensive cloud HSM offering (Azure Key Vault), aiding in a low-cost, high availability and secure baker setup.

This has been tested to run on Ubuntu 18.04 and has a `systemd` startup script to run as a service on this OS. It should run on other Linux distributions as well as macOS with minor or no changes.

## Prerequisites

1. An Azure account with billing enabled (or a trial account) and premium enabled?
2. An active Key Vault (and URI)
3. An imported private key of type Secp256k1 or NIST P256
4. An Azure VM running Ubuntu 18.04 with a service managed identitiy?
5.

## Usage

```
git clone https://
cd tezos-azure-hsm-signer
npm install
AZURE_KEYVAULT_URI='https://my-keyvault.azure.com' node server.js --address=0.0.0.0
```

```
cp ... /etc/systemd/...
sudo systemctl ...
... start
... status
```

```
node client.js
```

## Security Features

1. Checking high watermarks, preventing double sign / double bake
2. Whitelisting magic bytes for operations
3. Local client support for confirming transactions

## Non-Features

1. This signer is intended for small and medium-sized bakers. It *does not* support high availability setups where more than one signer or one baker may be running simultaneously.

## Curve support

This signer supports both Secp256k1 and NIST P256 keys (tz2 and tz3 public key hashes) and generates canonical signatures for both. In particular, Secp256k1 keys are always produced with low S values.

## Deterministic signatures

Azure Key Vault *does not* support deterministic signatures. That means signing operations will never produce the same signature when signing the same operation twice. The Tezos network *does not* require deterministic signatures, although it produces them when using a node to sign operations.

## Bring your own private key

It is *strongly recommended* that you generate your keys offline and *import* them using the Azure cli. Azure *does not* support backing up key material apart from encrypted backups (used only for moving keys within the same Azure region).

## Why Azure?

Azure is currently the only viable choice for a *low cost* signer as it supports both key import (as does AWS) and billing per key / signing op (as does Google cloud). In contrast, Google does not support key import / backup and AWS only has dedicated HSMs, which are *much* more expensive to operate.

## Cost

This setup requires both an Azure VM and an HSM-backed Key Vault. The lowest cost VM will work (~$5/month) and a single key will cost ....

## Other projects

...

Although this project is not a direct port of any of these previous projects, I would like to thank them for open sourcing their work and making it freely available for review.
