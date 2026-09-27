# Security Policy

## Supported versions

Security fixes are applied on the default branch (`main`) for the latest release tag when releases exist.

## Reporting a vulnerability

Please **do not** open a public issue for security-sensitive reports.

Email **maxmccutcheon59@gmail.com** with:

- Affected repository and version/commit
- Description of the issue and impact
- Steps to reproduce (PoC if available)

You should receive an acknowledgement within a few days. This is a student-maintained project; response times may vary.

## Scope

The supported artifact is the **MIT Rust LSM engine** (library, tests, and `examples/quickstart.rs`). It is a local embedded store for learning and systems work: defensive and educational. It does not open a network port, create accounts, or send telemetry.

The site under `website/` includes **experimental** Cloud, Stripe, and Agent pages. That surface does not provision storage, does not run a multi-tenant data plane, and does not offer an uptime target. A configured Stripe checkout can charge a card; it does not create a hosted database. The in-browser playground is a mock, not this crate.

There is **no Privacy Policy and no Terms of Service**. None are implied. The engine is MIT; the website is not a user service that processes customer key-value data.

Reports about missing hosted-product features, theoretical issues without a practical path, or social-engineering the maintainer are out of scope.