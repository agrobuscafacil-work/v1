import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { Request } from "express";
import { SupportService, AuditContext } from "./support.service";
import { AdminSupportQueryDto } from "./dto/admin-support-query.dto";
import { UpdateSupportStatusDto } from "./dto/update-support-status.dto";
import { AddSupportNoteDto } from "./dto/add-support-note.dto";
import { RespondSupportTicketDto } from "./dto/respond-support-ticket.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Support Admin")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
@Controller("support/admin")
export class AdminSupportController {
  constructor(private readonly supportService: SupportService) {}

  private auditContext(req: Request): AuditContext {
    return {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    };
  }

  @Get("tickets")
  @ApiOperation({ summary: "List all support tickets (admin)" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "user", required: false })
  @ApiQuery({ name: "categoryId", required: false })
  @ApiQuery({ name: "typeId", required: false })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "userId", required: false })
  async findAll(@Query() query: AdminSupportQueryDto) {
    return this.supportService.adminFindAll(query);
  }

  @Get("tickets/:id")
  @ApiOperation({ summary: "Get a support ticket by ID (admin)" })
  async findOne(@Param("id") id: string) {
    return this.supportService.adminFindOne(id);
  }

  @Patch("tickets/:id/status")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Change a support ticket status (admin)" })
  async updateStatus(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: UpdateSupportStatusDto,
    @Req() req: Request,
  ) {
    return this.supportService.adminUpdateStatus(
      user.id,
      id,
      dto,
      this.auditContext(req),
    );
  }

  @Post("tickets/:id/notes")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add an internal note to a support ticket (admin)" })
  async addNote(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: AddSupportNoteDto,
    @Req() req: Request,
  ) {
    return this.supportService.adminAddNote(
      user.id,
      id,
      dto,
      this.auditContext(req),
    );
  }

  @Post("tickets/:id/respond")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Respond to the user about a support ticket (admin)",
  })
  async respond(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: RespondSupportTicketDto,
    @Req() req: Request,
  ) {
    return this.supportService.adminRespond(
      user.id,
      id,
      dto,
      this.auditContext(req),
    );
  }
}
