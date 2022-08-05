import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing'
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { UpdateUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDB();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'pizzas@gmail.com',
      password: 'pizza123',
    };
    describe('Signup', () => {
      it('should throw an error if email is not provided', () => {
        return pactum.spec().post('/auth/signup').withBody({
          password: dto.password,
        }).expectStatus(400);
      });
      it('should throw an error if password is not provided', () => {
        return pactum.spec().post('/auth/signup').withBody({
          email: dto.email,
        }).expectStatus(400);
      });
      it('should throw an error if body is not provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should signup a user', () => {
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);
      });
    })
    describe('Signin', () => {
      it('should throw an error if email is not provided', () => {
        return pactum.spec().post('/auth/signin').withBody({
          password: dto.password,
        }).expectStatus(400);
      });
      it('should throw an error if password is not provided', () => {
        return pactum.spec().post('/auth/signin').withBody({
          email: dto.email,
        }).expectStatus(400);
      });
      it('should throw an error if body is not provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('should signin a user', () => {
        return pactum.spec().post('/auth/signin').withBody(dto).expectStatus(200).stores('userAT', 'access_token');
      });
    })
  })

  describe('Users', () => {
    describe('Get user', () => {
      it('should get current user', () => {
        return pactum.spec().get('/users/me').withHeaders({
          Authorization: 'Bearer $S{userAT}',
        }).expectStatus(200);
      });
    })
    describe('Update user', () => {
      it('should get update user', () => {
        const dto: UpdateUserDto = {
          firstName: 'Fry',
          email: 'pizzaparlor@gmail.com'
        };
        return pactum.spec().patch('/users').withHeaders({
          Authorization: 'Bearer $S{userAT}',
        }).withBody(dto).expectStatus(200).expectBodyContains(dto.firstName).expectBodyContains(dto.email);
      });
    })
  })

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum.spec().get('/bookmarks').withHeaders({
          Authorization: 'Bearer $S{userAT}',
        }).expectStatus(200).expectBodyContains([]);
      })
    })
    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Pizza',
        link: 'https://www.pizzahut.com',
      };
      it('should create bookmark', () => {
        return pactum.spec().post('/bookmarks').withHeaders({
          Authorization: 'Bearer $S{userAT}',
        }).withBody(dto).expectStatus(201).stores('bookmarkID', 'id');
      });
    })
    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum.spec().get('/bookmarks').withHeaders({
          Authorization: 'Bearer $S{userAT}',
        }).expectStatus(200).expectJsonLength(1);
      })
    })
    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum.spec().get('/bookmarks/{id}').withPathParams('id','$S{bookmarkID}').withHeaders({
          Authorization: 'Bearer $S{userAT}',
        }).expectStatus(200).expectBodyContains('$S{bookmarkID}');
      })
    })
    describe('Update bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'Pizza Hut',
        description: 'Mid tier pizza',
      };
      it('should update bookmark', () => {
        return pactum.spec().patch('/bookmarks/{id}').withPathParams('id','$S{bookmarkID}').withHeaders({
          Authorization: 'Bearer $S{userAT}',
        }).withBody(dto).expectStatus(200).expectBodyContains(dto.title).expectBodyContains(dto.description);
      })
    })
    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum.spec().delete('/bookmarks/{id}').withPathParams('id','$S{bookmarkID}').withHeaders({
          Authorization: 'Bearer $S{userAT}',
        }).expectStatus(204);
      })
      it('should get empty bookmarks', () => {
        return pactum.spec().get('/bookmarks').withHeaders({
          Authorization: 'Bearer $S{userAT}',
        }).expectStatus(200).expectJsonLength(0);
      });
    })
  })
})