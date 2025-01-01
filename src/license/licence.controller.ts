import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Get,
  Query,
  Headers,
} from '@nestjs/common';

import { LicenseService } from './license.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { SearchLicenseDto } from './dto/search-license.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { License } from './entities/license.entity';
@ApiTags('License')
@Controller('license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Post()
  async addLicense(
    @Headers('Authorization') authToken: string,
    @Body() createLicenseDto: CreateLicenseDto,
  ) {
    //check if the user has the license or not using login token.
    return this.licenseService.addLicense(authToken, createLicenseDto);
  }
  @Get()
  findAll() {
    return this.licenseService.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single License by ID' })
  @ApiResponse({ status: 200, description: 'License details', type: License })
  @ApiResponse({ status: 404, description: 'Licence not found' })
  findOne(@Param('id') id: number) {
    return this.licenseService.findOne(id);
  }
  @Put(':id')
  async updateLicense(
    @Param('id') id: number,
    @Body() updateLicenseDto: UpdateLicenseDto,
  ) {
    return this.licenseService.updateLicense(id, updateLicenseDto);
  }

  @Delete(':id')
  async deleteLicence(@Param('id') id: number) {
    await this.licenseService.deleteLicense(id);
    return { message: 'License deleted successfully' };
  }
  @Get('search')
  async searchLicense(
    @Query() searchDto: SearchLicenseDto,
  ): Promise<License[]> {
    return this.licenseService.searchLicense(searchDto);
  }

  @Get('user/:userId')
  async getUserLicense(
    @Headers('Authorization') authToken: string,
    @Param() userId: number,
  ) {
    console.log(authToken, userId);
    const license = await this.licenseService.getUserLicense(authToken, userId);
    if (!license) {
      return {
        message: `License not found for the specified user with ID ${userId}`,
      };
    }
    return license;
  }
}
