# Remote Tezos Signer for Azure Key Vault (HSM backed)

This is a remote signer for the Tezos network, enabling bakers to run on Azure's inexpensive cloud HSM offering (Azure Key Vault), aiding in a low-cost and secure baker setup.

This is intended run on an Azure VM running Ubuntu 18.04 and has a `systemd` startup script to run as a service on that OS. An Azure VM with a Service Managed Identity is required.

## Read the complete guide

A comprehensive guide for securely setting up a signer on Azure is available as part of the free e-book *Learn you a Tezos for Great Prosperity* here [learnyouatezos.com/baking-remote-signer.html](http://learnyouatezos.com/baking-remote-signer.html)

## Why Azure?

Azure is currently the only viable choice for a *low cost* HSM signer as it supports both key import (as does AWS) and billing per key / signing op (as does Google Cloud). In contrast, Google does not support key import or backup and AWS only has dedicated HSMs, which are significantly more expensive to operate.

## Bring your own private key!

It is *strongly recommended* that you generate your keys offline and *import* them using the Azure cli. Azure *does not* support backing up key material apart from encrypted backups (they are used only for moving keys within the same Azure region).

While key security is a big topic, at the very least your key should be generated on an air-gapped computer, encrypted with a *strong* passphrase and backed up securely. It is *not recommended* to import your key using the same VM that you will run your signer on.

## WARNINGS

### The following steps are *REQUIRED*

1. You *must* set the firewall on the Azure VM to only allow access from your baker's IP address. Otherwise, your signer could be used by anyone to sign all operation types you've whitelisted.

### The following steps are *STRONGLY RECOMMENDED*

1. Review best practices for generating, securing and backing up private keys outside of Azure
2. Review best practices for securing the VM this will run on
3. Review best practices for securing your Key Vault
4. Review best practices for importing keys into Key Vault
5. Test your signer setup on the Tezos `zeronet` or `alphanet` using a test key before moving to `mainnet`
6. Test your new `mainnet` `tz...` address by sending a small amount of XTZ *to and from* that address
7. Test your key backup and restoration procedure and repeat step \#6

## HTTPS Note

HTTPS is not used as no information is passed between baker and signer that will not be made public. Security is provided by firewalling the singer to only accept requests from your baker's IP address. See WARNINGS.

## Prerequisites

1. An Azure account with billing enabled
2. Azure Key Vault premium (for HSM)
3. An imported private key of type Secp256k1 or NIST P256
4. An Azure VM running Ubuntu 18.04 with a Service Managed Identity
5. Node.js (>= 10.15.3) and npm (>= 6.4.1) installed

## Usage

```
git clone https://github.com/lattejed/tezos-azure-hsm-signer.git
cd tezos-azure-hsm-signer
npm install
AZURE_KEYVAULT_URI='https://my-keyvault.vault.azure.net/' node server.js --address=0.0.0.0
```

You must supply a valid `AZURE_KEYVAULT_URI` and set options when starting.

```plaintext
node server.js --help
```

```plaintext
Usage: server.js [options]

Options:
  --version                   Show version number                      [boolean]
  -h, --help                  Show help                                [boolean]
  -M, --magic-bytes                                       [default: "0x01,0x02"]
  -W, --check-high-watermark                           [boolean] [default: true]
  -a, --address                                           [default: "127.0.0.1"]
  -p, --port                                                     [default: 6732]
```

The option `--check-high-watermark` is enabled by default and should be explicitly negated with `--no-check-high-watermark` though doing so is not recommended.

The default address of `127.0.0.1` will not allow external connections. You will need to explicitly set this to `0.0.0.0` or equivalent for public network access.

## Run tests

```plaintext
cd tezos-azure-hsm-signer
npm run test
```

## Verify operation

From your Azure VM, run the following:

```plaintext
AZURE_KEYVAULT_URI='https://my-keyvault.vault.azure.net/' node server.js --address=0.0.0.0
```

Your `tz...` address should be present in the output.

From another terminal session, run the following:

```plaintext
cd tezos-azure-hsm-signer
node client.js
```

From your test baker node, run the following:

```plaintext
tezos-client import secret key my_azure_test_key from http://<your VM ip>:6723/<your tz... address>
tezos-client sign bytes 0x0400000000 for my_azure_test_key
```

Your client session will prompt you with:

```plaintext
Waiting for signing request. Ctrl-C to quit.
Confirm transaction 0x0400000000 [Ny]?
```

Type `y`. Your `tezos-client` session should return a signature.

To verify that signature, run this from your `tezos-client` session:

```plaintext
tezos-client check that 0x0400000000 was signed by my_azure_test_key to produce <signature ...>
```

## Security features

1. Checks high-water marks, preventing double sign / double bake
2. Whitelisting magic bytes for operations
3. Local client support for confirming non-whitelisted operations

## Security non-features

1. This signer is intended for small and medium-sized bakers. It *does not* support high availability setups where more than one signer or baker may be running simultaneously. In particular, race conditions are not protected against when verifying an operation's high-water mark.

## Curve support

This signer supports both Secp256k1 and NIST P256 keys (tz2 and tz3 public key hashes) and generates canonical signatures for both. In particular, Secp256k1 signatures are always produced with [low S values](https://github.com/bitcoin/bips/blob/master/bip-0062.mediawiki#Low_S_values_in_signatures).

## Deterministic signatures

Azure Key Vault *does not* support deterministic signatures. That means signing operations will never produce the same signature when repeated. The Tezos network *does not* require deterministic signatures, although it produces them when using a node to sign operations.

## Related projects

1. [HSM Signer in Go from Polychain Labs](https://gitlab.com/polychainlabs/tezos-hsm-signer)
2. [HSM Signer in Python for AWS from Taco Infrastructure](https://github.com/tacoinfra/remote-signer)
3. [HSM Signer in Python for Azure by Tezzigator](https://github.com/tezzigator/azure-tezos-signer)
4. [HSM Signer in Python for Google Cloud KMS by Tezzigator](https://github.com/tezzigator/remote-signer)
