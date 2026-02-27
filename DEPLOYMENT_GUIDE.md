# 🚀 **Green Energy Traceability Scrow – Energy Traceability Platform (GreenEnergy)**

Guía paso a paso para desplegar el proyecto **GreenEnergy** en local con **Anvil/Foundry** y correr la **DApp web**. Incluye cómo **usar** la app y secciones de solución de problemas.

> ℹ️ **Contexto**: 

## 📚 Índice



## ✅ Requisitos
- **Foundry** (incluye `anvil` y `forge`)
- **Nect.js** + **Node.js** + **npm**/**pnpm**
- **MetaMask** en el navegador

Nota: En la carpeta `sc` verifica que tengas instalado OpenZeppelin si no puede instalarlo con: `forge install OpenZeppelin/openzeppelin-contracts`

> Sugerencia: Ten dos terminales: una para **anvil** y otra para **build/deploy**.

## ✅ 1) Clonar el proyecto desde la url seleccionada, verifica que tienes las carpeta del proyecto de foundry "/sc" y la carpeta del proyecto web (dapp) /web.
 
## ✅ 2) Iniciar la red local

En una terminal, entra a la carpeta de contratos `sc/` y levanta **Anvil**:

```bash
cd sc/
anvil
```

El comando anterior  inicia una blockchain local en `http://127.0.0.1:8545` con **10 cuentas**, cada una con **10,000 ETH**.
Debes ver usa salida parecida al siguiente ejemplo (que debe mostrar las cuentas de anvil que se te activan): 

```

                             _   _
                            (_) | |
      __ _   _ __   __   __  _  | |
     / _` | | '_ \  \ \ / / | | | |
    | (_| | | | | |  \ V /  | | | |
     \__,_| |_| |_|   \_/   |_| |_|

    1.4.4-stable (05794498bf 2025-11-03T23:44:21.031788094Z)
    https://github.com/foundry-rs/foundry

Available Accounts
==================

(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000.000000000000000000 ETH)
(1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000.000000000000000000 ETH)
```
> 💡 **Tip importante:** Copia la **private key** de la primera cuenta que muestra Anvil; se usará para el deployment y como cuenta para el Role ADMIN.

---

## ✅ 3) Variables de entorno (contratos)

En la carpeta `sc`:

```bash
cp .env.example .env
```

Edita `.env` para que quede así:
```env
RPC_URL=http://127.0.0.1:8545
ANVIL_FIRST_ACCOUNT=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CHAIN_ID=31337
BASE_URI=https://example.json
```

## ✅ 4) Compilar, testear y desplegar contratos

Abre **otra terminal** (sin cerrar la de `anvil`) y ejecuta:

```bash
cd sc

# Compilar contratos
forge build

# Ejecutar tests
forge test
```

### 🚀 Deploy
Ejecuta el script de despliegue desde dentro de la carpeta /sc (y exportación de ABIs):

```bash
./scripts/deploy_and_export_abis.sh
```

> 📦 **ABIs**: El script exporta los ABIs para el front (ruta definida en el propio script).

Al finalizar deber ver esta salida: 

```

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /mnt/c/Users/carlo/Documents/foundry_practices/ProyectosObligatoriosEthereum/renew-energy/sc/broadcast/Deploy.s.sol/31337/run-latest.json

Sensitive values saved to: /mnt/c/Users/carlo/Documents/foundry_practices/ProyectosObligatoriosEthereum/renew-energy/sc/cache/Deploy.s.sol/31337/run-latest.json

[3/4] Exportando ABI a web/src/contracts…
[4/4] Extrayendo address del deployment…
✅ Deployed at 0x5fbdb2315678afecb367f032d93f642f64180aa3 (chainId=31337)
✅ Listo.

```
> 🏆 **Importante**: Copia la direccion de despliegue "Deployed at" en este caso 0x5fbdb2315678afecb367f032d93f642f64180aa3 (puede cambiar)
---

## ✅ 5) Configurar la DApp web

Abre una otra terminal y muevete a al folder del proyecto de next.js "/web"

### 4.1) Variables de entorno
En la carpeta del front (por ejemplo `webapp`):

```bash
cp .env.example .env.local
```

> 🏆 **Importante**: En .env.local verifica que la variable NEXT_PUBLIC_CONTRACT_ADDRESS tenga el mismo valor de "Deployed at" copaido del script sino sustituyelo


### 4.2) Iniciar la aplicación

```bash
cd web
npm install
npm run dev
```

La app quedará disponible en **http://localhost:3000**

1) MetaMask → **Settings → Networks → Add Network**
   - **Network Name**: Localhost
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
2) Importa las primeras 5 cuentas de Anvil cuentas de Anvil como minimo para probar el proyecto (**Import Account** con *private key*):
   ```
(0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80  -----> La cuenta asociada a esta private key es el owner del contrato y tu Role ADMIN
(1) 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d  -----> Producer
(2) 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a  -----> Factory
(3) 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6  -----> Retailer
(4) 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a  -----> Consumer
   ```
---

## ✅ 5) 🧭 Cómo usar la DApp


---

## 🧰 Comandos rápidos

```bash
# 1) Levantar anvil
yarn anvil   # si tienes alias; si no, ejecuta: anvil

# 2) Build & tests (en sc/)
forge build && forge test

# 3) Deploy + export ABIs (en sc/)
./scripts/deploy_and_export_abis.sh

# 4) Front (en webapp/)
npm install && npm run dev
```

---

## 🧯 Solución de problemas