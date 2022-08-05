import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UserService {

    constructor(private prisma: PrismaService) {}

    async updateUser(userID: number, dto: UpdateUserDto) {
        const user = await this.prisma.user.update({
            where: {
                id: userID,
            },
            data: {
                ...dto,
            },
        });
        delete user.hash;
        return user;
    }
}
