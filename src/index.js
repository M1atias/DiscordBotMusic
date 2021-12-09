const {executionAsyncResource} = require('async_hooks');
const discord = require('discord.js');
const ytdl = require('ytdl-core');

const {YTSearcher} = require('ytsearcher');

const searcher = new YTSearcher({
    key:'AIzaSyC4BHgHevv6zDAcb8yvSl5T_rxI53GoBBw',
    revealed: true
});

const client = new discord.Client();
const queue = new Map();

client.on('ready', () =>{
    console.log('Online')
})

client.on('message', async(message) =>{
    const prefix = '!';

    const serverQueue = queue.get(message.guild.id);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLocaleLowerCase();
    if (command === 'play') {
        execute(message,serverQueue)
    }

    async function execute(message, serverQueue){
        let vc = message.member.voice.channel;
        if(!vc){
            return message.channel.send('Please join a voice chat first');
        }else{
            let result = await searcher.search(args.join(" "),{ type: "video" });
            const songInfo = await ytdl.getInfo(result.first.url);

            let song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            };

            if (!serverQueue) {
                const queueConstructor = {
                    txtChannel: message.channel,
                    vChannel: vc,
                    connection: null,
                    songs: [],
                    volume: 10,
                    playing: true
                };
                queue.set(message.guild.id, queueConstructor);

                queueConstructor.songs.push(song);

                try{
                    let connection = await vc.join();
                    queueConstructor.connection = connection;
                    //play(message.guild, queueConstructor.songs[0]);
                }catch(err){
                    console.error(err);
                    queue.delete(message.guild.id);
                    return message.channel.send(`Unable to join the voice chat ${err}`)
                }
            }
        }
    }
})

client.login('OTE4Mjc5MjcyMDY4NjgxNzM5.YbE8Nw.C3MLyCasXBtyklx3xqfy9raU08w')