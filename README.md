# Marine Calculators Web

A browser-based collection of coastal and marine engineering calculators. The
application is being migrated incrementally from a separate R Shiny reference
implementation, with numerical parity tests for every calculator.

The implemented calculators are Linear Wave Theory and Wave Shoaling and
Refraction. BEWARE reef setup/runup is intentionally excluded from the initial
static migration because its fitted R GAM model requires a separate deployment
design.

## Technology

- Vue 3 and TypeScript
- Vite
- Plotly.js
- Vitest
- GitHub Actions and Nginx static hosting

All normal calculations run locally in the browser. There is no application server
or user session to expire.

## Local development

Requirements: Node.js 24 and pnpm 10.

```sh
pnpm install
pnpm dev
```

Run numerical tests and create a production build:

```sh
pnpm test
pnpm build
```

## Architecture

- `src/engineering/` contains framework-independent numerical functions.
- `src/calculators/` contains calculator UI, defaults, plot-series builders, and
  display behaviour.
- `src/components/` contains shared presentation components.
- `tests/` contains numerical parity and boundary tests.

Plots call the same engineering functions as headline results. Browser inputs are
saved in namespaced local storage and may be reset or exported as versioned JSON.

## Deployment

`.github/workflows/deploy-ocean.yml` runs tests and production builds on pull
requests, pushes to `main`, and manual runs. Only a pushed `v*` tag deploys to
<https://rippleforecast.com/calculator/>. The tagged commit must belong to `main`
history. Manual runs do not deploy. Deployments are serialized and never cancelled
mid-transfer.

Node.js 24 and pnpm are build-time dependencies only. Ocean serves `dist/` with
Nginx; no Node.js process, database, or changes to the main wave application are
required. Vite's base path is `/calculator/`.

### Release configuration

The GitHub environment `ocean` allows only `v*` tags and contains:

- Variable `OCEAN_HOST`: Ocean SSH address, port 22.
- Secret `OCEAN_SSH_PRIVATE_KEY`: Dedicated `marine-deploy` Ed25519 key.
- Secret `OCEAN_KNOWN_HOSTS`: Pinned host key verified through existing SSH access.

The optional repository variable `VITE_GA_MEASUREMENT_ID` enables analytics.
Never put private credentials in `VITE_*` variables: they are included in browser
assets.

Ocean's root-owned `/usr/local/sbin/deploy-marine-calculators` is installed from
`scripts/deploy-calculator.py`. The dedicated SSH key is restricted to that
receiver through an `authorized_keys` forced command; shell access, forwarding,
and PTYs are disabled. The receiver accepts only `check` or
`deploy <commit-sha> <tag>`. Its sudo rule grants access only to that receiver.
Receiver changes require a separate administrator installation; the workflow
cannot upload executable deployment code.

After the workflow has been merged and pushed to `main`, publish a version tag
pointing to the intended commit:

```sh
git tag v1.0.0 <commit-sha>
git push origin v1.0.0
```

Pushing the tag publishes to production automatically; do not push a release tag
until the replacement is approved. Use a new tag for each release rather than
moving existing tags.

### Activation and rollback

The receiver validates the archive, stages files under
`/var/www/calculator-releases/`, and atomically changes `/var/www/calculator`.
The first release preserves the existing R Shinylive directory; subsequent
releases preserve their predecessors. Existing hashed assets remain available
for already-open browser tabs. No release cleanup runs automatically.

An origin HTTP smoke check verifies the entry page and its scripts/styles. A
failed check restores the previous release. The workflow separately checks the
public `release.json` SHA and tag through Cloudflare. A public-check failure
marks the workflow failed but does not automatically undo a successful origin
activation; inspect CDN behavior before rolling back.

The retained `shinylive-sw.js` URL retires old calculator Service Workers and
removes only calculator-scoped cached requests, leaving other site caches alone.
The Vue entry point also requests an update of an existing calculator worker.

For an operator rollback, use the previous release path printed by the receiver.
On ocean, replace only the calculator symlink atomically:

```sh
sudo python3 - /var/www/calculator-releases/<previous-release> <<'PY'
import os, pathlib, sys
target = pathlib.Path(sys.argv[1]).resolve(strict=True)
assert target.parent == pathlib.Path("/var/www/calculator-releases")
assert (target / "index.html").is_file()
link = pathlib.Path("/var/www/calculator-rollback")
link.symlink_to(target)
os.replace(link, "/var/www/calculator")
PY
```

Verify `/calculator/` and the main site after rollback. Rolling back to the R
directory restores its original files, including its Service Worker.

## Scope

The R Shiny source is a local numerical reference and is not part of this
repository. Cnoidal/nonlinear wave modules are not present in that source.
Solitary-wave calculations may be considered as future, separately specified work.

## Licence and use

This is proprietary software, not an open-source project. The hosted calculators
may be used for their intended calculation functions, and users may use results
and spreadsheets generated from their own inputs. The source code may not be
copied, modified, redistributed, incorporated into another product, or used to
create derivative works without prior written permission. See [LICENSE](LICENSE)
for the complete notice.

Third-party material remains subject to its own terms. Technical publications
cited by the calculators remain the property of their respective authors and
publishers.
