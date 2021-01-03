


const express = require('express')
const exec = require('child_process').exec;
const app = express();


// A sample route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/folder.png', (req, res) => {
    res.sendFile(__dirname + '/folder.png');
});

app.get('/file.png', (req, res) => {
    res.sendFile(__dirname + '/file.png');
});

app.get('/ls', (req, res) => {




    exec(`find ${req.query.path} -maxdepth 1 -type d`, (error, stdoutDirs, stderr) => {
        const dirs = stdoutDirs
            .split('\n')
            .filter(n => n && n !== '.')
            .slice(1)
            .map(n => ({ name: n, isDir: true }));

        exec(`find ${req.query.path} -maxdepth 1 -type f`, (error, stdoutFiles, stderr) => {
            const files = stdoutFiles
                .split('\n')
                .filter(n => n)
                .map(n => ({ name: n, isDir: false }));

            res.send(dirs.concat(files));
        });
    });
});

app.get('/get-log', (req, res) => {

    const tmpFile =  `/tmp/${(+new Date()).toString()}.json`;
    
    const commands = [
        `cd ${req.query.root} &&`,
        `git log --date=iso --pretty=format:'%ad;%s' `,
        req.query.since ? `--since=${req.query.since}` : '',
        req.query.until ? `--until=${req.query.until}` : '',
        `--follow -- ${req.query.path} > ${tmpFile}`,
    ];    
    
    exec(commands.join(' '), (error, stdout, stderr) => {
        res.sendFile(tmpFile);
    });
});


app.get('/get-info', (req, res) => {


    // exec(`cd ${req.query.root} &&  git rev-list --all --count ${req.query.path}`, (error, stdout, stderr) => {
    //     res.send({count: stdout.trim()});
    // });
    const since = req.query.since ? `--since=${req.query.since}` : '';
    const until = req.query.until ? `--until=${req.query.until}` : '';


    
    exec(`cd ${req.query.root} && git log ${since} ${until} --pretty=oneline --follow -- ${req.query.path} | wc -l`, (error, stdout, stderr) => {
        res.send({count: stdout.trim()});
    });
});


// Start the Express server
app.listen(3000, () => console.log('Server running on port 3000!'))