import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import { Members } from './entities/membership.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { MembershipDto } from './dto/membership.dto';
import { SearchMemberDto } from './dto/search-querry.dto';
import { CreateCriteriaDto } from './dto/criteria.dto';
import { CreateGradeDto } from './dto/grade.dto';

@ApiTags('members')
@Controller('members')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new member' })
  @ApiBody({
    type: Members,
    description: 'Member data for creation',
    examples: {
      default: {
        summary: 'Sample Payload',
        value: {
          loginId: 101,
          memberNo: 'MEM12345',
          firstName: 'John',
          lastName: 'Doe',
          gender: 'male',
          dateOfBirth: '1990-01-01',
          dateOfElection: '2022-12-01',
          zone: 5,
          grade: 'graduate',
          lifeMember: 'no',
          license: 'yes',
          induction: 'yes',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Member created successfully',
    type: Members,
  })
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
  findAll() {
    return this.membershipService.findAll();
  }

  @Post('search')
  search(@Body() searchQuerry: SearchMemberDto) {
    return this.membershipService.searchMembership(searchQuerry);
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

  @Post('create-criteria')
  createCriteria(@Body() createCriteriaDto: CreateCriteriaDto) {
    return this.membershipService.createCriteria(createCriteriaDto);
  }
  @Post('create-grade')
  @ApiOperation({ summary: 'Create Membership Grade' })
  createGrade(@Body() createGradeDto: CreateGradeDto) {
    return this.membershipService.createGrade(createGradeDto);
  }

  @Post('upgrade/:userId')
  upgradeMembership(@Param('userId') userId: number) {
    return this.membershipService.upgradeMembership(userId);
  }
}
