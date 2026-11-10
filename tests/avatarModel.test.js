const Avatar = require('../src/models/Avatar');

describe('Avatar Model Validation', () => {

    test('should create a valid avatar', async () => {
        const avatar = new Avatar({
            userId: 'user1',
            displayName: 'Yashi',
            roomId: 'room1',
            position: { x: 100, y: 200 }
        });

        await expect(avatar.validate()).resolves.toBeUndefined();
    });

    test('should require userId', async () => {
        const avatar = new Avatar({
            displayName: 'Yashi',
            roomId: 'room1',
            position: { x: 100, y: 200 }
        });

        await expect(avatar.validate()).rejects.toThrow();
    });

    test('should require displayName', async () => {
        const avatar = new Avatar({
            userId: 'user1',
            roomId: 'room1',
            position: { x: 100, y: 200 }
        });

        await expect(avatar.validate()).rejects.toThrow();
    });

    test('should require roomId', async () => {
        const avatar = new Avatar({
            userId: 'user1',
            displayName: 'Yashi',
            position: { x: 100, y: 200 }
        });

        await expect(avatar.validate()).rejects.toThrow();
    });

    test('should require position coordinates', async () => {
        const avatar = new Avatar({
            userId: 'user1',
            displayName: 'Yashi',
            roomId: 'room1',
            position: {}
        });

        await expect(avatar.validate()).rejects.toThrow();
    });

    test('should reject negative x position', async () => {
        const avatar = new Avatar({
            userId: 'user1',
            displayName: 'Yashi',
            roomId: 'room1',
            position: { x: -1, y: 100 }
        });

        await expect(avatar.validate()).rejects.toThrow();
    });

    test('should reject negative y position', async () => {
        const avatar = new Avatar({
            userId: 'user1',
            displayName: 'Yashi',
            roomId: 'room1',
            position: { x: 100, y: -1 }
        });

        await expect(avatar.validate()).rejects.toThrow();
    });

    test('should reject displayName longer than 80 characters', async () => {
        const avatar = new Avatar({
            userId: 'user1',
            displayName: 'A'.repeat(81),
            roomId: 'room1',
            position: { x: 100, y: 200 }
        });

        await expect(avatar.validate()).rejects.toThrow();
    });

    test('should trim userId, displayName and roomId', () => {
        const avatar = new Avatar({
            userId: ' user1 ',
            displayName: ' Yashi ',
            roomId: ' room1 ',
            position: { x: 100, y: 200 }
        });

        expect(avatar.userId).toBe('user1');
        expect(avatar.displayName).toBe('Yashi');
        expect(avatar.roomId).toBe('room1');
    });

    test('should accept zero position coordinates', async () => {
        const avatar = new Avatar({
            userId: 'user1',
            displayName: 'Yashi',
            roomId: 'room1',
            position: { x: 0, y: 0 }
        });

        await expect(avatar.validate()).resolves.toBeUndefined();
    });

});