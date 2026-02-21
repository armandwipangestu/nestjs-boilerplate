/**
 * @type {import('semantic-release').GlobalConfig}
 */

const owner = "armandwipangestu";
const repo = "nestjs-boilerplate";
const dockerUser = "devvnull";
const npmScope = `@${owner}`;

module.exports = {
  branches: [
    "main",
    { 
      name: "staging", 
      prerelease: "rc",
    },
  ],
  tagFormat: "v${version}",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          // MAJOR changes
          { breaking: true, release: "major" },

          // MINOR changes
          { type: "feat", release: "minor" },

          // PATCH changes 
          { type: "fix", release: "patch" },
          { type: "hotfix", release: "patch" },
          { type: "chore", release: "patch" },
          { type: "revert", release: "patch" },
          { type: "perf", release: "patch" },
          { type: "refactor", release: "patch" },
          { type: "patch", release: "patch" },

          // NO release
          { type: "docs", release: false },
          { type: "style", release: false },
          { type: "test", release: false },
          { type: "ci", release: false },
          { type: "chore", scope: "release", release: false },
        ],
        parserOpts: {
          noteKeywords: [
            "BREAKING CHANGE",
            "BREAKING CHANGES",
          ],
        },
      },
    ],
    [
      "@semantic-release/release-notes-generator", 
      { 
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "✨ Features" },
            { type: "fix", section: "🐛 Bug Fixes" },
            { type: "hotfix", section: "🚑 Hotfixes" },
            { type: "chore", section: "🧹 Chores" },
            { type: "chore", scope: "release", hidden: true },
            { type: "revert", section: "⏪ Reverts" },
            { type: "perf", section: "⚡ Performance" },
            { type: "refactor", section: "♻️ Refactor" },
            { type: "patch", section: "🩹 Patch" },
          ],
        },
        parserOpts: {
          noteKeywords: [
            "BREAKING CHANGE",
            "BREAKING CHANGES",
          ],
        },
       },
    ],
    [
      "@semantic-release/changelog", 
      { 
        changelogFile: "CHANGELOG.md",
       },
    ],
    [
      "@semantic-release/npm", 
      { 
        npmPublish: false,
       },
    ],
    [
      "@semantic-release/git",
      {
        assets: [
          "CHANGELOG.md", 
          "package.json",
        ],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    [
      "@semantic-release/github",
      {
        successComment: `🎉 This PR is included in version **\${nextRelease.version}** 🎉

🔗 **View Release:** 

- GitHub Release: [\${nextRelease.gitTag}](https://github.com/${owner}/${repo}/releases/tag/\${nextRelease.gitTag})
- GitHub Container Registry: [\${nextRelease.version}](https://github.com/${owner}/${repo}/pkgs/container/${repo})
- Docker Hub: [\${nextRelease.version}](https://hub.docker.com/layers/${dockerUser}/${repo}/\${nextRelease.version})

🤖 *"Kill all humans"* - Your [semantic-release](https://github.com/semantic-release/semantic-release) bot 🚀`,
        failComment: `❌ **Release Failed**

Semantic-release failed to create release for this commit.

**Error:** \${error.message}

Please check the log CI for more information and fix the problem.`,
        labels: [
          "released",
        ],
      },
    ],
    [
      "@semantic-release/exec", 
      { 
        successCmd: "echo \"${nextRelease.version}\" > version.txt", 
      },
    ],
  ],
};