const http = require('http');
const { io: createClient } = require('socket.io-client');
const { attachSocketServer } = require('../src/sockets');
const Avatar = require('../src/models/Avatar');

describe('Socket.IO server', () => {
    let server;
    let io;
    let port;

    beforeAll(async () => {
        server = http.createServer();
        io = attachSocketServer(server);

        await new Promise(resolve => {
            server.listen(0, '127.0.0.1', resolve);
        });

        port = server.address().port;
    });

    afterAll(async () => {
        io.close();

        await new Promise(resolve => {
            if (!server.listening) return resolve();
            server.close(resolve);
        });
    });

    test('connects and emits server:ready', async () => {
        const client = createClient(`http://127.0.0.1:${port}`, {
            forceNew: true,
            reconnection: false,
        });

        try {
            const ready = new Promise((resolve, reject) => {
                client.once('server:ready', resolve);
                client.once('connect_error', reject);
            });

            const data = await ready;

            expect(client.connected).toBe(true);
            expect(data.socketId).toBeTruthy();
            expect(data.proximityRadiusPx).toBeGreaterThan(0);
        } finally {
            client.disconnect();
        }
    });

    test('joins a room successfully', async () => {
        const updateSpy = jest
            .spyOn(Avatar, 'findOneAndUpdate')
            .mockResolvedValue({});

        const client = createClient(`http://127.0.0.1:${port}`, {
            forceNew: true,
            reconnection: false,
        });

        try {
            await new Promise((resolve, reject) => {
                client.once('connect', resolve);
                client.once('connect_error', reject);
            });

            const result = await new Promise(resolve => {
                client.emit(
                    'room:join',
                    {
                        userId: 'yashi-test',
                        displayName: 'Yashi',
                        roomId: 'room101',
                        position: { x: 100, y: 120 },
                    },
                    resolve
                );
            });

            expect(result.ok).toBe(true);
            expect(result.roomId).toBe('room101');
            expect(result.userId).toBe('yashi-test');
            expect(updateSpy).toHaveBeenCalled();
        } finally {
            client.disconnect();
            updateSpy.mockRestore();
        }
    });
});