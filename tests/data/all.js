
module.exports = {

	hsmKeys: [
		require('./hsm_P256'),
		require('./hsm_P256K')
	],

	hsmKey: {
		p256: require('./hsm_P256'),
		p256k: require('./hsm_P256K')
	},

	tzKeys: [
		require('./tezos_P256'),
		require('./tezos_P256K')
	],

	tzKey: {
		p256: require('./tezos_P256'),
		p256k: require('./tezos_P256K')
	},

	op: {
		block: require('./op-block'),
		endorsement: require('./op-endorsement'),
		generic: require('./op-generic')
	}

}
