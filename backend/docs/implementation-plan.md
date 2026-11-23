# Halal Sheba Laravel implementation

User-approved architecture: Next.js UI in frontend/, Laravel API in backend/.
Preserve the storefront design and migrate the existing catalog without inventing stock counts.

1. Isolate applications, configure same-origin API proxy and Laravel session/CSRF authentication.
2. Add relational commerce migrations, role authorization and a private administrator creation command.
3. Implement products, variants, images, categories, brands and additive inventory transactions.
4. Implement authoritative checkout, idempotency, reservations, status transitions and stock restoration.
5. Build responsive admin pages, reports, customers, settings, coupons, reviews and content controls.
6. Connect storefront catalog and checkout to Laravel. Public responses use explicit safe fields.
7. Test authorization, inventory invariants, product lifecycle and order lifecycle; build frontend.
8. Document deployment, email, backups, initial import and external payment limitations.

Inventory rule: physical minus reserved is available. New orders reserve units; shipped orders consume physical and reserved units. Cancellation before shipment releases reservations. Returned orders restore physical stock once. Refunds do not implicitly restock merchandise.
Money is stored as integer paisa. Revenue includes paid delivered orders; profit reports label estimates.
Production uses PostgreSQL/MySQL with row locking. SQLite is for local development/tests.
