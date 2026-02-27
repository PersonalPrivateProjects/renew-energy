# Estandar ERC1155 - Green Supply Chain

## ¿Por qué ERC1155?

Para este proyecto el profesor mencionó el crear un token genérico para entender los fundamentos. Sin embargo, decidí usar **ERC1155** porque en un proyecto real es lo que entendí se debería usar, y quise ver que complicaciones se me podrian presentar con el hecho de tener que respetar el estandar.

### Razones prácticas

1. **Es lo que se usa en producción**: Los proyectos de supply chain real necesitan manejar múltiples tipos de activos (materias primas, productos intermedios, productos terminados). ERC1155 permite gestionar todo esto en un solo contrato, reduciendo costos de despliegue y complejidad de gestión.

2. **Eficiencia en gas**: Un solo contrato para múltiples tokens es significativamente más económico que desplegar múltiples contratos ERC-20 o ERC-721.

3. **Interoperabilidad**: Usar un estándar reconocido permite que el contrato interactúe con wallets, exchanges y otras herramientas sin necesidad de adaptadores personalizados.

### Complicaciones enfrentadas

- **Mayor complejidad en la implementación**: A diferencia de un token simple, ERC1155 requiere manejar múltiples IDs de token y sus respectivos balances en una sola estructura.

- **Gestión de permisos**: Implementar control de acceso granular (roles para fabricantes, transportistas, consumidores) sobre un estándar ya complejo añade capas de lógica.

- **Transferencias parciales**: Trabajar con amounts (no solo existencia/ausencia) requiere validar correctamente las cantidades en cada operación.

### Clases relacionadas implementadas

El contrato hace uso de clases del ecosistema OpenZeppelin:
- `ERC1155`: Implementación base del estándar
- `AccessControl`: Control de roles y permisos
- `ERC1155URIStorage`: Gestión de URIs dinámicas para metadatos

Esta decisión me permitió entender no solo cómo funciona un token, sino cómo se integran múltiples componentes en un sistema complejo y real.
