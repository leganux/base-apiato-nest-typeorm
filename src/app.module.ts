import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './core/auth/auth.module';
import { MailModule } from './core/mail/mail.module';
import { FileModule } from './core/file/file.module';
import { WelcomesModule } from './welcome/welcomes.module';
import { JwtModule } from '@nestjs/jwt';
import { User } from './user/entities/user.entity';
import { File } from './core/file/entities/file.entity';
import { AccessMiddleware } from './core/middleware/access.middleware';
import { MiddlewareModule } from './core/middleware/middleware.module';
import {
  RolesAndAccessConfig,
  rolesAndAccessConfig,
} from './core/config/rolesAndAccess.config';

const getPaths = (rolesAndAccessConfig: RolesAndAccessConfig) => {
  console.info('Loading middleware... ');
  const paths = [];
  for (const [key, val] of Object.entries(rolesAndAccessConfig)) {
    console.info(key);
    console.table(val.routes);
    paths.push({ path: '/api/v1/' + key + '/*', method: RequestMethod.ALL });
  }
  return paths;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'sqlite',
        database: 'database.sqlite',
        entities: [User, File],
        synchronize: true,
        migrationsRun: true,
        logging: true,
        //dropSchema: true, // This will drop and recreate the schema on each startup
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    MailModule,
    FileModule,
    WelcomesModule,
    MiddlewareModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          '09283746gbdeujdbd37edgu3y78r3r3duheixh783tr783___$$L3GaNUx',
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AccessMiddleware)
      .forRoutes(...getPaths(rolesAndAccessConfig));
  }
}
