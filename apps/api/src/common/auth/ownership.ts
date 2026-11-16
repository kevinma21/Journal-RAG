import { NotFoundException } from '@nestjs/common';

export function assertOwnership(
  ownerId: string,
  authenticatedUserId: string,
): void {
  if (ownerId !== authenticatedUserId) {
    throw new NotFoundException('Resource not found');
  }
}