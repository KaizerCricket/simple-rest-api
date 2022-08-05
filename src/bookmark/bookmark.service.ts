import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) { }
    async createBookmark(userID: number, dto: CreateBookmarkDto) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                userID,
                ...dto,
            },
        });
        return bookmark;
    }
    
    getBookmarks(userID: number) {
        return this.prisma.bookmark.findMany({
            where: {
                userID,
            },
        });

    }

    getBookmarkByID(userID: number, bookmarkID: number) {
        return this.prisma.bookmark.findFirst({
            where: {
                id: bookmarkID,
                userID,
            },
        });
    }

    async editBookmarkByID(userID: number, bookmarkID: number, dto: EditBookmarkDto) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkID,
            }
        });
        if (!bookmark || bookmark.userID !== userID)
            throw new ForbiddenException('Access to resources denied');

        return this.prisma.bookmark.update({
            where: {
                id: bookmarkID,
            },
            data: {
                ...dto,
            },
        });
    }

    async deleteBookmarkByID(userID: number, bookmarkID: number) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkID,
            }
        });
        if (!bookmark || bookmark.userID !== userID)
            throw new ForbiddenException('Access to resources denied');

        await this.prisma.bookmark.delete({
            where: {
                id: bookmarkID,
            },
        });
    }
}
