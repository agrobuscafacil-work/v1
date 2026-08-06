import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { Response } from "express";
import { existsSync } from "fs";
import path from "path";
import { SupportService, SupportUploadedFiles } from "./support.service";
import { CreateSupportTicketDto } from "./dto/create-support-ticket.dto";
import { AdminSupportQueryDto } from "./dto/admin-support-query.dto";
import { UpdateSupportStatusDto } from "./dto/update-support-status.dto";
import { AddSupportNoteDto } from "./dto/add-support-note.dto";
import { RespondSupportTicketDto } from "./dto/respond-support-ticket.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import {
  createSupportStorage,
  supportFileFilter,
  SUPPORT_UPLOAD_PATH,
  ALLOWED_FILE_EXTENSIONS,
} from "./support.constants";

@ApiTags("Support")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("support")
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get("categories")
  @ApiOperation({ summary: "List support categories with their problem types" })
  async getCategories() {
    return this.supportService.getCategories();
  }

  @Post("tickets")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a support ticket (with optional files)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        categoryId: { type: "string" },
        typeId: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        pageUrl: { type: "string" },
        browser: { type: "string" },
        os: { type: "string" },
        device: { type: "string" },
        appVersion: { type: "string" },
        images: { type: "array", items: { type: "string", format: "binary" } },
        documents: {
          type: "array",
          items: { type: "string", format: "binary" },
        },
        videos: { type: "array", items: { type: "string", format: "binary" } },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "images", maxCount: 6 },
        { name: "documents", maxCount: 3 },
        { name: "videos", maxCount: 3 },
      ],
      {
        storage: createSupportStorage(),
        fileFilter: supportFileFilter,
        limits: { fileSize: 20 * 1024 * 1024 },
      },
    ),
  )
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateSupportTicketDto,
    @UploadedFiles() files?: SupportUploadedFiles,
  ) {
    return this.supportService.createTicket(user.id, dto, files);
  }

  @Get("tickets/mine")
  @ApiOperation({ summary: "List the current user support tickets" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async findMine(
    @CurrentUser() user: any,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.supportService.findMyTickets(user.id, page, limit);
  }

  @Get("tickets/:id")
  @ApiOperation({ summary: "Get one of the current user support tickets" })
  async findOne(@CurrentUser() user: any, @Param("id") id: string) {
    return this.supportService.findMyTicket(user.id, id);
  }

  @Get("admin/tickets")
  @UseGuards(RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "List all support tickets (admin)" })
  async adminFindAll(@Query() query: AdminSupportQueryDto) {
    return this.supportService.adminFindAll(query);
  }

  @Get("admin/tickets/:id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Get support ticket detail (admin)" })
  async adminFindOne(@Param("id") id: string) {
    return this.supportService.adminFindOne(id);
  }

  @Patch("admin/tickets/:id/status")
  @UseGuards(RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Update support ticket status (admin)" })
  async adminUpdateStatus(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: UpdateSupportStatusDto,
  ) {
    return this.supportService.adminUpdateStatus(user.id, id, dto);
  }

  @Post("admin/tickets/:id/notes")
  @UseGuards(RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Add internal note to support ticket (admin)" })
  async adminAddNote(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: AddSupportNoteDto,
  ) {
    return this.supportService.adminAddNote(user.id, id, dto);
  }

  @Post("admin/tickets/:id/respond")
  @UseGuards(RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({ summary: "Respond to support ticket (admin)" })
  async adminRespond(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: RespondSupportTicketDto,
  ) {
    return this.supportService.adminRespond(user.id, id, dto);
  }

  @Get("files/:filename")
  @Public()
  @ApiOperation({ summary: "Serve an uploaded support attachment file" })
  async serveFile(@Param("filename") filename: string, @Res() res: Response) {
    if (
      !filename ||
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      throw new BadRequestException("Nome de arquivo inválido");
    }

    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_FILE_EXTENSIONS.has(ext)) {
      throw new BadRequestException("Tipo de arquivo inválido");
    }

    const filePath = path.join(SUPPORT_UPLOAD_PATH, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException("Arquivo não encontrado");
    }

    res.sendFile(filePath);
  }
}
