import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateSupportTicketDto } from "./dto/create-support-ticket.dto";
import { UpdateSupportStatusDto } from "./dto/update-support-status.dto";
import { AddSupportNoteDto } from "./dto/add-support-note.dto";
import { RespondSupportTicketDto } from "./dto/respond-support-ticket.dto";
import { AdminSupportQueryDto } from "./dto/admin-support-query.dto";
import {
  SUPPORT_UPLOAD_LIMITS,
  sanitizeText,
  sanitizeFilename,
} from "./support.constants";
import {
  SupportAttachmentType,
  SupportTicketStatus,
  NotificationType,
} from "@prisma/client";
import { unlink } from "fs/promises";

export interface SupportUploadedFiles {
  images?: Express.Multer.File[];
  documents?: Express.Multer.File[];
  videos?: Express.Multer.File[];
}

export interface AuditContext {
  ip?: string;
  userAgent?: string;
}

const ticketInclude = {
  category: true,
  type: true,
  attachments: true,
} as const;

const adminTicketInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  },
  category: true,
  type: true,
  attachments: true,
  notes: {
    include: {
      admin: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" as const },
  },
  statusHistory: {
    orderBy: { createdAt: "desc" as const },
  },
} as const;

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async getCategories() {
    return this.prisma.supportCategory.findMany({
      where: { active: true, deletedAt: null },
      include: {
        types: {
          where: { active: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });
  }

  async createTicket(
    userId: string,
    dto: CreateSupportTicketDto,
    files?: SupportUploadedFiles,
  ) {
    const category = await this.prisma.supportCategory.findFirst({
      where: { id: dto.categoryId, active: true, deletedAt: null },
    });
    if (!category) {
      await this.removeUploadedFiles(files);
      throw new BadRequestException("Categoria de suporte inválida");
    }

    const type = await this.prisma.supportType.findFirst({
      where: {
        id: dto.typeId,
        categoryId: dto.categoryId,
        active: true,
      },
    });
    if (!type) {
      await this.removeUploadedFiles(files);
      throw new BadRequestException(
        "Tipo de problema inválido para a categoria selecionada",
      );
    }

    let attachments: {
      type: SupportAttachmentType;
      fileName: string;
      mimeType: string;
      size: number;
      url: string;
    }[] = [];

    try {
      attachments = this.buildAttachments(files);
    } catch (error) {
      await this.removeUploadedFiles(files);
      throw error;
    }

    try {
      const ticket = await this.prisma.supportTicket.create({
        data: {
          userId,
          categoryId: dto.categoryId,
          typeId: dto.typeId,
          title: sanitizeText(dto.title),
          description: sanitizeText(dto.description),
          pageUrl: dto.pageUrl || null,
          browser: dto.browser || null,
          os: dto.os || null,
          device: dto.device || null,
          appVersion: dto.appVersion || null,
          attachments: {
            create: attachments,
          },
        },
        include: ticketInclude,
      });

      this.logger.log(`Support ticket created: ${ticket.id}`);
      return ticket;
    } catch (error) {
      await this.removeUploadedFiles(files);
      throw error;
    }
  }

  async findMyTickets(userId: string, page?: number, limit?: number) {
    const safePage = this.toPositiveInt(page, 1);
    const safeLimit = this.toPositiveInt(limit, 10, 100);
    const skip = (safePage - 1) * safeLimit;
    const where = { userId, deletedAt: null };

    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: safeLimit,
        include: ticketInclude,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findMyTicket(userId: string, id: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        ...ticketInclude,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!ticket) throw new NotFoundException("Reclamação não encontrada");
    return ticket;
  }

  async adminFindAll(query: AdminSupportQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      user,
      categoryId,
      typeId,
      status,
      userId,
    } = query;
    const safePage = this.toPositiveInt(page, 1);
    const safeLimit = this.toPositiveInt(limit, 10, 100);
    const skip = (safePage - 1) * safeLimit;

    const where: any = { deletedAt: null };
    if (categoryId) where.categoryId = categoryId;
    if (typeId) where.typeId = typeId;
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const searchConditions: any[] = [];
    if (search) {
      searchConditions.push(
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      );
    }
    if (user) {
      searchConditions.push(
        { user: { name: { contains: user, mode: "insensitive" } } },
        { user: { email: { contains: user, mode: "insensitive" } } },
      );
    }
    if (searchConditions.length > 0) where.OR = searchConditions;

    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: safeLimit,
        include: adminTicketInclude,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async adminFindOne(id: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, deletedAt: null },
      include: adminTicketInclude,
    });
    if (!ticket) throw new NotFoundException("Reclamação não encontrada");
    return ticket;
  }

  async adminUpdateStatus(
    adminId: string,
    id: string,
    dto: UpdateSupportStatusDto,
    audit?: AuditContext,
  ) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, deletedAt: null },
    });
    if (!ticket) throw new NotFoundException("Reclamação não encontrada");

    const previous = { status: ticket.status };

    const updated = await this.prisma.supportTicket.update({
      where: { id },
      data: {
        status: dto.status,
        resolvedAt:
          dto.status === SupportTicketStatus.RESOLVED ? new Date() : null,
      },
      include: adminTicketInclude,
    });

    await this.prisma.supportTicketStatusHistory.create({
      data: {
        ticketId: id,
        status: dto.status,
        changedBy: adminId,
        note: dto.note ? sanitizeText(dto.note) : null,
      },
    });

    await this.createAuditLog(
      adminId,
      "UPDATE",
      "SupportTicket",
      id,
      previous,
      {
        status: dto.status,
        note: dto.note || null,
      },
      audit,
    );

    await this.notifyUser(
      ticket.userId,
      "Status da reclamação atualizado",
      `Sua reclamação "${ticket.title}" foi marcada como ${this.statusLabel(dto.status)}.`,
      id,
    );

    return updated;
  }

  async adminAddNote(
    adminId: string,
    id: string,
    dto: AddSupportNoteDto,
    audit?: AuditContext,
  ) {
    await this.findTicketOrThrow(id);

    const note = await this.prisma.supportTicketNote.create({
      data: {
        ticketId: id,
        adminId,
        note: sanitizeText(dto.note),
      },
      include: {
        admin: { select: { id: true, name: true } },
      },
    });

    await this.createAuditLog(
      adminId,
      "CREATE",
      "SupportTicketNote",
      id,
      null,
      { note: dto.note },
      audit,
    );

    return note;
  }

  async adminRespond(
    adminId: string,
    id: string,
    dto: RespondSupportTicketDto,
    audit?: AuditContext,
  ) {
    const ticket = await this.findTicketOrThrow(id);

    const updated = await this.prisma.supportTicket.update({
      where: { id },
      data: {
        adminResponse: sanitizeText(dto.response),
        respondedBy: adminId,
        respondedAt: new Date(),
      },
      include: adminTicketInclude,
    });

    await this.notifyUser(
      ticket.userId,
      "Resposta à sua reclamação",
      `Sua reclamação "${ticket.title}" foi respondida pela nossa equipe.`,
      id,
    );

    await this.createAuditLog(
      adminId,
      "UPDATE",
      "SupportTicket",
      id,
      { adminResponse: ticket.adminResponse || null },
      { adminResponse: updated.adminResponse },
      audit,
    );

    return updated;
  }

  private async findTicketOrThrow(id: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, deletedAt: null },
    });
    if (!ticket) throw new NotFoundException("Reclamação não encontrada");
    return ticket;
  }

  private toPositiveInt(value: any, fallback: number, max?: number): number {
    const num =
      typeof value === "number" && Number.isFinite(value) ? value : fallback;
    const clamped = num > 0 ? Math.floor(num) : fallback;
    return max ? Math.min(clamped, max) : clamped;
  }

  private buildAttachments(files?: SupportUploadedFiles) {
    const attachments: {
      type: SupportAttachmentType;
      fileName: string;
      mimeType: string;
      size: number;
      url: string;
    }[] = [];

    const fields: {
      name: keyof SupportUploadedFiles;
      type: SupportAttachmentType;
    }[] = [
      { name: "images", type: SupportAttachmentType.IMAGE },
      { name: "documents", type: SupportAttachmentType.DOCUMENT },
      { name: "videos", type: SupportAttachmentType.VIDEO },
    ];

    for (const field of fields) {
      const uploaded = files?.[field.name] || [];
      if (uploaded.length > SUPPORT_UPLOAD_LIMITS[field.name].maxFiles) {
        throw new BadRequestException(
          `Máximo de ${SUPPORT_UPLOAD_LIMITS[field.name].maxFiles} arquivos no campo "${field.name}"`,
        );
      }
      for (const file of uploaded) {
        if (file.size > SUPPORT_UPLOAD_LIMITS[field.name].maxSize) {
          throw new BadRequestException(
            `Arquivo "${file.originalname}" excede o tamanho máximo permitido (${Math.floor(SUPPORT_UPLOAD_LIMITS[field.name].maxSize / (1024 * 1024))}MB)`,
          );
        }
        attachments.push({
          type: field.type,
          fileName: sanitizeFilename(file.originalname),
          mimeType: file.mimetype,
          size: file.size,
          url: `/support/files/${file.filename}`,
        });
      }
    }

    return attachments;
  }

  private async removeUploadedFiles(files?: SupportUploadedFiles) {
    if (!files) return;
    const all = [
      ...(files.images || []),
      ...(files.documents || []),
      ...(files.videos || []),
    ];
    await Promise.all(
      all.map((file) =>
        unlink(file.path).catch((error) =>
          this.logger.warn(
            `Falha ao remover upload ${file.filename}: ${error.message}`,
          ),
        ),
      ),
    );
  }

  private async notifyUser(
    userId: string,
    title: string,
    message: string,
    ticketId: string,
  ) {
    await this.notificationsService.create({
      userId,
      type: NotificationType.SUPPORT_RESPONSE,
      title,
      message,
      data: { ticketId },
    });
  }

  private async createAuditLog(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    oldValue: any,
    newValue: any,
    audit?: AuditContext,
  ) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldValue: oldValue ?? undefined,
        newValue,
        ipAddress: audit?.ip || null,
        userAgent: audit?.userAgent || null,
      },
    });
  }

  private statusLabel(status: SupportTicketStatus): string {
    const labels: Record<SupportTicketStatus, string> = {
      OPEN: "aberta",
      IN_PROGRESS: "em andamento",
      RESOLVED: "resolvida",
      CLOSED: "fechada",
    };
    return labels[status];
  }
}
