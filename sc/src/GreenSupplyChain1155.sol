// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title GreenSupplyChain1155
 * @notice Sistema de trazabilidad y tokenización para cadena de suministro de energía renovable.
 *         - ERC-1155 multi-activo con IDs para materias primas y derivados/certificados.
 *         - Usuarios con registro/aprobación (Admin) y roles operativos: Producer, Factory, Retailer, Consumer.
 *         - Flujo dirigido y controlado con "ofertas de transferencia" y aceptación/rechazo (escrow on-chain).
 *         - Trazabilidad por linaje (parentId) y metadatos on-chain (features JSON) por tokenId.
 *
 * Diseño clave:
 *  - Admin NO es actor operativo: se maneja con AccessControl y, opcionalmente, en users con Role.NONE (no transferible).
 *  - Transformaciones crean NUEVOS tokenId (child) a partir de quemar unidades del padre (raw -> certificado/derivado).
 *  - Se deshabilitan safeTransferFrom/safeBatchTransferFrom para forzar el flujo con aceptación.
 */

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract GreenSupplyChain1155 is
    ERC1155,
    ERC1155Supply,
    AccessControl,
    Pausable,
    ReentrancyGuard,
    IERC1155Receiver
{
    // =========================
    //         Tipos
    // =========================

    /// @dev Role.NONE se usa como marcador "no operativo" (p.ej., admin) dentro del censo de usuarios.
    enum Role { NONE, PRODUCER, FACTORY, RETAILER, CONSUMER }

    enum UserStatus { None, Pending, Approved, Rejected, Canceled }
    enum TransferStatus { None, Pending, Accepted, Rejected, Canceled }

    struct User {
        Role role;
        UserStatus status;
    }

    /// @dev Estructura de una "oferta de transferencia" con escrow on-chain.
    struct TransferOffer {
        uint256 id;
        address from;
        address to;
        uint256 tokenId;
        uint256 amount;
        TransferStatus status;
        uint64 createdAt;
    }

    // =========================
    //        Storage
    // =========================
    
    // Existira un unico admin que apruebe/rechace usuarios, pause el sistema, etc. No es actor operativo de la cadena, por lo que no tiene un rol específico en el flujo (podría estar en users con Role.NONE/Approved solo para tener su estado registrado).
    
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

    /// @notice Censo de usuarios con su rol operativo y estado de aprobación.
    mapping(address => User) public users;

    /// @notice Linaje: tokenId => parentId (0 si es raíz).
    mapping(uint256 => uint256) public parentOf;

    /// @notice URI específica por tokenId (metadatos off-chain).
    mapping(uint256 => string) private _tokenURIs;

    /// @notice Metadatos on-chain por tokenId (JSON arbitrario, p.ej. { "kWh": 50, "fuente": "solar", ... }): se usa un mapping porque el token ERC-1155 tiene un mapping de features por tokenId.
    mapping(uint256 => string) public featuresOf;

    /// @notice Autoincremental de ofertas de transferencia (escrow).
    uint256 public nextTransferId;
    mapping(uint256 => TransferOffer) public transfers;

    /// @notice Autoincremental de IDs de token (ERC-1155).
    uint256 public nextTokenId;

    // =========================
    //         Eventos
    // =========================
    /**
     * @dev Eventos exhaustivos para que el frontend pueda indexar y construir
     *     - Trazabilidad: TokenCreated (con parentId y features), TokenTransformed
     *     - Gestión de usuarios: UserRegistered/Approved/Rejected/Canceled
     *     - Transferencias: Initiated/Accepted/Rejected/Canceled
     *     - Consumo final: Redeemed
     */
    event UserRegistered(address indexed user, Role role);
    event UserApproved(address indexed user, Role role);
    event UserRejected(address indexed user);
    event UserCanceled(address indexed user);

    event TokenCreated(
        uint256 indexed id,
        address indexed creator,
        Role role,
        uint256 amount,
        uint256 parentId,
        string uri,
        string featuresJson
    );

    event TokenTransformed(
        uint256 indexed childId,
        uint256 indexed parentId,
        address indexed factory,
        uint256 amount
    );

    event TransferInitiated(
        uint256 indexed transferId,
        address indexed from,
        address indexed to,
        uint256 tokenId,
        uint256 amount
    );

    event TransferAccepted(uint256 indexed transferId);
    event TransferRejected(uint256 indexed transferId);
    event TransferCanceled(uint256 indexed transferId);
    event Redeemed(address indexed consumer, uint256 indexed tokenId, uint256 amount);

    // =========================
    //          Errors
    // =========================
    error NotAdmin();
    error NotApprovedUser();
    error InvalidRole();
    error AlreadyRegistered();
    error InvalidStatus();
    error ZeroAmount();
    error DirectTransferDisabled();
    error InvalidFlow(Role fromRole, Role toRole);
    error TransferNotPending();
    error NotReceiver();
    error NotSender();
    error UnknownTransfer();
    error InvalidToken();

    // =========================
    //       Constructor
    // =========================

    /**
     * @param baseURI URI base opcional (fallback) para metadatos ERC-1155.
     * @dev El deployer recibe ADMIN_ROLE. Lo registramos en `users` con Role.NONE/Approved
     *      solo para dejar explícito que no es actor operativo del flujo.
     */
    constructor(string memory baseURI) ERC1155(baseURI) {
        _grantRole(ADMIN_ROLE, msg.sender);
        users[msg.sender] = User({role: Role.NONE, status: UserStatus.Approved});
    }

    // =========================
    //     Helpers / Modifiers
    // =========================

    // hasRole viene de AccessControl (ventajas de usar herencia para procesos testeados). Solo el Admin puede aprobar/rechazar usuarios, pausar el sistema, etc.
    function _onlyAdmin() internal view {
        if (!hasRole(ADMIN_ROLE, msg.sender)) revert NotAdmin(); 
    }

    function _isApproved(address user) internal view returns (bool) {
        return users[user].status == UserStatus.Approved;
    }

    function _validFlow(Role fromR, Role toR) internal pure returns (bool) {
        if (fromR == Role.PRODUCER && toR == Role.FACTORY) return true;
        if (fromR == Role.FACTORY  && toR == Role.RETAILER) return true;
        if (fromR == Role.RETAILER && toR == Role.CONSUMER) return true;
        return false;
    }

    modifier onlyApproved(Role expected) {
        _onlyApproved(expected);
        _;
    }

    
   function _onlyApproved(Role expected) internal view {
       if (!_isApproved(msg.sender)) revert NotApprovedUser();
       if (users[msg.sender].role != expected) revert InvalidRole();
   }


    // =========================
    //     Gestión de usuarios
    // =========================

    /**
     * @notice Un usuario solicita registro en un rol operativo.
     * @dev Queda en estado Pending hasta que el Admin lo apruebe o rechace.
     */
    function register(Role role) external whenNotPaused {
        if (role == Role.NONE) revert InvalidRole();
        User storage u = users[msg.sender];
        if (u.status == UserStatus.Pending || u.status == UserStatus.Approved) revert AlreadyRegistered();

        users[msg.sender] = User({role: role, status: UserStatus.Pending});
        emit UserRegistered(msg.sender, role);
    }

    /**
     * @notice Admin aprueba al usuario para un rol operativo.
     * @dev Permitimos aprobar desde Pending/Rejected/Canceled → Approved.
     */
    function approveUser(address user, Role role) external whenNotPaused {
        _onlyAdmin();
        if (role == Role.NONE) revert InvalidRole();

        User storage u = users[user];
        if (u.status == UserStatus.Approved) revert AlreadyRegistered();
        if (
            u.status != UserStatus.Pending &&
            u.status != UserStatus.Rejected &&
            u.status != UserStatus.Canceled
        ) {
            revert InvalidStatus();
        }

        u.role = role;
        u.status = UserStatus.Approved;
        emit UserApproved(user, role);
    }

    /**
     * @notice Admin rechaza una solicitud en Pending.
     */
    function rejectUser(address user) external whenNotPaused {
        _onlyAdmin();
        User storage u = users[user];
        if (u.status != UserStatus.Pending) revert InvalidStatus();
        u.status = UserStatus.Rejected;
        emit UserRejected(user);
    }

    /**
     * @notice El propio usuario cancela su registro (cualquiera sea su estado distinto de None).
     */
    function cancelMyRegistration() external whenNotPaused {
        User storage u = users[msg.sender];
        if (u.status == UserStatus.None) revert InvalidStatus();
        u.status = UserStatus.Canceled;
        emit UserCanceled(msg.sender);
    }

    // =========================
    //        Tokenización
    // =========================

    /**
     * @notice Producer crea un token raíz (materia prima).
     * @param amount  Cantidad a acuñar.
     * @param tokenUri  URI del metadata (IPFS/HTTP).
     * @param featuresJson  JSON on-chain con características útiles (ej: {"kWh":100,"fuente":"solar"}).
     * @return tokenId  Nuevo ID de token.
     *
     * Eventos:
     *  - TokenCreated(id, creator, role, amount, parentId=0, uri, featuresJson)
     */
    function mintRaw(
        uint256 amount,
        string calldata tokenUri,
        string calldata featuresJson
    )
        external
        whenNotPaused
        onlyApproved(Role.PRODUCER)
        returns (uint256 tokenId)
    {
        if (amount == 0) revert ZeroAmount();

        tokenId = ++nextTokenId;
        parentOf[tokenId] = 0;
        _tokenURIs[tokenId] = tokenUri;
        featuresOf[tokenId] = featuresJson;

        _mint(msg.sender, tokenId, amount, "");
        emit TokenCreated(tokenId, msg.sender, users[msg.sender].role, amount, 0, tokenUri, featuresJson);
    }

    /**
     * @notice Factory transforma: quema unidades del padre y acuña un hijo (derivado/certificado).
     * @param parentId   ID del token padre (debe existir y el caller debe poseerlo).
     * @param amount     Cantidad a transformar (se quema del padre y se acuña igual cantidad del hijo).
     * @param childUri   URI del nuevo token.
     * @param featuresJson JSON on-chain para el hijo.
     * @return childId   Nuevo ID del token hijo.
     *
     * Eventos:
     *  - TokenCreated(childId, creator=factory, role, amount, parentId, uri, features)
     *  - TokenTransformed(childId, parentId, factory, amount)
     */
    function transform(
        uint256 parentId,
        uint256 amount,
        string calldata childUri,
        string calldata featuresJson
    )
        external
        whenNotPaused
        onlyApproved(Role.FACTORY)
        returns (uint256 childId)
    {
        if (amount == 0) revert ZeroAmount();
        if (parentId == 0 || !exists(parentId)) revert InvalidToken();

        // Consume (quema) del padre en posesión de la Factory
        _burn(msg.sender, parentId, amount);

        // Crea nuevo token hijo
        childId = ++nextTokenId;
        parentOf[childId] = parentId;
        _tokenURIs[childId] = childUri;
        featuresOf[childId] = featuresJson;

        _mint(msg.sender, childId, amount, "");
        emit TokenCreated(childId, msg.sender, users[msg.sender].role, amount, parentId, childUri, featuresJson);
        emit TokenTransformed(childId, parentId, msg.sender, amount);
    }

    // =========================
    //  Transferencias dirigidas
    //   con escrow + aceptación
    // =========================

    /**
     * @notice Emisor inicia una transferencia hacia un receptor válido según la matriz de flujo.
     * @dev Mueve los tokens a escrow (este contrato) hasta la aceptación o rechazo.
     *      Rutas válidas: PRODUCER→FACTORY, FACTORY→RETAILER, RETAILER→CONSUMER.
     *
     * Eventos:
     *  - TransferInitiated(transferId, from, to, tokenId, amount)
     */
    function initiateTransfer(address to, uint256 tokenId, uint256 amount)
        external
        whenNotPaused
        nonReentrant
    {
        if (!_isApproved(msg.sender) || !_isApproved(to)) revert NotApprovedUser();
        if (amount == 0) revert ZeroAmount();
        if (!exists(tokenId)) revert InvalidToken();

        Role fromR = users[msg.sender].role;
        Role toR = users[to].role;
        if (!_validFlow(fromR, toR)) revert InvalidFlow(fromR, toR);

        // Escrow: el contrato recibe temporalmente los tokens
        _safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

        uint256 tid = ++nextTransferId;
        transfers[tid] = TransferOffer({
            id: tid,
            from: msg.sender,
            to: to,
            tokenId: tokenId,
            amount: amount,
            status: TransferStatus.Pending,
            createdAt: uint64(block.timestamp)
        });

        emit TransferInitiated(tid, msg.sender, to, tokenId, amount);
    }

    /**
     * @notice Receptor acepta la transferencia pendiente. Los tokens salen del escrow hacia el receptor.
     * Eventos:
     *  - TransferAccepted(transferId)
     */
    function acceptTransfer(uint256 transferId)
        external
        whenNotPaused
        nonReentrant
    {
        TransferOffer storage t = transfers[transferId];
        if (t.id == 0) revert UnknownTransfer();
        if (t.status != TransferStatus.Pending) revert TransferNotPending();
        if (msg.sender != t.to) revert NotReceiver();

        t.status = TransferStatus.Accepted;
        _safeTransferFrom(address(this), t.to, t.tokenId, t.amount, "");
        emit TransferAccepted(transferId);
    }

    /**
     * @notice Receptor rechaza la transferencia pendiente. Los tokens retornan al emisor.
     * Eventos:
     *  - TransferRejected(transferId)
     */
    function rejectTransfer(uint256 transferId)
        external
        whenNotPaused
        nonReentrant
    {
        TransferOffer storage t = transfers[transferId];
        if (t.id == 0) revert UnknownTransfer();
        if (t.status != TransferStatus.Pending) revert TransferNotPending();
        if (msg.sender != t.to) revert NotReceiver();

        t.status = TransferStatus.Rejected;
        _safeTransferFrom(address(this), t.from, t.tokenId, t.amount, "");
        emit TransferRejected(transferId);
    }

    /**
     * @notice Emisor cancela su propia transferencia si aún está pendiente. Devuelve tokens desde escrow al emisor.
     * Eventos:
     *  - TransferCanceled(transferId)
     */
    function cancelTransfer(uint256 transferId)
        external
        whenNotPaused
        nonReentrant
    {
        TransferOffer storage t = transfers[transferId];
        if (t.id == 0) revert UnknownTransfer();
        if (t.status != TransferStatus.Pending) revert TransferNotPending();
        if (msg.sender != t.from) revert NotSender();

        t.status = TransferStatus.Canceled;
        _safeTransferFrom(address(this), t.from, t.tokenId, t.amount, "");
        emit TransferCanceled(transferId);
    }

    // =========================
    //       Consumo final
    // =========================

    /**
     * @notice Consumer redime (quema) sus tokens, representando consumo final.
     * Eventos:
     *  - Redeemed(consumer, tokenId, amount)
     */
    function redeem(uint256 tokenId, uint256 amount)
        external
        whenNotPaused
        onlyApproved(Role.CONSUMER)
    {
        if (amount == 0) revert ZeroAmount();
        if (!exists(tokenId)) revert InvalidToken();

        _burn(msg.sender, tokenId, amount);
        emit Redeemed(msg.sender, tokenId, amount);
    }

    // =========================
    //     Control del Admin
    // =========================

    function pause() external {
        _onlyAdmin();
        _pause();
    }

    function unpause() external {
        _onlyAdmin();
        _unpause();
    }

    // =========================
    //         Metadata
    // =========================

    /// @notice Soporta URI por ID. Si no hay específica, retorna la base de ERC-1155.
    function uri(uint256 id) public view override returns (string memory) {
        string memory u = _tokenURIs[id];
        if (bytes(u).length > 0) return u;
        return super.uri(id);
    }

    // =========================
    //      Overrides ERC-1155
    // =========================

    /**
     * @dev Deshabilitamos transferencias directas para forzar el flujo con aceptación.
     *      Esto evita "saltarse" la lógica de permisos y escrow.
     */
    function safeTransferFrom(address, address, uint256, uint256, bytes memory) public pure override {
        revert DirectTransferDisabled();
    }

    function safeBatchTransferFrom(address, address, uint256[] memory, uint256[] memory, bytes memory) public pure override {
        revert DirectTransferDisabled();
    }

    /**
     * @dev Hook unificado en OZ v5. Aplicamos `whenNotPaused` y actualizamos Supply.
     */
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
        whenNotPaused
    {
        super._update(from, to, ids, values);
    }

    /**
     * @dev Declaración de interfaces soportadas (ERC165).
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155Receiver).interfaceId ||
            ERC1155.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }

    // =========================
    //   IERC1155Receiver (escrow)
    // =========================
    /**
     * @dev Permite que el contrato reciba sus propios tokens en escrow.
     *      Retorna el selector para indicar aceptación de la recepción.
     */
    function onERC1155Received(address, address, uint256, uint256, bytes calldata)
        external
        pure
        returns (bytes4)
    {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata)
        external
        pure
        returns (bytes4)
    {
        return this.onERC1155BatchReceived.selector;
    }

    // =========================
    //  Nota sobre herencias:
    // =========================
    /**
     * - AccessControl:
     *      Gestiona permisos administrativos (DEFAULT_ADMIN_ROLE) para aprobar/rechazar usuarios,
     *      pausar el sistema, etc. Separa claramente el "gobierno" del contrato de los roles
     *      operativos de la cadena (Producer/Factory/Retailer/Consumer).
     *
     * - Pausable:
     *      Permite pausar operaciones (mint/transfer/transform/redeem/registro) ante incidentes.
     *      Integramos el control de pausa en el hook _update y en funciones externas (whenNotPaused).
     *
     * - ReentrancyGuard:
     *      Protege funciones con lógica sensible y múltiples movimientos (initiate/accept/reject/cancel)
     *      de posibles ataques de reentrancia, especialmente por el uso de escrow y callbacks ERC-1155.
     *
     * - IERC1155Receiver:
     *      Habilita que el contrato reciba tokens ERC-1155 (necesario para el escrow en initiateTransfer).
     *      Sin esto, las transferencias hacia el contrato fallarían por no implementar el receptor.
     */
}
