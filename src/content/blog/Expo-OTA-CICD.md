---
id: 8
title: "Shipping Expo OTA updates and store builds from one release PR"
excerpt: "How we used EAS Update fingerprints and GitHub Actions to let a QA-approved release PR decide between an over-the-air update and a store build, without loosening QA."
publishDate: "Oct 17 2026"
---

## From release trains to continuous delivery: shipping Expo OTA updates and store builds from one release PR

Our React Native app shipped on a familiar rhythm. Features merged into `develop`, QA tested them there, and every couple of weeks we cut a release branch, built it, submitted it to the App Store and Google Play, and merged it into `main`.

With Expo's EAS Update, we can ship JavaScript and asset changes over the air (OTA), without a store review. We were already doing that but wanted to automate the process: native changes still go through the stores and nothing ships just because it was merged.

This post covers how we got there: what we found when we looked closely, the decisions we made, the three phases we shipped, and the problems we hit along the way.

---

### The target flow

Here is what we ended up with:

```
feature PRs ──► develop
                   │
   cut release/X.Y.Z, bump package.json to X.Y.Z, open a PR into main
                   │
                   ▼
   Release PR pipeline (every push):
     1. package.json version must match the branch name
     2. native fingerprint vs the live store build (iOS + Android)
          → label  release:ota  or  release:store
     3. internal preview app: OTA update if a matching preview build exists,
        otherwise a new preview build
     4. Slack: "X.Y.Z ready for QA", OTA/store, release notes, links
     5. Linear: label every linked ticket  RN Releases › X.Y.Z
                   │
        QA approves  →  merge into main (merge commit)
                   │
                   ▼
   Release deploy:
     OTA    → eas update to the production channel
     Store  → production builds, auto-submitted to TestFlight + Play internal
     then   → tag X.Y.Z, GitHub Release, Slack, main → develop back-merge PR
```

The rule behind all of it: **merged ≠ deployed.** Merging to `develop` never ships anything. Only an approved release PR merged into `main` deploys. When it does, **the native fingerprint decides whether the release goes out as an OTA update or as a store build.**

---

### Phase 0: look before changing anything

Before writing any CI, we audited the repository, the EAS project and the git history. A few findings changed the plan.

#### OTA updates were already happening, without controls

We had shipped 11 production OTA updates in about six weeks. Each was published by hand from a developer's laptop by cherry-picking fixes onto ad-hoc branches. None of them had a rollout, an approval gate or a record in git. The cherry-picks had also left `main` and `develop` diverged.

#### The runtime version policy blocked our hotfix process

We were using `runtimeVersion: { policy: "appVersion" }`, so the runtime was the app version. This prevented us from using the fingerprint to determine if an OTA update would be a viable option or not.

#### Native changes were common per release, rare per commit

Over nine months, 12 of 21 releases contained at least one native change, such as a new native library, an SDK bump or a config plugin change. But only 3–4% of commits were native. Most of the JavaScript in those releases was held back by one or two native PRs.

That's the case for OTA updates: most changes don't need a binary, so they shouldn't have to wait for one.

#### Versions were invisible

All of our tracking was using the in-app version string which reported the native binary's version. Any OTAs never showed up in analytics or crash data with an updated version.

---

### Decisions that shaped the design

- **Fix forward only.** We never roll back to an older update or the embedded bundle. A bad release is fixed by a newer release through the same pipeline. (Separately, if an update crashes on launch, expo-updates on the device falls back to the last update that launched successfully. That's library behavior, not part of our process.)
- **One release PR drives everything.** We create a release branch and PR by hand. CI does the rest.
- **The fingerprint decides OTA vs store**, recomputed at merge time. The PR label is only informational.
- **Every release gets a new version, OTA or store.** The release branch name, `package.json`, the git tag and what users see all carry that version.
- **An escape hatch:** `[SKIP_BUILD]` in the PR description skips every automated action.
- **Some risks we accepted on purpose:**
  - OTAs go to 100% of users immediately.
  - The production channel isn't locked to CI.

---

### Phase 1: make the identifiers trustworthy

#### Fingerprint runtime

We switched to the fingerprint policy:

```js
// app.config.js
runtimeVersion: {
  policy: "fingerprint",
},
```

The runtime is now a hash of everything native: dependencies with native code, config plugins and their arguments, patches, and the resolved app config. An OTA physically can't reach a binary with different native code.

The important part is deciding what _not_ to hash. Our `fingerprint.config.js` skips version fields, so bumping `package.json` for an OTA release doesn't change the runtime:

```js
module.exports = {
	sourceSkips: [
		"PackageJsonAndroidAndIosScriptsIfNotContainRun",
		// version / buildNumber / versionCode are release metadata, not native code
		"ExpoConfigVersions",
		"GitIgnore",
		"PackageJsonScriptsAll",
	],
	ignorePaths: ["eas.json", ".easignore" /* plus JS-only config-time modules */],
	extraSources: [
		/* native assets our config plugins copy into the projects */
	],
}
```

Before relying on it, we verified the behavior:

- **Repeatable:** the hash was identical across runs.
- **Ignores version bumps:** changing `package.json` from 1.10.0 to 1.99.0 left it unchanged.
- **Catches native changes:** editing a config-plugin argument changed it, and so did editing a `patches/` file.
- **Locally:** a local `ios/` folder (gitignored, generated) didn't affect it.
- **Against EAS:** compared with an EAS build of the same code, the only differing input was the runtime-policy setting itself.

Two other changes went in alongside:

- **Build numbers now come from EAS.** We removed a hard-coded build number and let EAS manage them (`appVersionSource: "remote"` plus `autoIncrement` on production). Production builds bump a per-platform counter; preview and QA apps have their own counters.
- **EAS builds fail when `APP_ENV` is unset**, instead of silently producing the dev variant.

**The transition catch:** binaries built before this change still use the `appVersion` runtime. They can only receive OTAs published from code that keeps the old version and policy. The first release under the new flow therefore had to be a store release.

---

### Phase 2: the release PR pipeline

A PR from `release/X.Y.Z` into `main` triggers a workflow that:

1. **Checks the version:** `package.json` must equal the branch name, or the run fails with the fix command.
2. **Classifies the release:** computes the production fingerprint for iOS and Android and compares each with the latest production store build. Both the same gives `release:ota`; anything else, including "couldn't compute", gives `release:store`.
3. **Gets the branch onto the internal preview app**, with the same `ota-or-build` action as Phase 2.
4. **Posts to Slack:** version, OTA or store, release notes (squash-merged PR titles since the last tag), and install or update links.
5. **Labels Linear tickets** (more on this below).

#### Linear tickets, from Linear's own links

We wanted every ticket in a release labelled **RN Releases › 1.34.0** (a label group with one child per version). Parsing ticket IDs out of commit messages wasn't reliable:

- only some commits mentioned one;
- one PR's title named a different ticket than the one Linear had actually linked from its branch name.

Instead we use the links Linear's GitHub integration already makes:

1. For each commit since the last tag, ask GitHub which merged PR it came from (`/commits/{sha}/pulls`).
2. For each PR URL, ask Linear which issues are attached: `attachmentsForURL(url:)`.
3. Find or create the "RN Releases" group, and the version label under it.
4. Add the label to each issue with `issueAddLabel`. It runs per issue, so one failure doesn't stop the rest.

The step is best-effort: it warns on failure but never fails the run. One things to know:

- **Our first live run failed with "not allowed to take action".** The API key had read and write access, but creating labels needed **full access**.

#### Why we create release PRs by hand

A PR opened by a workflow using the built-in `GITHUB_TOKEN` doesn't trigger other workflows. A "start release" Action would have opened PRs our pipeline never saw. The workarounds were a bot token or a second dispatch-based trigger path. Creating the branch and PR by hand is three commands:

```bash
git switch -c release/1.34.0 origin/develop
npm version 1.34.0 --no-git-tag-version   # bump files only: no commit, no "v5.34.0" tag
git commit -am "chore: release 1.34.0" && git push -u origin release/1.34.0   # then open the PR into main
```

#### Merge conflicts switch the whole pipeline off

Our first test PR never triggered at all. **GitHub doesn't run `pull_request` workflows while a PR has merge conflicts**, and the old cherry-picks on `main` conflicted with `develop`. Resolving it (keeping the release's side) is a no-op merge:

```bash
git merge -s ours origin/main   # records main's history, keeps every file as-is
```

That only works permanently if the merge reaches `develop` _with its history_. Our first attempt went in with a feature PR that was squash-merged, and the fix vanished. The second went in with a merge commit and held.

---

### Phase 3: deploy on merge

Pushes to `main` trigger the deploy workflow, but **only the merge commit of a merged `release/*` PR deploys.** We look the PR up from the pushed commit and require `merge_commit_sha` to equal it, so a fast-forward or a stray direct push does nothing:

```bash
PR=$(gh api "repos/$GITHUB_REPOSITORY/commits/$GITHUB_SHA/pulls" -q "[.[] |
  select(.merged_at != null and .base.ref == \"main\"
         and (.head.ref | startswith(\"release/\"))
         and .merge_commit_sha == \"$GITHUB_SHA\")][0] // empty")
```

Then:

- **Guards:** `package.json` must match the branch, and the tag must not already exist. That second check stops a re-run from shipping the same version twice.
- **Classification is recomputed** with the same shared action the PR label uses, so the two can't disagree.
- **OTA:** `eas update --channel production --environment production --platform all`.
- **Store:** `eas build --profile production --platform all --wait --auto-submit`, then TestFlight and Play internal. Releasing to the public stays manual in App Store Connect and Play Console.
  - **Both platforms build even if only one changed.** It keeps versions and build numbers aligned.
- **Records:**
  - an annotated tag `X.Y.Z` on the merge commit;
  - a GitHub Release with the update group (and which binaries it runs on) or the build numbers, plus fingerprints, the PR and the changes;
  - a Slack message (and another on failure).
- **Back-merge:** a `main` → `develop` PR, which needs a merge commit.
- **Manual run = dry run:** classify a ref, compile the production bundle with `eas env:exec production "npx expo export"`, and list what a merge would do. Nothing is published.

Deciding OTA vs store comes down to comparing two hashes per platform:

```bash
FP=$(eas fingerprint:generate --build-profile production --platform "$P" --json --non-interactive \
       | sed -n '/^{/,$p' | jq -r '.hash')
LIVE_ID=$(eas build:list --build-profile production --platform "$P" --status finished --limit 1 --json \
       | sed -n '/^\[/,$p' | jq -r '.[0].id')
LIVE=$(eas build:view "$LIVE_ID" --json | sed -n '/^{/,$p' | jq -r '.fingerprint.hash')
[ "$FP" = "$LIVE" ] || TYPE=store
```

#### Enforce the merge method

Squash merges caused our only real regression in this project, so the merge method should be enforced, not remembered. GitHub's repository rulesets can restrict a target branch to **merge commits only**: Settings → Rules → Rulesets → a branch ruleset on `main`, with _Require a pull request_ and only **Merge** allowed. Every PR into `main` is a release PR, so that covers them all.

Rulesets match the target branch, though, so the same rule on `develop` would force every feature PR to use merge commits too. For the `main` → `develop` back-merge, the better fix is having the deploy workflow merge it itself with `gh pr merge --merge`.

---

### Lessons

1. **Audit before you automate.** Our biggest risks were already in production: laptop OTAs and a hotfix process that orphaned updates
2. **Fingerprints make "can this ship as an OTA?" mechanical.** Once version fields are skipped, the hash answers the question better than any checklist, and it agreed between CI and EAS.
3. **Report both version layers**, or OTAs are invisible in analytics and crash reports.
4. **Make every automated path fail toward safety.** When unsure, build a binary or classify as store, never ship stale code.
5. **GitHub has quiet rules that disable workflows:** PRs from `GITHUB_TOKEN` don't trigger them, conflicting PRs don't run them, and local actions resolve against whatever you checked out.
6. **Squash vs merge commit matters** once two long-lived branches have to stay reconciled. Enforce it where you can.
7. **Test the side effects on a throwaway release.** A `release/0.0.1` draft PR exercised the full pipeline, cancellation and re-runs, without touching production.

### What's next

The first release on the new flow is a store release, by design. After that, releases with no native change ship as OTA updates.
