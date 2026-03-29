const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream');

// PART 1: 

// --- Question 1 ---
{
    const bigFile = path.join(__dirname, 'big.txt');
    if (!fs.existsSync(bigFile)) fs.writeFileSync(bigFile, "Ahmed Ashour Node.js ".repeat(100));
    const rs = fs.createReadStream(bigFile, { highWaterMark: 16 });
    rs.on('data', (chunk) => {
        console.log('--- Part 1 - Q1 ---');
        console.log(chunk.toString());
    });
}

// --- Question 2 ---
{
    const rs = fs.createReadStream(path.join(__dirname, 'source.txt'));
    const ws = fs.createWriteStream(path.join(__dirname, 'dest.txt'));
    rs.pipe(ws);
    ws.on('finish', () => console.log('Part 1 - Q2: Copy Done'));
}

// --- Question 3 ---
{
    const rs = fs.createReadStream(path.join(__dirname, 'data.txt'));
    const ws = fs.createWriteStream(path.join(__dirname, 'data.txt.gz'));
    pipeline(rs, zlib.createGzip(), ws, (err) => {
        if (!err) console.log('Part 1 - Q3: Compress Done');
    });
}

// PART 2: 

const db = path.join(__dirname, 'users.json');
if (!fs.existsSync(db)) fs.writeFileSync(db, "[]");

const server = http.createServer((req, res) => {
    const { method, url } = req;
    res.setHeader('Content-Type', 'application/json');

    const read = () => JSON.parse(fs.readFileSync(db, 'utf8'));
    const write = (data) => fs.writeFileSync(db, JSON.stringify(data, null, 2));

    // --- Question 1 ---
    if (method === 'POST' && url === '/user') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const users = read();
            const newUser = JSON.parse(body);
            if (users.some(u => u.email === newUser.email)) {
                res.end(JSON.stringify({ message: "Email already exists" }));
            } else {
                newUser.id = users.length > 0 ? users[users.length - 1].id + 1 : 1;
                users.push(newUser);
                write(users);
                res.end(JSON.stringify({ message: "User added successfully" }));
            }
        });
    }

    // --- Question 2 ---
    else if (method === 'PATCH' && url.startsWith('/user/')) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const id = parseInt(url.split('/')[2]);
            const users = read();
            const index = users.findIndex(u => u.id === id);
            if (index !== -1) {
                users[index] = { ...users[index], ...JSON.parse(body) };
                write(users);
                res.end(JSON.stringify({ message: "User updated successfully" }));
            } else {
                res.end(JSON.stringify({ message: "User ID not found" }));
            }
        });
    }

    // --- Question 3 ---
    else if (method === 'DELETE' && url.startsWith('/user/')) {
        const id = parseInt(url.split('/')[2]);
        const users = read();
        const filtered = users.filter(u => u.id !== id);
        if (users.length !== filtered.length) {
            write(filtered);
            res.end(JSON.stringify({ message: "User deleted successfully" }));
        } else {
            res.end(JSON.stringify({ message: "User ID not found" }));
        }
    }

    // --- Question 4 ---
    else if (method === 'GET' && url === '/user') {
        res.end(JSON.stringify(read()));
    }

    // --- Question 5 ---
    else if (method === 'GET' && url.startsWith('/user/')) {
        const id = parseInt(url.split('/')[2]);
        const users = read();
        const user = users.find(u => u.id === id);
        user ? res.end(JSON.stringify(user)) : res.end(JSON.stringify({ message: "User not found" }));
    }
});

server.listen(3000);








//part 3

//1 هو المحرك اللي بيراقب الـ Stack وبياخد الـ Callbacks من الـ Queue يشغلها لما نود يفضى.

//2مكتبة بـ C هي المسؤولة عن الـ Event Loop وتنفيذ العمليات التقيلة في الخلفية.

//3يبعت المهمة لـ Libuv تنفذها، ولما تخلص يرجع النتيجة عن طريق الـ Callback.

//4الـ Stack لتنفيذ الكود الحالي، والـ Queue لانتظار المهام اللي خلصت، والـ Loop هو المنظم بينهم

//5مجموعة threads بتشيل شغل الـ I/O التقيل، وبنغير حجمها بـ UV_THREADPOOL_SIZE.

//6الـ Blocking بيوقف البرنامج لحد ما المهمة تخلص، والـ Non-Blocking بيكمل تنفيذ ويرجع بالنتيجة لاحقاً



