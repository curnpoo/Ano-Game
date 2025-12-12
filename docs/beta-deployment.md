# Beta deployment setup for anogame.xyz/beta

This repository supports a dedicated beta branch so you can deploy a preview build at `anogame.xyz/beta` without affecting the main site.

## 1) Create and deploy the `beta` branch
- Branch from your stable branch (e.g., `main`) and push it as `beta`.
- In Vercel, enable **Branch Deployments** and ensure the `beta` branch is assigned to a preview deployment.
- Set a project-level **Environment Variable** for the beta branch (Production/Preview scopes as needed):
  - `VITE_BASE_PATH=/beta/`
  - Optionally `VITE_BUILD_OUTDIR=dist/beta` (the `build:beta` script already sets this).
- Set the build command for the beta branch to `npm run build:beta` so assets are generated under the `/beta/` base path.
- Set the output directory for the beta branch to `dist/beta`.

## 2) Routing
- `vercel.json` includes a rewrite that serves the SPA entry from `/beta/index.html` for any `/beta/*` path.
- The default rewrite still serves `/index.html` for the main site, so production remains unchanged.

## 3) Local verification
- Run `npm run build:beta` locally and serve `dist/beta` (e.g., `npx serve dist/beta`) to confirm asset paths resolve with the `/beta/` base.

## 4) Deployment behavior
- The beta build uses the `/beta/` base path, so links/assets resolve correctly when hosted under `anogame.xyz/beta`.
- The main branch can continue using the standard `npm run build` / `dist` output without any beta-specific settings.

## 5) Why you might see extra branches in the deploy picker
- Vercel lists every pushed branch that produced a preview build. If you see older automation branches like `codex/*` in the branch chooser, it’s because those preview branches still exist on the remote.
- To clean up the list, delete the unused preview branches on GitHub (or mark only `main` and `beta` as deployable in Vercel’s Branch Deployments settings). That will keep the picker limited to the branches you actively maintain.
