# Services — Gateways

## Module: Gateways

### SVC-G01 · GatewayService [domain, internal, Gateways]
- Methods: `createGateway`, `listGateways`, `listGatewaysPaginated`, `getGateway`, `updateGateway`, `deleteGateway`
- Deps: `GatewayRepository`, `AppRepository`, `CurrencyService`, `GatewayConfigEncryption`, `AvailableGatewayService`

### SVC-G02 · GatewayRuleService [domain, internal, Gateways]
- Methods: `createRule`, `getRulesByAppId`, `listGatewayRulesPaginated`, `getRuleById`, `updateRule`, `deleteRule`, `toggleRuleActive`, `evaluateRule`, `getMatchingRules`, `getGatewayScores`, `createSeedRules`
- Deps: `GatewayRuleRepository`

### SVC-G03 · GatewayRequestService [integration, external, Gateways]
- Methods: `createRequest`, `submitRequest`, `updateRequest`, `getRequest`, `listRequests`, `updateStatus`, `addCorrections`, `forwardToGateway`, `handleGatewayWebhook`
- Deps: `GatewayRequestRepository`, `UserRepository`, `EncryptionServiceFactory`, `GatewayFactory`

### SVC-G04 · GatewaySelectionService [domain, internal, Gateways]
- Methods: `selectGateway`, `getOrderedGateways`
- Deps: gateway rules, app gateways, criteria evaluators

### SVC-G05 · GatewayFactory [domain, internal, Gateways]
- Methods: `initialize`, `register`, `create`, `isRegistered`, `getRegisteredGateways`
- Deps: Stripe, PayPal, Moyasar, MyFatoorah, Test gateway adapters

### SVC-G06 · GatewayConfigEncryption [domain, internal, Gateways]
- Methods: `encryptConfig`, `decryptConfig`, `extractGatewayPublicConfig` (static)
- Deps: `getEncryptionService`

### SVC-G07 · AvailableGatewayService [domain, internal, Gateways]
- Methods: `getAvailableGateways`, `getAllGateways`, `getGatewayByName`, CRUD, `invalidateCache`
- Deps: `AvailableGatewayRepository`, `CacheService`

### SVC-G08 · AppGatewayService [domain, internal, Gateways]
- Methods: `getGateway`, `isGatewayAvailableForApp`, `getAppGateways`
- Deps: `GatewayFactory`, `GatewayRepository`, `GatewayConfigEncryption`

### SVC-G09 · BaseGateway + adapters [integration, external, Gateways]
- StripeGateway, PaypalGateway, MoyasarGateway, MyFatoorahGateway, TestGateway
- Methods: `processPayment`, `refundPayment`, `getPaymentStatus`, `healthCheck`; optional `handleWebhook`, `submitGatewayRequest`
