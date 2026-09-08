import { ConflictException } from '@nestjs/common';

describe('photo duplicate contract', () => {
  it('uses a conflict response for exact duplicate uploads', () => {
    const error = new ConflictException({ message: 'Duplicate photograph detected', code: 'DUPLICATE_PHOTO' });
    expect(error.getStatus()).toBe(409);
    expect(error.getResponse()).toMatchObject({ code: 'DUPLICATE_PHOTO' });
  });
});
