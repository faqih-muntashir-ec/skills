---
name: test-http-api-hurl
description: Test a running HTTP API end-to-end with hurl — write .hurl files with request + assert blocks, handle bearer-token auth and variables, run with --test, and interpret results. Use when the user wants to smoke-test, verify, or exercise an HTTP endpoint (status codes, JSON shape, auth gating) against a live server, or mentions "hurl".
---

# Test an HTTP API with hurl

`hurl` runs plain-text HTTP files, asserts on the response, and exits non-zero on failure — ideal for verifying an endpoint's status, JSON shape, and auth gating against a running server.

## 1. Ensure hurl is installed

```
hurl --version
```
If missing, install (Debian/Ubuntu — needs sudo, so have the user run it):
```
VERSION=8.0.0
curl -fsSL --remote-name https://github.com/Orange-OpenSource/hurl/releases/download/$VERSION/hurl_${VERSION}_amd64.deb
sudo apt-get install -y ./hurl_${VERSION}_amd64.deb
```
`sudo` can't read a password non-interactively in an agent shell — ask the user to run the install themselves (e.g. via a `!`-prefixed command) and confirm `hurl --version`.

## 2. Confirm the server is reachable

Find the base URL/port (check the app's start log, `PORT` env, or `ss -tlnp`). Then probe before writing asserts:
```
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:<PORT>/<path>
```
- `000` = not reachable. The server may not be listening, or your shell is in a **different network namespace** than the server (common with sandboxed agent shells / WSL). If so, run hurl/curl with the sandbox disabled, or have the user run the `hurl` command in their own shell.

## 3. Write the .hurl file

One file can hold multiple request→assert blocks, run top to bottom. Use `{{var}}` placeholders for host/token/ids.

```hurl
# 1. No auth -> rejected
GET {{host}}/widgets/{{id}}
HTTP 401

# 2. Authorized -> 200 + contract checks
GET {{host}}/widgets/{{id}}
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
header "Content-Type" contains "application/json"
jsonpath "$.id" == "{{id}}"
jsonpath "$.createdAt" matches /^\d{4}-\d{2}-\d{2}/
jsonpath "$.name" exists
jsonpath "$.items" count == 3
```

POST with a body:
```hurl
POST {{host}}/widgets
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "name": "demo"
}
HTTP 201
[Asserts]
jsonpath "$.id" exists
```

Chain requests by capturing values:
```hurl
POST {{host}}/widgets
# ...
HTTP 201
[Captures]
newId: jsonpath "$.id"

GET {{host}}/widgets/{{newId}}
HTTP 200
```

## 4. Run it

```
hurl --variable host=http://localhost:8233 \
     --variable id=<UUID> \
     --variable token=<JWT> \
     --test /tmp/api.hurl
```
- `--test` = test mode: per-file pass/fail summary, non-zero exit on failure.
- `--variable k=v` fills each `{{k}}`. Repeat per variable. (`--variables-file vars.env` for many.)
- `--verbose` prints request/response headers; add when debugging a failing assert.
- Pass a long token via a shell var: `TOKEN=$(cat tok.txt)` then `--variable token="$TOKEN"`.

## 5. Assert syntax — the gotchas

- Predicates do **not** compose with `or`/`and`. `jsonpath "$.x" isString or isNull` is a **parse error**. For a nullable field, assert only `exists`, or assert the concrete value for a row you know is populated, or split into separate test cases (one org/record with the field set, one without).
- Common predicates: `== <val>`, `!= <val>`, `exists`, `isString` / `isInteger` / `isBoolean` / `isCollection`, `contains "s"`, `startsWith`, `matches /regex/`, `count == n`, `>= n`.
- `exists` is about whether the JSONPath yields a node. Behavior on an explicit JSON `null` is finicky — prefer `== null` or asserting a sibling when checking nullable fields.
- Regex literals use `/.../ ` and need doubled backslashes only inside a quoted string, not in the `/slash/` form: `matches /^\d{2}:\d{2}$/`.
- Status line is bare: `HTTP 200` (or `HTTP *` to accept any). It must come before `[Asserts]`.

## 6. Auth tokens

If the endpoint needs a signed JWT you can't get from a login flow, you can mint one when you have the dev signing key:
- Find the key + the issuer the API validates against (its JWKS config). The token's `iss` must match a configured issuer and the signature must verify against that issuer's JWKS; set the JWT header `kid` to the key's id.
- Include every claim the middleware chain requires — not just the scope. Auth-gate (scope) + tenant (e.g. `dbMoniker`) + session (e.g. `userSessionId`) are often separate middlewares; a token missing one yields 403 or a 500 in a logging/session layer, not a clean 401.
- Sign directly with `node:crypto` (no deps):
  ```
  node -e '
  const c=require("crypto"); const kp=require("./keypair.json");
  const b=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
  const now=Math.floor(Date.now()/1000);
  const h={alg:"RS256",typ:"JWT",kid:kp.id};
  const p={iss:"<issuer>",scope:["<scope>"],iat:now,exp:now+3600,jti:c.randomUUID()/*,+required claims*/};
  const d=b(h)+"."+b(p);
  process.stdout.write(d+"."+c.sign("RSA-SHA256",Buffer.from(d),kp.privateKey).toString("base64url"));
  '
  ```
- To prove the auth gate, also mint a token **missing** the required scope and assert `HTTP 403`, and send no token and assert `HTTP 401`.

## 7. Interpreting output

- `Succeeded files: 1 (100.0%)` = all asserts passed.
- On failure, hurl prints the failing line, the expected predicate, and the actual value. A `500` with a token usually means auth passed but the handler threw — `curl` the same request to read the JSON error body, then check the server log.

## Notes
- Keep throwaway `.hurl` files in `/tmp` unless the project wants committed API tests.
- Never paste real production tokens/secrets into committed files; use `--variable`/env.
