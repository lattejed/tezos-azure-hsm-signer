
// openssl ecparam -name secp256k1 -genkey -noout | openssl ec -text -noout >> keypair
// cat keypair | grep priv -A 3 | tail -n +2 | tr -d ":\n[:space:]"
// cat keypair | grep pub -A 5 | tail -n +2 | tr -d ":\n[:space:]"

let sk = '52f4062e20bb2d103d553f693280d3ecafb68d3fd898142e3cf45d84058c90e3'
let pk = '04c14bf6c71a7c44fd413e5976462f08443424f27bd77018ed9e2b3b88ac33a78a4e16b9a6c06ca5e9ba60f27de1ad21fc6edbc87e85b973dd11d5ccc77b9ee4bc'

module.exports = {
	privateKey: sk,
	publicKey: pk
}
