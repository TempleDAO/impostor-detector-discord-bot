import 'dotenv/config';
import { Client, Intents, GuildMember, TextChannel } from 'discord.js';
const getenv = require('getenv');

const BLACKLIST_KEYWORDS: string[] = getenv.array('BLACKLIST_KEYWORDS');
const MONITORED_ROLES: string[] = getenv.array('MONITORED_ROLES');
const MODERATION_CHANNEL_NAME: string = getenv('MODERATION_CHANNEL_NAME');

export async function checkImpostor(target: GuildMember) {
  // Check banned keywords
  const report = [];
  console.log(`checking users with similar username to "${target.displayName}"`);
  if (
    BLACKLIST_KEYWORDS.some(w =>
      target.nickname ? target.displayName.toLowerCase().includes(w) : false
    )
  ) {
    report.push(`🚨Suspicious username alert 🚨:
${target}: id:${target.id} username: '${target.displayName}'`);
  }
  //
  const similar = await target.guild.members.search({
    query: target.displayName,
    limit: 10,
  });
  // this returns names that start with target.displayName
  // i.e. JD matches JDGood JDsomethingelse
  // so we consider similar names if they are +- 3 characters in length
  const similars = similar
    .filter(
      m =>
        m.id !== target.id &&
        m.displayName.length - target.displayName.length <= 3 &&
        m.roles.cache.some(r => MONITORED_ROLES.includes(r.name))
    )
    .map(m => `<@!${m.id}> "${m.displayName}" \`${m.id}\``)
    .join('\n');

  if (similars) {
    report.push(`Potential impostor alert:
${target} "${target.displayName}" ${target.id} (joined at <t:${Math.floor(
      (target.joinedTimestamp || 0) / 1000
    )}>)
--- similar to ---
${similars}`);
  }
  if (report.length > 0) {
    const reportChannel = target.guild.channels.cache.find(c => c.name === MODERATION_CHANNEL_NAME);
    if (reportChannel instanceof TextChannel) {
      await reportChannel.send({
        content: report.join('\n'),
        allowedMentions: { parse: [] },
      });
    }
  }
}

export const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
});

client.on('ready', async () => {
  console.log(`
BLACKLIST_KEYWORDS=${JSON.stringify(BLACKLIST_KEYWORDS)}
MONITORED_ROLES=${JSON.stringify(MONITORED_ROLES)}
`); // Without this the
  const targetGuild = client.guilds.cache.first();
  if (targetGuild === undefined) {
    throw new Error(`Bot is not authorized in any guild.`);
  }

  console.log(`Checking MODERATION_CHANNEL_NAME=${MODERATION_CHANNEL_NAME} exists`);

  const modChannel = targetGuild.channels.cache.find(c => c.name === MODERATION_CHANNEL_NAME);
  if (!modChannel) {
    throw new Error(`moderation channel '${MODERATION_CHANNEL_NAME}' doesn't exist`);
  }

  // check write permissions
  if (!modChannel.isText()) {
    throw new Error(`moderation channel is not text channel`);
  }
  console.log('OK');
  console.log(`Prefetching guild members in ${targetGuild.name} to warm up cache`);
  targetGuild.members.fetch({ force: true, time: 360000 });
  console.log('OK');
});

client.on('guildMemberAdd', checkImpostor);

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  if (oldMember.user?.bot) return;
  if (oldMember.displayName !== newMember.displayName) {
    // change username, check for impostors
    await checkImpostor(newMember);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
