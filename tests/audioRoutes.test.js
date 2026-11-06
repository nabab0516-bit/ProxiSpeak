const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const AudioClip = require('../src/models/AudioClip');

jest.mock('../src/models/AudioClip');

describe('Audio API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/audio', () => {
    test('should return active audio clips', async () => {
      const clips = [
        { _id: '1', ownerId: 'user1', roomId: 'room1', active: true }
      ];

      AudioClip.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(clips)
        })
      });

      const response = await request(app).get('/api/audio');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.items).toEqual(clips);
      expect(AudioClip.find).toHaveBeenCalledWith({ active: true });
    });

    test('should filter clips by roomId', async () => {
      AudioClip.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([])
        })
      });

      const response = await request(app)
        .get('/api/audio')
        .query({ roomId: 'room1' });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
      expect(AudioClip.find).toHaveBeenCalledWith({
        active: true,
        roomId: 'room1'
      });
    });
  });

  describe('GET /api/audio/nearby', () => {
    test('should return nearby clips sorted by distance', async () => {
      const clips = [
        { _id: '1', position: { x: 30, y: 40 } },
        { _id: '2', position: { x: 10, y: 0 } },
        { _id: '3', position: { x: 200, y: 200 } }
      ];

      AudioClip.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(clips)
      });

      const response = await request(app)
        .get('/api/audio/nearby')
        .query({ x: 0, y: 0, radiusPx: 100 });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.items[0]._id).toBe('2');
      expect(response.body.items[1]._id).toBe('1');
      expect(response.body.items[0].distancePx).toBe(10);
      expect(response.body.items[1].distancePx).toBe(50);
    });

    test('should reject invalid coordinates', async () => {
      const response = await request(app)
        .get('/api/audio/nearby')
        .query({ x: -1, y: 10 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'x and y must be non-negative numbers'
      );
    });

    test('should reject invalid radius', async () => {
      const response = await request(app)
        .get('/api/audio/nearby')
        .query({ x: 0, y: 0, radiusPx: 6000 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'radiusPx must be greater than 0 and at most 5000'
      );
    });
  });

  describe('POST /api/audio', () => {
    test('should create an audio clip', async () => {
      const clip = {
        _id: '123',
        ownerId: 'user1',
        roomId: 'room1',
        title: 'Test audio',
        position: { x: 10, y: 20 }
      };

      AudioClip.create.mockResolvedValue(clip);

      const response = await request(app)
        .post('/api/audio')
        .send({
          ownerId: 'user1',
          roomId: 'room1',
          title: 'Test audio',
          position: { x: 10, y: 20 }
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(clip);
      expect(AudioClip.create).toHaveBeenCalledWith({
        ownerId: 'user1',
        roomId: 'room1',
        title: 'Test audio',
        position: { x: 10, y: 20 }
      });
    });

    test('should reject invalid audio clip data', async () => {
      const response = await request(app)
        .post('/api/audio')
        .send({
          ownerId: 'user1',
          roomId: 'room1',
          position: { x: -5, y: 10 }
        });

      expect(response.status).toBe(400);
      expect(AudioClip.create).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /api/audio/:id/position', () => {
    test('should update audio clip position', async () => {
      const updatedClip = {
        _id: '123',
        position: { x: 50, y: 60 }
      };

      AudioClip.findByIdAndUpdate.mockResolvedValue(updatedClip);

      const response = await request(app)
        .patch('/api/audio/123/position')
        .send({ position: { x: 50, y: 60 } });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedClip);
      expect(AudioClip.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          position: { x: 50, y: 60 }
        }),
        { new: true, runValidators: true }
      );
    });

    test('should reject invalid position', async () => {
      const response = await request(app)
        .patch('/api/audio/123/position')
        .send({ position: { x: -10, y: 20 } });

      expect(response.status).toBe(400);
      expect(AudioClip.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('should return 404 when audio clip does not exist', async () => {
      AudioClip.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/audio/123/position')
        .send({ position: { x: 10, y: 20 } });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Audio session not found');
    });
  });

  describe('DELETE /api/audio/:id', () => {
    test('should deactivate an audio clip', async () => {
      AudioClip.findByIdAndUpdate.mockResolvedValue({
        _id: '123',
        active: false
      });

      const response = await request(app).delete('/api/audio/123');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Audio session deactivated');
      expect(response.body.id).toBe('123');
      expect(AudioClip.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        { active: false },
        { new: true }
      );
    });

    test('should return 404 when audio clip does not exist', async () => {
      AudioClip.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app).delete('/api/audio/123');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Audio session not found');
    });
  });
});
