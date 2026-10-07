---
name: sops-secrets
description: Store and use secrets with SOPS + age in a project. Use when a script needs a token or API key, when a `.env` file holds secrets, when a `secrets.env` file or `~/.sops.yaml` appears, or when the user asks to add, rotate or move a secret.
---

# SOPS + age secrets

Secrets live in an encrypted `secrets.env` committed next to the code. Key names stay readable; values are `ENC[...]`. A script gets the values only as environment variables, at run time.

## Setup (already done on this machine)

- `sops` and `age` come from Homebrew.
- Private key: `~/.config/sops/age/keys.txt`. SOPS finds it there by default.
- `~/.sops.yaml` holds one creation rule with the user's age public key. SOPS walks up from the file's folder to find it, so every project under `~` encrypts to that key with no `--age` flag.

## Rule: secret values stay out of your context

Secret values never pass through the conversation. The user's employer forbids credentials in Claude. So:

- Read key names only: `grep -o '^[A-Za-z_][A-Za-z0-9_]*=' secrets.env | grep -v '^sops_'`. The encrypted file shows names in plain text; `sops_*` lines are SOPS metadata.
- Leave `sops decrypt`, `sops exec-env … env`, `cat .env` and any command that prints values to the user's own terminal.
- To add or change a value, hand the user `sops secrets.env`. It opens their editor and re-encrypts on save.
- To check that secrets load, run the real script or test that the variable is set: `sops exec-env secrets.env 'test -n "$GITHUB_TOKEN" && echo set'`.
- If a plain `.env` with live values reaches your context, stop the task. Tell the user to delete the conversation and rotate every exposed token.

## Move a plain `.env` into SOPS

Give the user these commands to run themselves, because you would see the values:

```sh
sops encrypt --input-type dotenv --output-type dotenv .env > secrets.env && rm .env
```

Then keep `.env.example` with names only, and make sure `.gitignore` still lists `.env`.

## Run a script with the secrets

`sops exec-env secrets.env '<command>'` decrypts in memory and runs the command in a shell with the values set. Plain text never touches disk.

`sops exec-env` takes exactly one command string and rejects extra arguments ("missing file to decrypt"). A `package.json` script receives the user's flags appended at the end, so wrap it in `sh -c … --` to fold the flags into the command:

```json
"start": "sh -c 'sops exec-env secrets.env \"bun run src/index.ts $*\"' --"
```

`$*` splits on spaces, so a flag value containing a space breaks. Plain flags like `--date 2026-02-05` work. Reference project: `~/automation/daily-async-message-generator`.

Verify a change by running the script through the package script (`vp run start …`), and confirm it reaches the remote API.
