const HttpError = require('../models/http-error');
const League = require('../models/league');
const Driver = require('../models/driver');

const { Client, GatewayIntentBits } = require('discord.js');

const getMembers = async(req, res, next) => {

    const client = new Client({ intents: 
      [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ] 
    });

    const leagueId = req.params.lid;

    let guildId;
    try {
      let league = await League.findById( leagueId );
      guildId = league.properties.guildId;
    } catch (err) {
        const error = new HttpError('Fetching guild ID failed, please try again later.', 500);
        return next(error);
    };

    let leagueDrivers;
    try {
        leagueDrivers = await Driver.find({ 'refs.league': leagueId });
    } catch (err) {
        const error = new HttpError('Fetching drivers from this league failed, please try again later.', 500);
        return next(error);
    };

    if (guildId !== undefined) {
    client.once('ready', async () => {

        var guild = client.guilds.cache.get(guildId);

        if (guild !== undefined) {

          let tags = await guild.roles.fetch();

          tags = tags.map((tag) => { return { id: tag.id, name: tag.name } });

          let response = await guild.members.fetch();

          let members = response.map((member) => {

            let avatar;
            if (member.user.avatar !== null) {
              avatar = `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=128`;
            } else {
              avatar = 'https://discord.com/assets/6debd47ed13483642cf09e832ed0bc1b.png';
            };

            const memberRolesArray = tags.filter((tag) => { // LEAGUE TAGS
              return member._roles.some((role) => { // NEW MEMBERS TAGS
                return role === tag.id;
              });
            });

            let roles = memberRolesArray.map((role) => { return role.name });

            return {
              id: member.user.id,
              link: undefined,
              bot: member.user.bot,
              username: member.user.username,
              nickname: member.nickname,
              preferredName: member.user.username,
              avatar: avatar,
              tags: roles,
              banner: member.user.banner,
              accentColor: member.user.accentColor,
            }
          }); 

          members = members.filter(dmember => dmember.bot !== true);

          members = members.filter(dmember => //discord
            leagueDrivers.every(ldriver => ldriver.properties.discordId !== dmember.id )
          );

          res.json({ members: members });

        }
    });
  }

    client.login('xxxxxx');
};

exports.getMembers = getMembers;
