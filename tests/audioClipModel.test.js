const mongoose = require('mongoose');
const AudioClip = require('../src/models/AudioClip');

describe('AudioClip Model Validation', () => {
    test('should create a valid AudioClip', () => {
        const clip = new AudioClip({
            ownerId: 'user1',
            roomId: 'room1',
            position: { x: 100, y: 200 }
        });

        const error = clip.validateSync();

        expect(error).toBeUndefined();
        expect(clip.active).toBe(true);
        expect(clip.title).toBe('Proximity audio session');
    });

    test('should require ownerId', () => {
        const clip = new AudioClip({
            roomId: 'room1',
            position: { x: 100, y: 200 }
        });

        const error = clip.validateSync();

        expect(error.errors.ownerId).toBeDefined();
    });

    test('should require roomId', () => {
        const clip = new AudioClip({
            ownerId: 'user1',
            position: { x: 100, y: 200 }
        });

        const error = clip.validateSync();

        expect(error.errors.roomId).toBeDefined();
    });

    test('should reject negative x position', () => {
        const clip = new AudioClip({
            ownerId: 'user1',
            roomId: 'room1',
            position: { x: -10, y: 200 }
        });

        const error = clip.validateSync();

        expect(error.errors['position.x']).toBeDefined();
    });

    test('should reject negative y position', () => {
        const clip = new AudioClip({
            ownerId: 'user1',
            roomId: 'room1',
            position: { x: 100, y: -20 }
        });

        const error = clip.validateSync();

        expect(error.errors['position.y']).toBeDefined();
    });

    test('should reject title longer than 120 characters', () => {
        const clip = new AudioClip({
            ownerId: 'user1',
            roomId: 'room1',
            title: 'A'.repeat(121),
            position: { x: 100, y: 200 }
        });

        const error = clip.validateSync();

        expect(error.errors.title).toBeDefined();
    });

    test('should trim ownerId and roomId', () => {
        const clip = new AudioClip({
            ownerId: ' user1 ',
            roomId: ' room1 ',
            position: { x: 100, y: 200 }
        });

        expect(clip.ownerId).toBe('user1');
        expect(clip.roomId).toBe('room1');
    });

    test('should accept zero position values', () => {
        const clip = new AudioClip({
            ownerId: 'user1',
            roomId: 'room1',
            position: { x: 0, y: 0 }
        });

        const error = clip.validateSync();

        expect(error).toBeUndefined();
    });
});