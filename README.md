# github-repo-sync

Simple webhook-based utility for keeping a remote GitHub repo up to date with the origin. And zero dependencies!

Based on the code from [this DigitalOcean tutorial](https://www.digitalocean.com/community/tutorials/how-to-use-node-js-and-github-webhooks-to-keep-remote-projects-in-sync), extended for a more modular format.

## Usage

Clone this repo, configure the settings, and run index.js.

It is highly recommended to start the script on server startup, especially behind a process manager such as PM2.

## Configuration (config.json)

| field  | type    | description                                   |
| ------ | ------- | --------------------------------------------- |
| port   | integer | HTTP port to start the server on (>1000)      |
| script | string  | code to execute to pull new changes in a repo |
| repos  | array   | array of repositories to be syncing           |

### Repository Configuration

| field  | type   | description                                                           |
| ------ | ------ | --------------------------------------------------------------------- |
| name   | string | name of repository, exactly as it appears on GitHub                   |
| path   | string | relative path of the repo's root directly, from the root of this repo |
| branch | string | target branch, will pull changes when this branch updates             |
| secret | string | secret                                                                |
| script | string | custom script specifically for this repo                              |

## GitHub Webhook Configuration

Target Repository > Settings > Webhooks > Add Webhook

- Payload URL: the URL of the github-repo-sync server
- Content Type: `application/json`
- Secret: a random secret, the same exact secret should be put in the repo configuration (see above)
- SSL Verification: enable (optional but much preferred, server should be reverse proxied through something like nginx)
- Target events: `push` event required, all others will be ignored
- Active: tick

Click Add Webhook. The repo sync should now be operational.
