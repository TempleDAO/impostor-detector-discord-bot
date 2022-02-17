# Simple impostor detector bot

**Single guild setup for demonstration purposes/self hosting.**

## What it does
Whenever user joins your guild/changes their username 

1) their username is checked against all server usernames
   - if similar username is found and the target has one of the roles defined in `MONITORED_ROLES` - you should set it to the important roles in your guild scammers might want to impersonate (moderators/admins). To do this it uses the native discord feature of searching for usernames.
   - the username contains forbidden keywords (`BLACKLIST_KEYWORDS`) eg. `support` or `admin` or `help desk`

2) if any of the conditions above is satisfied a message is sent to `MODERATION_CHANNEL_NAME` to alert the moderators so they can investigate.

## What it does not do
kick/ban or make any decisions. Merely warns of suspicious activity.


## Run

``` sh
$ cp env-template .env
```
and edit the variables according to your needs

```sh
$ yarn install
$ yarn build
$ yarn start
```

Your discord bot should
- have `GUILD_MEMBERS` priviledged intent
- have write access to `MODERATION_CHANNEL_NAME`
- have `SEND_MESSAGES` permission

(i.e. change `YOUR_CLIENT_ID` below)
`https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2048&scope=bot`
