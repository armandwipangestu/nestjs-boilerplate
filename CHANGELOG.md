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
