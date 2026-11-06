const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Room = require('../src/models/Room');
const roomRoutes = require('../src/routes/roomRoutes');

jest.mock('../src/models/Room');

const app = express();
app.use(express.json());
app.use('/api/rooms', roomRoutes);

describe('Room API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/rooms should return all rooms', async () => {
        const rooms = [
            { roomId: 'room1', name: 'Room One' },
            { roomId: 'room2', name: 'Room Two' }
        ];

        Room.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(rooms)
            })
        });

        const response = await request(app).get('/api/rooms');

        expect(response.status).toBe(200);
        expect(response.body.count).toBe(2);
        expect(response.body.items).toEqual(rooms);
    });

    test('GET /api/rooms/:roomId should return a room', async () => {
        const room = { roomId: 'room1', name: 'Room One' };

        Room.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue(room)
        });

        const response = await request(app).get('/api/rooms/room1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(room);
    });

    test('GET /api/rooms/:roomId should return 404 if room does not exist', async () => {
        Room.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null)
        });

        const response = await request(app).get('/api/rooms/unknown');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Room not found');
    });

    test('PUT /api/rooms/:roomId should create or update a room', async () => {
        const room = {
            roomId: 'room1',
            name: 'Room One',
            layout: {
                width: 1200,
                height: 800,
                obstacles: []
            }
        };

        Room.findOneAndUpdate.mockResolvedValue(room);

        const response = await request(app)
            .put('/api/rooms/room1')
            .send({
                name: 'Room One',
                layout: {
                    width: 1200,
                    height: 800,
                    obstacles: []
                }
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(room);
        expect(Room.findOneAndUpdate).toHaveBeenCalled();
    });

    test('PUT /api/rooms/:roomId should reject missing name', async () => {
        const response = await request(app)
            .put('/api/rooms/room1')
            .send({
                layout: {
                    width: 1200,
                    height: 800,
                    obstacles: []
                }
            });

        expect(response.status).toBe(400);
    });

    test('PUT /api/rooms/:roomId should reject invalid layout dimensions', async () => {
        const response = await request(app)
            .put('/api/rooms/room1')
            .send({
                name: 'Room One',
                layout: {
                    width: -100,
                    height: 800,
                    obstacles: []
                }
            });

        expect(response.status).toBe(400);
    });

    test('PUT /api/rooms/:roomId should reject invalid obstacle data', async () => {
        const response = await request(app)
            .put('/api/rooms/room1')
            .send({
                name: 'Room One',
                layout: {
                    width: 1200,
                    height: 800,
                    obstacles: [
                        {
                            id: 'obstacle1',
                            type: 'block',
                            x: -10,
                            y: 20,
                            width: 100,
                            height: 100
                        }
                    ]
                }
            });

        expect(response.status).toBe(400);
    });
});