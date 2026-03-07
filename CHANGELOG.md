## [1.6.2](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.6.1...v1.6.2) (2026-03-07)

### 🧹 Chores

* **deps:** bump actions/download-artifact from 7 to 8 ([90a0e57](https://github.com/armandwipangestu/nestjs-boilerplate/commit/90a0e57ce7297ecf13fb2179c2297fb9165a6c9d))

## [1.6.1](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.6.0...v1.6.1) (2026-03-07)

### 🧹 Chores

* **deps:** bump actions/upload-artifact from 6 to 7 ([2041d8c](https://github.com/armandwipangestu/nestjs-boilerplate/commit/2041d8c0b6bf8d576730e4807320d3a8eb922560))

## [1.6.0](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.5.1...v1.6.0) (2026-03-07)

### ✨ Features

* **logging:** add database query logging in Prisma layer ([0e98ba2](https://github.com/armandwipangestu/nestjs-boilerplate/commit/0e98ba219068e61203885a99a430416717249c39))

### 🧹 Chores

* **release:** 1.5.0-rc.3 [skip ci] ([e9eb8d5](https://github.com/armandwipangestu/nestjs-boilerplate/commit/e9eb8d50989248128616d5415119965211071c25))
* **release:** 1.6.0-rc.1 [skip ci] ([a6ae0e9](https://github.com/armandwipangestu/nestjs-boilerplate/commit/a6ae0e918e9eb9ee1bff68cd04589376dbf8a575))

## [1.6.0-rc.1](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.5.0...v1.6.0-rc.1) (2026-03-07)

### ✨ Features

* **logging:** add database query logging in Prisma layer ([0e98ba2](https://github.com/armandwipangestu/nestjs-boilerplate/commit/0e98ba219068e61203885a99a430416717249c39))

### 🧹 Chores

* **release:** 1.5.0-rc.3 [skip ci] ([e9eb8d5](https://github.com/armandwipangestu/nestjs-boilerplate/commit/e9eb8d50989248128616d5415119965211071c25))
* update README ([e0d7860](https://github.com/armandwipangestu/nestjs-boilerplate/commit/e0d78603445c399c8f27315c02544d5ca8a6a2c5))

## [1.5.0](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.4.2...v1.5.0) (2026-03-04)

### ✨ Features

* **observability:** add opentelemetry integration for traces and metrics ([7a32180](https://github.com/armandwipangestu/nestjs-boilerplate/commit/7a32180056309927914748b16403d6ce750c5c83))
* **observability:** add setup using opentelemetry, grafana, loki, alloy, tempo, and prometheus ([10c849b](https://github.com/armandwipangestu/nestjs-boilerplate/commit/10c849babd93ede87d77b60ff3aec30be56a5d33))
* **observability:** add stres test or load test using k6 ([d520be1](https://github.com/armandwipangestu/nestjs-boilerplate/commit/d520be12caddce92f22ec4fa52a9d4a477a14848))
* **test:** add unit and e2e tests coverage ([f9ec662](https://github.com/armandwipangestu/nestjs-boilerplate/commit/f9ec662a79785fb59c6a178e54558d38520a4111))

### 🐛 Bug Fixes

* **ci:** add prisma generate before run unit tests ([d8373eb](https://github.com/armandwipangestu/nestjs-boilerplate/commit/d8373ebec947fdea7ba0faf4186b0f93b11bc293))
* **ci:** change from npx to bunx ([b1396f6](https://github.com/armandwipangestu/nestjs-boilerplate/commit/b1396f6aa7639f884e028cceed09d002ad43294c))
* **ci:** lint ([ab1820d](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ab1820dbfaa7e1573ba2e4278d59b6ca413f57a0))
* **ci:** remove node_modules from cache ([4afb591](https://github.com/armandwipangestu/nestjs-boilerplate/commit/4afb5913a4c0ae786bdc864581042cf3c6e090ce))
* **ci:** revert to nodejs 25 and use npx ([ebdf2de](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ebdf2de73b783cec9fa5a8b6b547c215675db9f6))

### 🧹 Chores

* add grafana screenshot ([ae5a67d](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ae5a67dddf8264496f308fd2e0023ca916cc2cc2))
* disable automatic database seed when container up ([69fffc0](https://github.com/armandwipangestu/nestjs-boilerplate/commit/69fffc077d3a05fdaf1728fb1b42cb5d7cf763b1))
* **release:** 1.5.0-rc.1 [skip ci] ([33d3588](https://github.com/armandwipangestu/nestjs-boilerplate/commit/33d3588f258dd3c10367a2dabb78c50dac16c862))
* **release:** 1.5.0-rc.2 [skip ci] ([ed96b31](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ed96b31b54a96c033e574ff82017e45e9c0d9e20))
* update assets ([be186de](https://github.com/armandwipangestu/nestjs-boilerplate/commit/be186de702e99bb3f5f1404c7d4db57194add83e))
* update bruno ([fc69839](https://github.com/armandwipangestu/nestjs-boilerplate/commit/fc69839230d59878b7431b0650aca5d26b116ec1))
* update label ([48753c2](https://github.com/armandwipangestu/nestjs-boilerplate/commit/48753c24224c08f6854a29dd85acfa47912a2276))
* using ghcr for image ([8db9df2](https://github.com/armandwipangestu/nestjs-boilerplate/commit/8db9df2960c47077451893953a92a32f10b73d9b))

### ♻️ Refactor

* **database:** add warning seed when in production environment ([81f9c9d](https://github.com/armandwipangestu/nestjs-boilerplate/commit/81f9c9da527cc3c954638d7f70b9113e40bb181e))
* **observability:** add application metrics ([02335f2](https://github.com/armandwipangestu/nestjs-boilerplate/commit/02335f2b96ada847c8c1963ec9c32a31234068c6))
* **observability:** add database slow query ([8aea84a](https://github.com/armandwipangestu/nestjs-boilerplate/commit/8aea84a19b1ef241fdf177ea46044a33ace329fc))
* **observability:** add more app attribute, runtime metrics, and remove proxy metrics endpoint ([9651f5f](https://github.com/armandwipangestu/nestjs-boilerplate/commit/9651f5f02f8cc9089bcf5a7e310574c74c607474))
* **observability:** adjust dashboard metrics with application ([348bf1e](https://github.com/armandwipangestu/nestjs-boilerplate/commit/348bf1ec26380d5e4b59601fe1f405090a53a30f))
* **service:** move access data or database query to repository pattern ([a247fba](https://github.com/armandwipangestu/nestjs-boilerplate/commit/a247fbaf6243a41655cff41224b4d12b5411da8b))

## [1.5.0-rc.2](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.5.0-rc.1...v1.5.0-rc.2) (2026-03-04)

### ✨ Features

* **test:** add unit and e2e tests coverage ([f9ec662](https://github.com/armandwipangestu/nestjs-boilerplate/commit/f9ec662a79785fb59c6a178e54558d38520a4111))

### 🐛 Bug Fixes

* **ci:** add prisma generate before run unit tests ([d8373eb](https://github.com/armandwipangestu/nestjs-boilerplate/commit/d8373ebec947fdea7ba0faf4186b0f93b11bc293))
* **ci:** change from npx to bunx ([b1396f6](https://github.com/armandwipangestu/nestjs-boilerplate/commit/b1396f6aa7639f884e028cceed09d002ad43294c))
* **ci:** remove node_modules from cache ([4afb591](https://github.com/armandwipangestu/nestjs-boilerplate/commit/4afb5913a4c0ae786bdc864581042cf3c6e090ce))
* **ci:** revert to nodejs 25 and use npx ([ebdf2de](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ebdf2de73b783cec9fa5a8b6b547c215675db9f6))

### 🧹 Chores

* update bruno ([fc69839](https://github.com/armandwipangestu/nestjs-boilerplate/commit/fc69839230d59878b7431b0650aca5d26b116ec1))
* using ghcr for image ([8db9df2](https://github.com/armandwipangestu/nestjs-boilerplate/commit/8db9df2960c47077451893953a92a32f10b73d9b))

### ♻️ Refactor

* **service:** move access data or database query to repository pattern ([a247fba](https://github.com/armandwipangestu/nestjs-boilerplate/commit/a247fbaf6243a41655cff41224b4d12b5411da8b))

## [1.5.0-rc.1](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.4.2...v1.5.0-rc.1) (2026-03-04)

### ✨ Features

* **observability:** add opentelemetry integration for traces and metrics ([7a32180](https://github.com/armandwipangestu/nestjs-boilerplate/commit/7a32180056309927914748b16403d6ce750c5c83))
* **observability:** add setup using opentelemetry, grafana, loki, alloy, tempo, and prometheus ([10c849b](https://github.com/armandwipangestu/nestjs-boilerplate/commit/10c849babd93ede87d77b60ff3aec30be56a5d33))
* **observability:** add stres test or load test using k6 ([d520be1](https://github.com/armandwipangestu/nestjs-boilerplate/commit/d520be12caddce92f22ec4fa52a9d4a477a14848))

### 🐛 Bug Fixes

* **ci:** lint ([ab1820d](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ab1820dbfaa7e1573ba2e4278d59b6ca413f57a0))

### 🧹 Chores

* add grafana screenshot ([ae5a67d](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ae5a67dddf8264496f308fd2e0023ca916cc2cc2))
* disable automatic database seed when container up ([69fffc0](https://github.com/armandwipangestu/nestjs-boilerplate/commit/69fffc077d3a05fdaf1728fb1b42cb5d7cf763b1))
* update assets ([be186de](https://github.com/armandwipangestu/nestjs-boilerplate/commit/be186de702e99bb3f5f1404c7d4db57194add83e))
* update label ([48753c2](https://github.com/armandwipangestu/nestjs-boilerplate/commit/48753c24224c08f6854a29dd85acfa47912a2276))

### ♻️ Refactor

* **database:** add warning seed when in production environment ([81f9c9d](https://github.com/armandwipangestu/nestjs-boilerplate/commit/81f9c9da527cc3c954638d7f70b9113e40bb181e))
* **observability:** add application metrics ([02335f2](https://github.com/armandwipangestu/nestjs-boilerplate/commit/02335f2b96ada847c8c1963ec9c32a31234068c6))
* **observability:** add database slow query ([8aea84a](https://github.com/armandwipangestu/nestjs-boilerplate/commit/8aea84a19b1ef241fdf177ea46044a33ace329fc))
* **observability:** add more app attribute, runtime metrics, and remove proxy metrics endpoint ([9651f5f](https://github.com/armandwipangestu/nestjs-boilerplate/commit/9651f5f02f8cc9089bcf5a7e310574c74c607474))
* **observability:** adjust dashboard metrics with application ([348bf1e](https://github.com/armandwipangestu/nestjs-boilerplate/commit/348bf1ec26380d5e4b59601fe1f405090a53a30f))

## [1.4.2](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.4.1...v1.4.2) (2026-03-02)

### 🐛 Bug Fixes

* **ci:** change GITHUB_TOKEN to GH_TOKEN used PAT ([56d0dea](https://github.com/armandwipangestu/nestjs-boilerplate/commit/56d0dea027cda91be6ef5cfd2cc3e483349ff841))
* **ci:** revert to GITHUB_TOKEN ([b084e9c](https://github.com/armandwipangestu/nestjs-boilerplate/commit/b084e9c0b3c0682f94528ba69926d47b8d1df27d))

### 🧹 Chores

* **release:** 1.4.2-rc.1 [skip ci] ([4d4d232](https://github.com/armandwipangestu/nestjs-boilerplate/commit/4d4d232479f3213c53dc55891507e452384c9c1d))
* remove on push ci pr-build ([2d1155a](https://github.com/armandwipangestu/nestjs-boilerplate/commit/2d1155ae08e841f19602bdc62024aa1dbf49e2a4))

## [1.4.2-rc.1](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.4.1...v1.4.2-rc.1) (2026-03-02)

### 🐛 Bug Fixes

* **ci:** change GITHUB_TOKEN to GH_TOKEN used PAT ([56d0dea](https://github.com/armandwipangestu/nestjs-boilerplate/commit/56d0dea027cda91be6ef5cfd2cc3e483349ff841))
* **ci:** revert to GITHUB_TOKEN ([b084e9c](https://github.com/armandwipangestu/nestjs-boilerplate/commit/b084e9c0b3c0682f94528ba69926d47b8d1df27d))

### 🧹 Chores

* remove on push ci pr-build ([2d1155a](https://github.com/armandwipangestu/nestjs-boilerplate/commit/2d1155ae08e841f19602bdc62024aa1dbf49e2a4))

## [1.4.1](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.4.0...v1.4.1) (2026-03-02)

### 🧹 Chores

* adjust pr pipeline ([e0c5a7a](https://github.com/armandwipangestu/nestjs-boilerplate/commit/e0c5a7a4fa2744d6d32a892ec68096010ed731c8))

## [1.4.0](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.3.0...v1.4.0) (2026-03-02)

### ✨ Features

* **user:** add crud user endpoint with avatar upload ([c0d56e6](https://github.com/armandwipangestu/nestjs-boilerplate/commit/c0d56e63754ebe3ca636f6a4b7c4006fe20dcd11))

### 🧹 Chores

* add minio as s3 in docker-compose.yml ([55a8a76](https://github.com/armandwipangestu/nestjs-boilerplate/commit/55a8a76eccf87b78131683dc50629ea9dd794b2c))
* **release:** 1.4.0-rc.1 [skip ci] ([7265e26](https://github.com/armandwipangestu/nestjs-boilerplate/commit/7265e267fefe254a8020c0c162da466662a5100c))
* rename file name role guard to acl guard ([dcb0464](https://github.com/armandwipangestu/nestjs-boilerplate/commit/dcb04640bbd11f3f7d88b51a72bcd37cc81b16d8))
* update readme ([bc25d1c](https://github.com/armandwipangestu/nestjs-boilerplate/commit/bc25d1c5b7aafa911c56e7acafe37cd7802eae28))
* update readme ([5ec44c4](https://github.com/armandwipangestu/nestjs-boilerplate/commit/5ec44c475d2d32d0ef203c87ab3ffb551325985e))

### ♻️ Refactor

* add logger max size and max files via env instead of hardcoded in service ([79106f9](https://github.com/armandwipangestu/nestjs-boilerplate/commit/79106f97dcddaf19c4fc63ba679453af807d5c30))
* **rbac:** move to modern rbac logic ([61f6418](https://github.com/armandwipangestu/nestjs-boilerplate/commit/61f6418fed422720c028ff4bf487fdd5b58d5eee))
* **rbac:** remove role checking, as used permissions as single source of truth ([3e21d6c](https://github.com/armandwipangestu/nestjs-boilerplate/commit/3e21d6c5e1234651947a9234d3b45afcdb70d405))

## [1.4.0-rc.1](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.3.0...v1.4.0-rc.1) (2026-03-02)

### ✨ Features

* **user:** add crud user endpoint with avatar upload ([c0d56e6](https://github.com/armandwipangestu/nestjs-boilerplate/commit/c0d56e63754ebe3ca636f6a4b7c4006fe20dcd11))

### 🧹 Chores

* add minio as s3 in docker-compose.yml ([55a8a76](https://github.com/armandwipangestu/nestjs-boilerplate/commit/55a8a76eccf87b78131683dc50629ea9dd794b2c))
* rename file name role guard to acl guard ([dcb0464](https://github.com/armandwipangestu/nestjs-boilerplate/commit/dcb04640bbd11f3f7d88b51a72bcd37cc81b16d8))
* update readme ([bc25d1c](https://github.com/armandwipangestu/nestjs-boilerplate/commit/bc25d1c5b7aafa911c56e7acafe37cd7802eae28))
* update readme ([5ec44c4](https://github.com/armandwipangestu/nestjs-boilerplate/commit/5ec44c475d2d32d0ef203c87ab3ffb551325985e))

### ♻️ Refactor

* add logger max size and max files via env instead of hardcoded in service ([79106f9](https://github.com/armandwipangestu/nestjs-boilerplate/commit/79106f97dcddaf19c4fc63ba679453af807d5c30))
* **rbac:** move to modern rbac logic ([61f6418](https://github.com/armandwipangestu/nestjs-boilerplate/commit/61f6418fed422720c028ff4bf487fdd5b58d5eee))
* **rbac:** remove role checking, as used permissions as single source of truth ([3e21d6c](https://github.com/armandwipangestu/nestjs-boilerplate/commit/3e21d6c5e1234651947a9234d3b45afcdb70d405))

## [1.3.0](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.2.0...v1.3.0) (2026-02-27)

### ✨ Features

* **post:** add crud post endpoint ([d07164c](https://github.com/armandwipangestu/nestjs-boilerplate/commit/d07164c4460d4625251900cd85c772418769d468))

### 🐛 Bug Fixes

* **ci:** lint ([e2467f5](https://github.com/armandwipangestu/nestjs-boilerplate/commit/e2467f5747fdfbdbb71a32acfca4e693091dbcf0))

### 🧹 Chores

* **release:** 1.3.0-rc.1 [skip ci] ([f7e18c2](https://github.com/armandwipangestu/nestjs-boilerplate/commit/f7e18c2edb42ca6b6019b172a69445d1499695a8))
* **release:** 1.3.0-rc.2 [skip ci] ([40d9d24](https://github.com/armandwipangestu/nestjs-boilerplate/commit/40d9d244debe2eb2c8ac6a8bc3aaf256a745ab7c))
* update bruno ([7f47a29](https://github.com/armandwipangestu/nestjs-boilerplate/commit/7f47a29a8ffbc599c94f650c3a7ce3088596af9c))
* update log boostrap ([b44959b](https://github.com/armandwipangestu/nestjs-boilerplate/commit/b44959b3f98666f9bf943e0de4a89cc3667a987c))

### ♻️ Refactor

* **bootstrap:** add log & binding network app ([9d1cba4](https://github.com/armandwipangestu/nestjs-boilerplate/commit/9d1cba455329b945832d6c1688a39cbd29216044))
* **loggin:** add request & response log ([66c40d4](https://github.com/armandwipangestu/nestjs-boilerplate/commit/66c40d40b3f2cc79b58b704f29fe2288151fc141))
* **logging:** update log format ([ae49796](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ae497964e5551777e0c163f5d423053377030e40))
* **swagger:** add enable and disable by env ([8f1edc0](https://github.com/armandwipangestu/nestjs-boilerplate/commit/8f1edc0dc3e73ab89ffdd9848ab9376aee7ba8cb))

## [1.3.0-rc.2](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.3.0-rc.1...v1.3.0-rc.2) (2026-02-27)

### 🐛 Bug Fixes

* **ci:** lint ([e2467f5](https://github.com/armandwipangestu/nestjs-boilerplate/commit/e2467f5747fdfbdbb71a32acfca4e693091dbcf0))

### 🧹 Chores

* update bruno ([7f47a29](https://github.com/armandwipangestu/nestjs-boilerplate/commit/7f47a29a8ffbc599c94f650c3a7ce3088596af9c))
* update log boostrap ([b44959b](https://github.com/armandwipangestu/nestjs-boilerplate/commit/b44959b3f98666f9bf943e0de4a89cc3667a987c))

### ♻️ Refactor

* **bootstrap:** add log & binding network app ([9d1cba4](https://github.com/armandwipangestu/nestjs-boilerplate/commit/9d1cba455329b945832d6c1688a39cbd29216044))
* **loggin:** add request & response log ([66c40d4](https://github.com/armandwipangestu/nestjs-boilerplate/commit/66c40d40b3f2cc79b58b704f29fe2288151fc141))
* **logging:** update log format ([ae49796](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ae497964e5551777e0c163f5d423053377030e40))
* **swagger:** add enable and disable by env ([8f1edc0](https://github.com/armandwipangestu/nestjs-boilerplate/commit/8f1edc0dc3e73ab89ffdd9848ab9376aee7ba8cb))

## [1.3.0-rc.1](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.2.0...v1.3.0-rc.1) (2026-02-27)

### ✨ Features

* **post:** add crud post endpoint ([d07164c](https://github.com/armandwipangestu/nestjs-boilerplate/commit/d07164c4460d4625251900cd85c772418769d468))

## [1.2.0](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.1.0...v1.2.0) (2026-02-24)

### ✨ Features

* **health:** add health check endpoint with redis, database, memory and disk monitoring ([4d41de3](https://github.com/armandwipangestu/nestjs-boilerplate/commit/4d41de3f309fa1a7433c4908f8c32afc6a1d4ddc))
* **security:** add rate limiting, throttle, and caching ([ca33114](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ca331145a159d61984c4b20812cc16d7e8d9afcc))

### 🐛 Bug Fixes

* **ci:** lining ([b6bcc70](https://github.com/armandwipangestu/nestjs-boilerplate/commit/b6bcc703ebc282beae944ce9bc8873f76c6d8b6f))

### 🧹 Chores

* **release:** 1.2.0-rc.1 [skip ci] ([477704e](https://github.com/armandwipangestu/nestjs-boilerplate/commit/477704e85ef1f409a57bdab840a347ad8f97d1a0))

### ♻️ Refactor

* **redis:** centralize redis module and add in-memory fallback support ([5edc937](https://github.com/armandwipangestu/nestjs-boilerplate/commit/5edc9370b57c13a6c1315a6ef39dc62ce6ea2f45))

## [1.2.0-rc.1](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.1.0...v1.2.0-rc.1) (2026-02-24)

### ✨ Features

* **health:** add health check endpoint with redis, database, memory and disk monitoring ([4d41de3](https://github.com/armandwipangestu/nestjs-boilerplate/commit/4d41de3f309fa1a7433c4908f8c32afc6a1d4ddc))
* **security:** add rate limiting, throttle, and caching ([ca33114](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ca331145a159d61984c4b20812cc16d7e8d9afcc))

### 🐛 Bug Fixes

* **ci:** lining ([b6bcc70](https://github.com/armandwipangestu/nestjs-boilerplate/commit/b6bcc703ebc282beae944ce9bc8873f76c6d8b6f))

### ♻️ Refactor

* **redis:** centralize redis module and add in-memory fallback support ([5edc937](https://github.com/armandwipangestu/nestjs-boilerplate/commit/5edc9370b57c13a6c1315a6ef39dc62ce6ea2f45))

## [1.1.0](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.0.0...v1.1.0) (2026-02-22)

### ✨ Features

* **auth:** add authentication (login, refresh token, logout) ([dac40f4](https://github.com/armandwipangestu/nestjs-boilerplate/commit/dac40f4dc3727e488a3092b4e7b693933c4c44fa))
* **auth:** add cors allowed origins ([f8f2be8](https://github.com/armandwipangestu/nestjs-boilerplate/commit/f8f2be8c103a910238c568376c9c2b61b769b0cb))
* **auth:** add register and dto ([5137883](https://github.com/armandwipangestu/nestjs-boilerplate/commit/5137883fb4eb00a98321bd1491fa39f325217780))
* **database:** add migration and seeder in docker ([369a165](https://github.com/armandwipangestu/nestjs-boilerplate/commit/369a1655045b9e9e9493781285510417371452d0))
* **database:** add migration setup ([5400ad5](https://github.com/armandwipangestu/nestjs-boilerplate/commit/5400ad5b754ed8b99f3abf9b036bedf65685099c))
* **database:** add seeding feature ([d877c6f](https://github.com/armandwipangestu/nestjs-boilerplate/commit/d877c6fd71e1f64a141bbf4016a0c1107ef3d4a5))
* **docs:** add openapi swagger integration ([6238201](https://github.com/armandwipangestu/nestjs-boilerplate/commit/6238201a68a3c73198e193125cc8704bbc04f10f))
* **logging:** add custom logger module ([ae57f5c](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ae57f5cc4f9e65e7dcb4e89f3e2b5f3ba696b243))

### 🐛 Bug Fixes

* **ci:** add database url dummy ([5dfad47](https://github.com/armandwipangestu/nestjs-boilerplate/commit/5dfad47104f4f4344783041a48835f4a1912cbe1))
* **ci:** add prisma generate in lint ci ([113f5d5](https://github.com/armandwipangestu/nestjs-boilerplate/commit/113f5d563885c5b2661ad254b7446b338a108678))
* **ci:** build error prisma generate ([6796148](https://github.com/armandwipangestu/nestjs-boilerplate/commit/6796148ac5205ee31dfdeba519ce3b627632ec0b))
* **ci:** change import to relative path ([94cd017](https://github.com/armandwipangestu/nestjs-boilerplate/commit/94cd01764e3552b6f858e52dba99879be15fa89d))
* **ci:** lint ([872149d](https://github.com/armandwipangestu/nestjs-boilerplate/commit/872149d292df17571a8a79ac6b626a19e38ae146))
* **ci:** lint error and warning ([2a19b6f](https://github.com/armandwipangestu/nestjs-boilerplate/commit/2a19b6ff8d3d07bdc08c999a2b70714ee392ffd3))
* **database:** seed typescript warning ([182c4f0](https://github.com/armandwipangestu/nestjs-boilerplate/commit/182c4f01b030b80bc04cd4e81fa395c8cf2dcf63))

### 🧹 Chores

* back to root as default user container ([c60fade](https://github.com/armandwipangestu/nestjs-boilerplate/commit/c60fadeada52ff5b5cb15f9748f6dd6681155843))
* **release:** 1.1.0-rc.1 [skip ci] ([d4f2e3e](https://github.com/armandwipangestu/nestjs-boilerplate/commit/d4f2e3e4478c79908798ad83cbdf9bc88cf4f2fe))
* **release:** 1.1.0-rc.2 [skip ci] ([163626b](https://github.com/armandwipangestu/nestjs-boilerplate/commit/163626b9178f5eb3ef0a556fa21a020be6aaae0e))
* **release:** 1.1.0-rc.3 [skip ci] ([6e3aea2](https://github.com/armandwipangestu/nestjs-boilerplate/commit/6e3aea249e5dcc7d2f0cbc88c444cedf21f9ecbe))
* update seeder ([8433859](https://github.com/armandwipangestu/nestjs-boilerplate/commit/84338592f5e73b01d6bf327ced4a4ae61ff75296))

## [1.1.0-rc.3](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.1.0-rc.2...v1.1.0-rc.3) (2026-02-22)

### ✨ Features

* **auth:** add authentication (login, refresh token, logout) ([dac40f4](https://github.com/armandwipangestu/nestjs-boilerplate/commit/dac40f4dc3727e488a3092b4e7b693933c4c44fa))
* **auth:** add cors allowed origins ([f8f2be8](https://github.com/armandwipangestu/nestjs-boilerplate/commit/f8f2be8c103a910238c568376c9c2b61b769b0cb))
* **auth:** add register and dto ([5137883](https://github.com/armandwipangestu/nestjs-boilerplate/commit/5137883fb4eb00a98321bd1491fa39f325217780))
* **database:** add migration and seeder in docker ([369a165](https://github.com/armandwipangestu/nestjs-boilerplate/commit/369a1655045b9e9e9493781285510417371452d0))
* **docs:** add openapi swagger integration ([6238201](https://github.com/armandwipangestu/nestjs-boilerplate/commit/6238201a68a3c73198e193125cc8704bbc04f10f))

### 🐛 Bug Fixes

* **ci:** add prisma generate in lint ci ([113f5d5](https://github.com/armandwipangestu/nestjs-boilerplate/commit/113f5d563885c5b2661ad254b7446b338a108678))
* **ci:** change import to relative path ([94cd017](https://github.com/armandwipangestu/nestjs-boilerplate/commit/94cd01764e3552b6f858e52dba99879be15fa89d))
* **ci:** lint error and warning ([2a19b6f](https://github.com/armandwipangestu/nestjs-boilerplate/commit/2a19b6ff8d3d07bdc08c999a2b70714ee392ffd3))

### 🧹 Chores

* back to root as default user container ([c60fade](https://github.com/armandwipangestu/nestjs-boilerplate/commit/c60fadeada52ff5b5cb15f9748f6dd6681155843))

## [1.1.0-rc.2](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.1.0-rc.1...v1.1.0-rc.2) (2026-02-22)

### ✨ Features

* **logging:** add custom logger module ([ae57f5c](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ae57f5cc4f9e65e7dcb4e89f3e2b5f3ba696b243))

### 🐛 Bug Fixes

* **ci:** lint ([872149d](https://github.com/armandwipangestu/nestjs-boilerplate/commit/872149d292df17571a8a79ac6b626a19e38ae146))

## [1.1.0-rc.1](https://github.com/armandwipangestu/nestjs-boilerplate/compare/v1.0.0...v1.1.0-rc.1) (2026-02-22)

### ✨ Features

* **database:** add migration setup ([5400ad5](https://github.com/armandwipangestu/nestjs-boilerplate/commit/5400ad5b754ed8b99f3abf9b036bedf65685099c))
* **database:** add seeding feature ([d877c6f](https://github.com/armandwipangestu/nestjs-boilerplate/commit/d877c6fd71e1f64a141bbf4016a0c1107ef3d4a5))

### 🐛 Bug Fixes

* **ci:** add database url dummy ([5dfad47](https://github.com/armandwipangestu/nestjs-boilerplate/commit/5dfad47104f4f4344783041a48835f4a1912cbe1))
* **ci:** build error prisma generate ([6796148](https://github.com/armandwipangestu/nestjs-boilerplate/commit/6796148ac5205ee31dfdeba519ce3b627632ec0b))
* **database:** seed typescript warning ([182c4f0](https://github.com/armandwipangestu/nestjs-boilerplate/commit/182c4f01b030b80bc04cd4e81fa395c8cf2dcf63))

### 🧹 Chores

* update seeder ([8433859](https://github.com/armandwipangestu/nestjs-boilerplate/commit/84338592f5e73b01d6bf327ced4a4ae61ff75296))

## 1.0.0 (2026-02-21)

### ✨ Features

* init setup ([7c10b3a](https://github.com/armandwipangestu/nestjs-boilerplate/commit/7c10b3afa3e2b4c30698cc78f368939597d65369))

### 🐛 Bug Fixes

* typo workflows folder ([ef9a2cb](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ef9a2cb0bbeda5808fc89673bae03fe3ed73ecf7))

### 🧹 Chores

* add .github configuration stuff ([00952ac](https://github.com/armandwipangestu/nestjs-boilerplate/commit/00952acc7b3ce3d3bc64931e4607caa60cf1063d))
* add CONTRIBUTING.md ([791f5dd](https://github.com/armandwipangestu/nestjs-boilerplate/commit/791f5dd3000f1b71676dddb1cdd23931cd045e2a))
* add dockerfile ([e5659c5](https://github.com/armandwipangestu/nestjs-boilerplate/commit/e5659c5415674cf1a2b1c4060cfc6be04ea1ce01))
* add license ([9f27ba4](https://github.com/armandwipangestu/nestjs-boilerplate/commit/9f27ba4125009e9cf9f4fd7ffc4a4347c8778d39))
* add semantic release configuration ([181cd36](https://github.com/armandwipangestu/nestjs-boilerplate/commit/181cd36d978313b88936fab79c0480a01134ff6b))
* **release:** 1.0.0-rc.1 [skip ci] ([35e15f4](https://github.com/armandwipangestu/nestjs-boilerplate/commit/35e15f4990995d47cae037f88f370a9db7eb4879))

## 1.0.0-rc.1 (2026-02-21)

### ✨ Features

* init setup ([7c10b3a](https://github.com/armandwipangestu/nestjs-boilerplate/commit/7c10b3afa3e2b4c30698cc78f368939597d65369))

### 🐛 Bug Fixes

* typo workflows folder ([ef9a2cb](https://github.com/armandwipangestu/nestjs-boilerplate/commit/ef9a2cb0bbeda5808fc89673bae03fe3ed73ecf7))

### 🧹 Chores

* add .github configuration stuff ([00952ac](https://github.com/armandwipangestu/nestjs-boilerplate/commit/00952acc7b3ce3d3bc64931e4607caa60cf1063d))
* add CONTRIBUTING.md ([791f5dd](https://github.com/armandwipangestu/nestjs-boilerplate/commit/791f5dd3000f1b71676dddb1cdd23931cd045e2a))
* add dockerfile ([e5659c5](https://github.com/armandwipangestu/nestjs-boilerplate/commit/e5659c5415674cf1a2b1c4060cfc6be04ea1ce01))
* add license ([9f27ba4](https://github.com/armandwipangestu/nestjs-boilerplate/commit/9f27ba4125009e9cf9f4fd7ffc4a4347c8778d39))
* add semantic release configuration ([181cd36](https://github.com/armandwipangestu/nestjs-boilerplate/commit/181cd36d978313b88936fab79c0480a01134ff6b))
