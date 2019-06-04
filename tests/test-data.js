

module.exports = {

	testKeys: {
		"P256": {
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
			"signAlgo": "ES256"
		},
		"P256K": {
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

}
