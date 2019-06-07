# WIP -- DO NOT USE -- DRAFT

# Remote Tezos Signer for Azure Cloud HSM

This is a remote signer for the Tezos network, enabling bakers to run on Azure's inexpensive cloud HSM offering (Azure Key Vault), aiding in a low-cost and secure baker setup.

This has been tested to run on Ubuntu 18.04 and has a `systemd` startup script to run as a service on that OS. It should run on other Linux distributions as well as macOS with minor or no changes.

## Complete guide

A comprehensive guide for securely setting up a signer on Azure is available as part of the free e-book *Learn you a Tezos for Great Prosperity* here [learnyouatezos.com/fillmein](http://learnyouatezos.com/fillmein)

## WARNINGS

### The following steps are *required*

You *must* set the firewall on the Azure VM to only allow access from your baker's IP address. Otherwise, your signer could be used by anyone to sign all operation types you've whitelisted.

### The following steps are *strongly recommended*

1. Review best practices for generating, securing and backing up private keys outside of Azure
2. Review best practices for securing the VM this will run on
3. Review best practices for securing your Key Vault
4. Review best practices for importing keys into Key Vault
5. Test your signer setup on the Tezos `alphanet` using a test key before moving to `mainnet`
6. Test your new `mainnet` `tz...` address by sending a small amount of XTZ *to and from* that address
7. Test your key backup and restoration procedure and repeat step \#6

## Prerequisites

1. An Azure account with billing enabled
2. Azure Key Vault premium (for HSM)
3. An imported private key of type Secp256k1 or NIST P256
4. An Azure VM running Ubuntu 18.04 with a service managed identitiy?
5. Node.js (>= 10.0.0) and npm installed

## Usage

```
git clone https://github.com/lattejed/tezos-azure-hsm-signer.git
cd tezos-azure-hsm-signer
npm install
AZURE_KEYVAULT_URI='https://my-keyvault.vault.azure.net/' node server.js --address=0.0.0.0
```

You must supply a valid `AZURE_KEYVAULT_URI` and set required options when starting.

```
node server.js --help
```

```
Usage: server.js [options]

Options:
  --version                   Show version number                      [boolean]
  -h, --help                  Show help                                [boolean]
  -M, --magic-bytes                                       [default: "0x01,0x02"]
  -W, --check-high-watermark                           [boolean] [default: true]
  -a, --address                                           [default: "127.0.0.1"]
  -p, --port                                                     [default: 6732]
```

The option `--check-high-watermark` is enabled by default and should be explicitly negated `--no-check-high-watermark`, though doing so is not recommended.

The default address of `127.0.0.1` will not allow external connections. You will need to explicitly set this to `0.0.0.0` or equivalent for public network access (if not using `nginx` or similar).

```
cp ... /etc/systemd/...
sudo systemctl ...
... start
... status
```

```
node client.js
```

## Verify operation

From your test baker node, run the following:

```
tezos-client import secret key my_azure_key from http://<your VM ip>:6723/<your tz... address>
tezos-client sign bytes 0x0100000000 for my_azure_key
tezos-client <verify TODO:>
```

## Security features

1. Checks high watermarks, preventing double sign / double bake
2. Whitelisting magic bytes for operations
3. Local client support for confirming non-whitelisted operations

## Security non-features

1. This signer is intended for small and medium-sized bakers. It *does not* support high availability setups where more than one signer or baker may be running simultaneously. In particular, race conditions are not protected against when verifying an operation's high watermark.

## Curve support

This signer supports both Secp256k1 and NIST P256 keys (tz2 and tz3 public key hashes) and generates canonical signatures for both. In particular, Secp256k1 signatures are always produced with low S values.

## Deterministic signatures

Azure Key Vault *does not* support deterministic signatures. That means signing operations will never produce the same signature when repeated. The Tezos network *does not* require deterministic signatures, although it produces them when using a node to sign operations.

## Bring your own private key!

It is *strongly recommended* that you generate your keys offline and *import* them using the Azure cli. Azure *does not* support backing up key material apart from encrypted backups (used only for moving keys within the same Azure region).

While key security is a big topic, at the very least your key should be generated on an air-gapped computer, encrypted with a *strong* password and backed up securely. It is *not recommended* to import your key using the same VM that you will run your signer on.

## Why Azure?

Azure is currently the only viable choice for a *low cost* HSM signer as it supports both key import (as does AWS) and billing per key / signing op (as does Google Cloud). In contrast, Google does not support key import / backup and AWS only has dedicated HSMs, which are significantly more expensive to operate.

## Costs

This setup requires both an Azure VM and an HSM-backed Key Vault. The lowest cost VM will work (~$5/month) and a single key will cost ....

## Related projects

...

Although this project is not a direct port of any of these projects, I would like to thank the authors for open sourcing their work and making it freely available for review.
