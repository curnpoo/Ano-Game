# OpenClaw Workflow Notes

These notes describe how ANO fits inside the OpenClaw workspace so future collaborators know where and how to keep the project in sync.

## Where this lives inside OpenClaw
- The repo is mounted at `/root/openclaw/workspace/repos/Ano-Game` inside the agent workspace.
- Syncthing mirrors `/root/openclaw/workspace` (and the agent memory vault) to the paired devices, so any edits here surface to your personal machines.
- The portal service lives at `http://100.79.186.77:8080`; it can host links, docs, and downloads related to ANO without leaving the cluster.

## Development flow
1. `npm install` once per environment (`node 22` is available by default in OpenClaw). 
2. Run `npm run dev` to start Vite. It binds to `localhost` so use `tailscale` or `ssh -L` if you need remote access.
3. `npm run build` bundles the assets for deployment.
4. Keep an eye on `public/version.json` (the build step stamps `buildTime`). The portal's dashboard can link directly to `public/og-image.png` or other exported assets.

## Automation in this environment
- `memory:daily-save` runs every 6 hours to snapshot important notes into `/root/openclaw/workspace/memory` (where this project’s docs are archived automatically).
- `morning-routine` and `healthcheck:self-heal` Cron jobs are managed through the Gateway so we don’t rely on legacy `crontab` entries.

## Tips for contributors
- Avoid committing `node_modules/`—the workspace already has a `.stignore` next to the repo so Syncthing keeps the history clean.
- If you need quick access to the Portal services (files, dashboard, chat), open the portal inside the portal tab and search for `ANO`.
- When you’re ready to push changes, use the existing GitHub token to hit `https://github.com/curnpoo/Ano-Game` so our PR workflow keeps track of the edit.

Let me know if you want me to expand this page with release notes, live links, or deployment checklists.
