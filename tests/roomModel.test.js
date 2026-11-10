const mongoose = require('mongoose');
const Room = require('../src/models/Room');

describe('Room Model Validation', () => {

    test('should create a valid room', async () => {
        const room = new Room({
            roomId: 'room1',
            name: 'Test Room'
        });

        await expect(room.validate()).resolves.toBeUndefined();
    });

    test('should require roomId', async () => {
        const room = new Room({
            name: 'Test Room'
        });

        await expect(room.validate()).rejects.toThrow();
    });

    test('should require name', async () => {
        const room = new Room({
            roomId: 'room1'
        });

        await expect(room.validate()).rejects.toThrow();
    });

    test('should reject name longer than 100 characters', async () => {
        const room = new Room({
            roomId: 'room1',
            name: 'A'.repeat(101)
        });

        await expect(room.validate()).rejects.toThrow();
    });

    test('should reject layout width less than 1', async () => {
        const room = new Room({
            roomId: 'room1',
            name: 'Test Room',
            layout: { width: 0, height: 800 }
        });

        await expect(room.validate()).rejects.toThrow();
    });

    test('should reject layout height less than 1', async () => {
        const room = new Room({
            roomId: 'room1',
            name: 'Test Room',
            layout: { width: 1200, height: 0 }
        });

        await expect(room.validate()).rejects.toThrow();
    });

    test('should reject negative obstacle coordinates', async () => {
        const room = new Room({
            roomId: 'room1',
            name: 'Test Room',
            layout: {
                obstacles: [{
                    id: 'obstacle1',
                    x: -1,
                    y: 10,
                    width: 100,
                    height: 100
                }]
            }
        });

        await expect(room.validate()).rejects.toThrow();
    });

    test('should reject obstacle width less than 1', async () => {
        const room = new Room({
            roomId: 'room1',
            name: 'Test Room',
            layout: {
                obstacles: [{
                    id: 'obstacle1',
                    x: 10,
                    y: 10,
                    width: 0,
                    height: 100
                }]
            }
        });

        await expect(room.validate()).rejects.toThrow();
    });

    test('should reject invalid obstacle type', async () => {
        const room = new Room({
            roomId: 'room1',
            name: 'Test Room',
            layout: {
                obstacles: [{
                    id: 'obstacle1',
                    type: 'invalid',
                    x: 10,
                    y: 10,
                    width: 100,
                    height: 100
                }]
            }
        });

        await expect(room.validate()).rejects.toThrow();
    });

    test('should apply default layout values', () => {
        const room = new Room({
            roomId: 'room1',
            name: 'Test Room'
        });

        expect(room.layout.width).toBe(1200);
        expect(room.layout.height).toBe(800);
        expect(room.layout.obstacles).toEqual([]);
    });

});