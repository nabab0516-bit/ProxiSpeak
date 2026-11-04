const http = require('http');
const { io: createClient } = require('socket.io-client');
const { attachSocketServer } = require('../src/sockets');
const Avatar = require('../src/models/Avatar');
const { DEFAULT_PROXIMITY_RADIUS_PX: radius } = require('../src/config/constants');

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

    const createConnectedClient = async () => {
        const client = createClient(`http://127.0.0.1:${port}`, {
            forceNew: true,
            reconnection: false,
        });

        await new Promise((resolve, reject) => {
            client.once('connect', resolve);
            client.once('connect_error', reject);
        });

        return client;
    };

    const joinRoom = (client, userId, roomId, position) =>
        new Promise(resolve => {
            client.emit(
                'room:join',
                {
                    userId,
                    displayName: userId,
                    roomId,
                    position,
                },
                resolve
            );
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

        const client = await createConnectedClient();

        try {
            const result = await joinRoom(
                client,
                'yashi-test',
                'room101',
                { x: 100, y: 120 }
            );

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

        const client = await createConnectedClient();

        try {
            await joinRoom(
                client,
                'yashi-move-test',
                'room101',
                { x: 100, y: 120 }
            );

            const result = await new Promise(resolve => {
                client.emit(
                    'avatar:move',
                    { position: { x: 150, y: 180 } },
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

        const client1 = await createConnectedClient();
        const client2 = await createConnectedClient();

        try {
            const result1 = await joinRoom(
                client1,
                'yashi-disconnect',
                'disconnect-room',
                { x: 100, y: 100 }
            );

            const result2 = await joinRoom(
                client2,
                'other-user',
                'disconnect-room',
                { x: 120, y: 120 }
            );

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

    test('sends WebRTC signal to a nearby user in the same room', async () => {
        const updateSpy = jest
            .spyOn(Avatar, 'findOneAndUpdate')
            .mockResolvedValue({});

        const sender = await createConnectedClient();
        const receiver = await createConnectedClient();

        try {
            await joinRoom(
                sender,
                'signal-sender',
                'signal-room',
                { x: 100, y: 100 }
            );

            await joinRoom(
                receiver,
                'signal-receiver',
                'signal-room',
                { x: 120, y: 120 }
            );

            const signal = { type: 'offer', sdp: 'test-sdp-data' };

            const receivedSignal = new Promise(resolve => {
                receiver.once('webrtc:signal', resolve);
            });

            const result = await new Promise(resolve => {
                sender.emit(
                    'webrtc:signal',
                    {
                        targetUserId: 'signal-receiver',
                        signal,
                    },
                    resolve
                );
            });

            const data = await receivedSignal;

            expect(result.ok).toBe(true);
            expect(data.fromUserId).toBe('signal-sender');
            expect(data.signal).toEqual(signal);
        } finally {
            sender.disconnect();
            receiver.disconnect();
            updateSpy.mockRestore();
        }
    });

    test('rejects WebRTC signaling if sender has not joined a room', async () => {
        const sender = await createConnectedClient();

        try {
            const result = await new Promise(resolve => {
                sender.emit(
                    'webrtc:signal',
                    {
                        targetUserId: 'some-user',
                        signal: { type: 'offer' },
                    },
                    resolve
                );
            });

            expect(result.ok).toBe(false);
            expect(result.error).toBe('Join a room before signaling');
        } finally {
            sender.disconnect();
        }
    });

    test('rejects WebRTC signal when target is outside proximity radius', async () => {
        const updateSpy = jest
            .spyOn(Avatar, 'findOneAndUpdate')
            .mockResolvedValue({});

        const sender = await createConnectedClient();
        const receiver = await createConnectedClient();

        try {
            await joinRoom(
                sender,
                'far-sender',
                'far-room',
                { x: 100, y: 100 }
            );

            await joinRoom(
                receiver,
                'far-receiver',
                'far-room',
                { x: 100 + radius + 100, y: 100 }
            );

            const result = await new Promise(resolve => {
                sender.emit(
                    'webrtc:signal',
                    {
                        targetUserId: 'far-receiver',
                        signal: { type: 'offer' },
                    },
                    resolve
                );
            });

            expect(result.ok).toBe(false);
            expect(result.error).toBe(
                'Target user is outside the proximity radius'
            );
        } finally {
            sender.disconnect();
            receiver.disconnect();
            updateSpy.mockRestore();
        }
    });
});