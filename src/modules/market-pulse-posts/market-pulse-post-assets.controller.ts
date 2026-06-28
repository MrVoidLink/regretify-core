import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import {
  ADMIN_ROLE_AUTHOR,
  ADMIN_ROLE_SUPER_ADMIN,
} from '../admin-auth/admin-role.constants';
import { AdminRoles } from '../admin-auth/decorators/admin-roles.decorator';
import { AdminAccessTokenGuard } from '../admin-auth/guards/admin-access-token.guard';
import { AdminRolesGuard } from '../admin-auth/guards/admin-roles.guard';
import type { AuthenticatedAdmin } from '../admin-auth/types/admin-auth.types';
import { UploadMarketPulsePostAssetDto } from './dto/upload-market-pulse-post-asset.dto';
import { MarketPulsePostsService } from './market-pulse-posts.service';

@Controller('admin/market-pulse/posts')
@UseGuards(AdminAccessTokenGuard, AdminRolesGuard)
@AdminRoles(ADMIN_ROLE_SUPER_ADMIN, ADMIN_ROLE_AUTHOR)
export class MarketPulsePostAssetsController {
  constructor(
    private readonly marketPulsePostsService: MarketPulsePostsService,
  ) {}

  @Post(':id/assets')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  uploadPostAsset(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: Request & { admin: AuthenticatedAdmin },
    @Body() input: UploadMarketPulsePostAssetDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    return this.marketPulsePostsService.uploadPostAsset(
      id,
      request.admin,
      input.kind,
      file,
    );
  }
}
