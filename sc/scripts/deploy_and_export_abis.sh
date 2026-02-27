

# ==== Dependencias ====
if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq no está instalado. Instálalo (e.g., sudo apt-get install jq)" >&2
  exit 1
fi

# ==== 3) Exportar ABIs desde sc/out a web/src/lib ====
echo "[3/4] Exportando ABIs con jq desde sc/out a web/src/contracts..."

# Estamos dentro de sc/ por el pushd anterior
# GreenSupplyChain1155 ABI
jq '.abi' out/GreenSupplyChain1155.sol/GreenSupplyChain1155.json > ../web/src/contracts/GreenSupplyChain1155.abi.json