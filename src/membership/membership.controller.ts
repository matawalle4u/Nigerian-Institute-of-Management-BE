import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import { Members } from './entities/membership.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { MembershipDto } from './dto/membership.dto';
import { SearchMemberDto } from './dto/search-querry.dto';
import { PaginationDto } from 'src/general-dtos/pagination.dto';
// import { CreateCriteriaDto } from './dto/criteria.dto';
// import { CreateGradeDto } from './dto/grade.dto';

@ApiTags('members')
@Controller('members')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new member' })
  create(@Body() memberDto: MembershipDto) {
    try {
      const member = this.membershipService.create(memberDto);
      if (member) {
        return memberDto;
      }
    } catch (error) {
      return error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all members' })
  @ApiResponse({
    status: 200,
    description: 'List of members',
    type: [Members],
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.membershipService.findAll(paginationDto);
  }

  // @Post('search')
  // search(@Body() searchQuerry: SearchMemberDto) {
  //   return this.membershipService.searchMembership(searchQuerry);
  // }

  @Get('search')
  async searchMembership(
    @Query() searchMemberDto: SearchMemberDto,
    @Query() paginationDto: PaginationDto,
  ) {
    const { data, total } = await this.membershipService.searchMembership(
      searchMemberDto,
      paginationDto,
    );

    return {
      data,
      meta: {
        page: paginationDto.page,
        limit: paginationDto.limit,
        total,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single member by ID' })
  @ApiResponse({ status: 200, description: 'Member details', type: Members })
  @ApiResponse({ status: 404, description: 'Member not found' })
  findOne(@Param('id') id: number) {
    return this.membershipService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a member' })
  @ApiBody({ type: Members, description: 'Updated member data' })
  @ApiResponse({
    status: 200,
    description: 'Member updated successfully',
    type: Members,
  })
  update(@Param('id') id: number, @Body() updateData: Partial<Members>) {
    return this.membershipService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a member' })
  @ApiResponse({ status: 200, description: 'Member deleted successfully' })
  remove(@Param('id') id: number) {
    return this.membershipService.remove(id);
  }
}
