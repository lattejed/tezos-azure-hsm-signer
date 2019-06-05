

const testOps = {

	generic: '0380270c97773c117d71d95e96f3a5292f7949f571a31cbc80994f5fea61b1546608000154f5d8f71ce18f9f05bb885a4120e64c667bc1b4fb09b9b037d84f00c0843d000154f5d8f71ce18f9f05bb885a4120e64c667bc1b400',
	endorsement: '027a06a770e6cebe5b3e39483a13ac35f998d650e8b864696e31520922c7242b88c8d2ac55000003eb6d',
	block: '018eceda2f00023df201a43530a7ac35eb2b0000c51c29e21b943355242b73d76cfee53dd80908e3e843000000005c562260047d63043ed1c565061d83ef6ce2fed35410549d87350808ee050c25c1a2dc7795000000110000000100000000080000000000435a1af44a000a5e6a5297b6531706fed4438e7e1c134a9e70d239f4c17c3d81411258000000000003dcf012f600'

}

const testKeys = {

	"tz3QPpd8iER4ZUUTTDLjCbsNJhowrAVVz2Ys": {
		"attributes": {
			"created": "2019-05-30T10:02:14+00:00",
			"enabled": true,
		},
		"key": {
			"crv": "P-256",
			"kid": "https://keyvaulttest-keyvault.vault.azure.net/keys/KeyVaultTest-SignerKey4/7847448a40a743fabe1c7131a1893ece",
			"kty": "EC-HSM",
			"x": Buffer.from("3c8zui0cSl3X5V2Cks67kmw9iGG9eCRA20T3E4Rq4oo=", 'base64'),
			"y": Buffer.from("9YUQMNtL7rjjjLQvOxCZSOR2HvGAgeY9F7egiR5Rdkg=", 'base64')
		},
		"publicKeyU": "04ddcf33ba2d1c4a5dd7e55d8292cebb926c3d8861bd782440db44f713846ae28af5851030db4beeb8e38cb42f3b109948e4761ef18081e63d17b7a0891e517648",
		"publicKeyC": "02ddcf33ba2d1c4a5dd7e55d8292cebb926c3d8861bd782440db44f713846ae28a",
		"publicKeyTZH": "tz3QPpd8iER4ZUUTTDLjCbsNJhowrAVVz2Ys",
		"publicKeyTZ": "p2pk66FrD7CenApRiHgnGtr86DEzXjjzqMbLvTVX757mZG8fArSRR5e",
		"signAlgo": "ES256",
		"signedZeroHash": "p2sigMJWuMaj1zAfVMzdZzFnoncCKE7faHzJ7coB6h3ziUiGeZoTZUNfYSQR5t2dJ6cFWCvUx8CZdLRCigAUtrt2JEfRzvbDnL"
	},

	"tz2GZguWayWgWFVaQAZMvbfTbeyruHWDDvR6": {
	  "attributes": {
	    "created": "2019-05-22T08:37:35+00:00",
	    "enabled": false,
	  },
	  "key": {
	    "crv": "SECP256K1",
	    "kid": "https://keyvaulttest-keyvault.vault.azure.net/keys/KeyVaultTest-SignerKey2/ec0f836a2ae743fda4b33270c42a33c5",
	    "kty": "EC-HSM",
	    "x": Buffer.from("jpJXYf8w2ku82M4K2zelYX8WgTQfU099CT3c8u09EAs=", 'base64'),
	    "y": Buffer.from("cB++YGHZJ5OGbfhlzX7RRDBAIcDPVWOaQqdGneyzS5A=", 'base64')
	  },
		"publicKeyU": "048e925761ff30da4bbcd8ce0adb37a5617f1681341f534f7d093ddcf2ed3d100b701fbe6061d92793866df865cd7ed144304021c0cf55639a42a7469decb34b90",
		"publicKeyC": "028e925761ff30da4bbcd8ce0adb37a5617f1681341f534f7d093ddcf2ed3d100b",
		"publicKeyTZH": "tz2GZguWayWgWFVaQAZMvbfTbeyruHWDDvR6",
		"publicKeyTZ": "sppk7aPRf3mXkUSxz3CWzH8SEBP2ASV1PbM3yb7WqvAbbZUqW7EokEu",
		"signAlgo": "ECDSA256"
	}
}

testKeys['P256'] = testKeys['tz3QPpd8iER4ZUUTTDLjCbsNJhowrAVVz2Ys']
testKeys['P256K'] = testKeys['tz2GZguWayWgWFVaQAZMvbfTbeyruHWDDvR6']

module.exports = {

	testOps,
	testKeys

}
