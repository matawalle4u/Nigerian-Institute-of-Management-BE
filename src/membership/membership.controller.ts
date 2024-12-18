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
import { Membership } from './entities/membership.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('members')
@Controller('members')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new member' })
  @ApiBody({
    type: Membership,
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
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Member created successfully',
    type: Membership,
  })
  create(@Body() memberData: Partial<Membership>) {
    return this.membershipService.create(memberData);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all members' })
  @ApiResponse({
    status: 200,
    description: 'List of members',
    type: [Membership],
  })
  findAll() {
    return this.membershipService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single member by ID' })
  @ApiResponse({ status: 200, description: 'Member details', type: Membership })
  @ApiResponse({ status: 404, description: 'Member not found' })
  findOne(@Param('id') id: number) {
    return this.membershipService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a member' })
  @ApiBody({ type: Membership, description: 'Updated member data' })
  @ApiResponse({
    status: 200,
    description: 'Member updated successfully',
    type: Membership,
  })
  update(@Param('id') id: number, @Body() updateData: Partial<Membership>) {
    return this.membershipService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a member' })
  @ApiResponse({ status: 200, description: 'Member deleted successfully' })
  remove(@Param('id') id: number) {
    return this.membershipService.remove(id);
  }
}
