#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────────
# Paths (corre este script desde la raíz del repo): Debes esta en la carpeta sc
# ──────────────────────────────────────────────────────────────────────────────
PROJECT_ROOT="$(pwd)"
SC_DIR="${PROJECT_ROOT}"
WEB_CONTRACT_DIR="${PROJECT_ROOT}/web/src/contracts"
ENV_FILE="${SC_DIR}/.env"

echo "📁 PROJECT_ROOT      = ${PROJECT_ROOT}"
echo "📁 SC_DIR            = ${SC_DIR}"
echo "📁 WEB_CONTRACT_DIR  = ${WEB_CONTRACT_DIR}"
echo "🧩 ENV_FILE          = ${ENV_FILE}"

# ──────────────────────────────────────────────────────────────────────────────
# Requisitos
# ──────────────────────────────────────────────────────────────────────────────
if ! command -v forge >/dev/null 2>&1; then
  echo "ERROR: forge no está instalado o no está en PATH." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq no está instalado. (e.g., sudo apt-get install jq)" >&2
  exit 1
fi

# ──────────────────────────────────────────────────────────────────────────────
# Cargar .env de sc/
# ──────────────────────────────────────────────────────────────────────────────
if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
else
  echo "ERROR: No se encontró ${ENV_FILE}" >&2
  exit 1
fi

: "${RPC_URL:?RPC_URL no definido en sc/.env}"
: "${ANVIL_FIRST_ACCOUNT:?ANVIL_FIRST_ACCOUNT no definido en sc/.env}"
CHAIN_ID="${CHAIN_ID:-31337}"
BASE_URI="${BASE_URI:-https://example.json}"   # configurable desde .env

# ──────────────────────────────────────────────────────────────────────────────
# 1) Build de contratos (en sc/)
# ──────────────────────────────────────────────────────────────────────────────
echo "[1/4] forge build (en sc/)..."
pushd "${SC_DIR}" >/dev/null
forge build

# ──────────────────────────────────────────────────────────────────────────────
# 2) Deploy con forge script (en sc/)
# ──────────────────────────────────────────────────────────────────────────────
echo "[2/4] Deploy con forge script (en sc/)..."
forge script script/Deploy.s.sol:Deploy \
  --rpc-url "${RPC_URL}" \
  --broadcast \
  --private-key "${ANVIL_FIRST_ACCOUNT}" \
  --sig "run(string)" "${BASE_URI}"

# ──────────────────────────────────────────────────────────────────────────────
# 3) Exportar ABI a web/src/contracts
# ──────────────────────────────────────────────────────────────────────────────
echo "[3/4] Exportando ABI a web/src/contracts…"
mkdir -p "${WEB_CONTRACT_DIR}"

ARTIFACT="${SC_DIR}/out/GreenSupplyChain1155.sol/GreenSupplyChain1155.json"
if [[ ! -f "${ARTIFACT}" ]]; then
  echo "ERROR: No existe artefacto en ${ARTIFACT}. ¿Falló el build/deploy?" >&2
  popd >/dev/null
  exit 1
fi

# Guardar únicamente el array .abi como JSON válido
jq '.abi' "${ARTIFACT}" > "${WEB_CONTRACT_DIR}/GreenSupplyChain1155.abi.json"

# Validación rápida
jq type "${WEB_CONTRACT_DIR}/GreenSupplyChain1155.abi.json" | grep -q '"array"' \
  || { echo "ERROR: El ABI exportado no es un array JSON." >&2; popd >/dev/null; exit 1; }

# ──────────────────────────────────────────────────────────────────────────────
# 4) Extra: guardar address del deployment (útil para el frontend)
# ──────────────────────────────────────────────────────────────────────────────
echo "[4/4] Extrayendo address del deployment…"
BROADCAST_DIR="${SC_DIR}/broadcast/Deploy.s.sol/${CHAIN_ID}"
if [[ -d "${BROADCAST_DIR}" ]]; then
  if [[ -f "${BROADCAST_DIR}/run-latest.json" ]]; then
    RUN_JSON="${BROADCAST_DIR}/run-latest.json"
  else
    RUN_JSON="$(ls -t "${BROADCAST_DIR}"/run-*.json 2>/dev/null | head -n1 || true)"
  fi
else
  RUN_JSON=""
fi

DEPLOYED_ADDR=""
if [[ -n "${RUN_JSON:-}" && -f "${RUN_JSON}" ]]; then
  # Foundry moderno: transactions[].contractAddress con transactionType=="CREATE"
  DEPLOYED_ADDR="$(jq -r '.transactions[]? | select(.transactionType=="CREATE") | .contractAddress // empty' "${RUN_JSON}" | tail -n1)"
  if [[ -z "${DEPLOYED_ADDR}" || "${DEPLOYED_ADDR}" == "null" ]]; then
    # Fallback a receipts[].contractAddress
    DEPLOYED_ADDR="$(jq -r '.receipts[]? | .contractAddress // empty' "${RUN_JSON}" | tail -n1)"
  fi
fi

if [[ -n "${DEPLOYED_ADDR}" ]]; then
  echo "{\"address\":\"${DEPLOYED_ADDR}\",\"chainId\":${CHAIN_ID}}" > "${WEB_CONTRACT_DIR}/GreenSupplyChain1155.address.json"
  echo "✅ Deployed at ${DEPLOYED_ADDR} (chainId=${CHAIN_ID})"
else
  echo "⚠️  No pude extraer la address. Revisa ${BROADCAST_DIR}/"
fi

popd >/dev/null
echo "✅ Listo."