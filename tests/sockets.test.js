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

    test('updates avatar position successfully', async () => {
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

            await new Promise(resolve => {
                client.emit(
                    'room:join',
                    {
                        userId: 'yashi-move-test',
                        displayName: 'Yashi',
                        roomId: 'room101',
                        position: { x: 100, y: 120 },
                    },
                    resolve
                );
            });

            const result = await new Promise(resolve => {
                client.emit(
                    'avatar:move',
                    {
                        position: { x: 150, y: 180 },
                    },
                    resolve
                );
            });

            expect(result.ok).toBe(true);
            expect(result.position).toEqual({ x: 150, y: 180 });
            expect(updateSpy).toHaveBeenCalledTimes(2);
        } finally {
            client.disconnect();
            updateSpy.mockRestore();
        }
    });

    test('notifies other users when an avatar disconnects', async () => {
        const updateSpy = jest
            .spyOn(Avatar, 'findOneAndUpdate')
            .mockResolvedValue({});

        const client1 = createClient(`http://127.0.0.1:${port}`, {
            forceNew: true,
            reconnection: false,
        });

        const client2 = createClient(`http://127.0.0.1:${port}`, {
            forceNew: true,
            reconnection: false,
        });

        try {
            await Promise.all([
                new Promise((resolve, reject) => {
                    client1.once('connect', resolve);
                    client1.once('connect_error', reject);
                }),
                new Promise((resolve, reject) => {
                    client2.once('connect', resolve);
                    client2.once('connect_error', reject);
                }),
            ]);

            const joinRoom = (client, userId) =>
                new Promise(resolve => {
                    client.emit(
                        'room:join',
                        {
                            userId,
                            displayName: userId,
                            roomId: 'disconnect-room',
                            position: { x: 100, y: 100 },
                        },
                        resolve
                    );
                });

            const result1 = await joinRoom(client1, 'yashi-disconnect');
            const result2 = await joinRoom(client2, 'other-user');

            expect(result1.ok).toBe(true);
            expect(result2.ok).toBe(true);

            const leftEvent = new Promise(resolve => {
                client2.once('avatar:left', resolve);
            });

            client1.disconnect();

            const data = await leftEvent;

            expect(data.userId).toBe('yashi-disconnect');
        } finally {
            client1.disconnect();
            client2.disconnect();
            updateSpy.mockRestore();
        }
    });
});